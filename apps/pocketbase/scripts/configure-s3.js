import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. CLI flags (parsed before loading env so --help / --env-file work)
const args = process.argv.slice(2);
const hasFlag = (flag) => args.includes(flag);
const getFlagValue = (flag) => {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : undefined;
};
const DRY_RUN = hasFlag('--dry-run');
const TEST_ONLY = hasFlag('--test-only');
const NO_TEST = hasFlag('--no-test');
const ASSUME_YES = hasFlag('--yes') || hasFlag('-y');

if (hasFlag('--help') || hasFlag('-h')) {
  console.log(`
Usage: node scripts/configure-s3.js [options]

Configures PocketBase's S3 file storage (e.g. Cloudflare R2) via the Settings API.

Required env vars:
  POCKETBASE_URL              Target PocketBase base URL
  POCKETBASE_ADMIN_EMAIL      Superuser email
  POCKETBASE_ADMIN_PASSWORD   Superuser password
  S3_BUCKET                   Bucket name
  S3_ACCESS_KEY               S3 / R2 access key id
  S3_SECRET                   S3 / R2 secret access key

Optional env vars:
  S3_ENDPOINT          S3 / R2 endpoint (default: https://s3.amazonaws.com)
  S3_REGION            Region (default: "auto" for R2, else "us-east-1")
  S3_FORCE_PATH_STYLE  "true" | "false" (default: false for R2, true for localhost)

Options:
  --env-file <path>   Load a specific env file (default: monorepo root .env)
  --dry-run           Print the resolved config and payload without contacting the server
  --test-only         Only test the S3 connection, do not save the settings
  --no-test           Skip the S3 connection test before saving
  --yes, -y           Skip the confirmation prompt
  --help, -h          Show this help

Notes for Cloudflare R2: set S3_ENDPOINT to
https://<ACCOUNT_ID>.r2.cloudflarestorage.com, S3_REGION=auto and
S3_FORCE_PATH_STYLE=false. Use --env-file to keep R2 creds out of the dev .env.
`);
  process.exit(0);
}

// 2. Resolve monorepo root and load .env (mirrors setup-pb.js)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const explicitEnvFile = getFlagValue('--env-file');
let rootEnvPath;

if (explicitEnvFile) {
  rootEnvPath = path.resolve(process.cwd(), explicitEnvFile);
} else {
  rootEnvPath = path.resolve(__dirname, '../../../.env');
  try {
    const gitRoot = execSync('git rev-parse --show-toplevel', {
      stdio: ['ignore', 'pipe', 'ignore']
    })
      .toString()
      .trim();
    rootEnvPath = path.join(gitRoot, '.env');
  } catch {
    // Fall back to the relative parent directory
  }
}

try {
  process.loadEnvFile(rootEnvPath);
  console.log(`Loaded environment from: ${rootEnvPath}`);
} catch {
  console.warn(`Could not load .env at ${rootEnvPath} (continuing with process env).`);
}

// 3. Resolve configuration
const pbUrl = (process.env.PB_URL || process.env.POCKETBASE_URL || 'http://127.0.0.1:8090').replace(/\/+$/, '');
const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

const s3Bucket = process.env.S3_BUCKET;
const s3AccessKey = process.env.S3_ACCESS_KEY;
const s3Secret = process.env.S3_SECRET;
const s3Endpoint = process.env.S3_ENDPOINT || 'https://s3.amazonaws.com';

const isR2 = /\.r2\.cloudflarestorage\.com/.test(s3Endpoint);
const isLocalEndpoint = /localhost|127\.0\.0\.1|minio|localstack/.test(s3Endpoint);

const s3Region = process.env.S3_REGION || (isR2 ? 'auto' : 'us-east-1');

const forcePathStyle =
  process.env.S3_FORCE_PATH_STYLE !== undefined
    ? process.env.S3_FORCE_PATH_STYLE === 'true'
    : isLocalEndpoint;

const s3Enabled = process.env.S3_ENABLED !== 'false';

const s3Config = {
  enabled: s3Enabled,
  bucket: s3Bucket,
  region: s3Region,
  endpoint: s3Endpoint,
  accessKey: s3AccessKey,
  secret: s3Secret,
  forcePathStyle
};

const mask = (value) => (value ? `${value.slice(0, 4)}…${value.slice(-2)}` : '(unset)');

function printConfig() {
  console.log('\nTarget PocketBase:', pbUrl);
  console.log('Superuser:        ', adminEmail || '(unset)');
  console.log('S3 config:');
  console.log('  enabled:       ', s3Enabled);
  console.log('  bucket:        ', s3Bucket || '(unset)');
  console.log('  region:        ', s3Region);
  console.log('  endpoint:      ', s3Endpoint);
  console.log('  accessKey:     ', mask(s3AccessKey));
  console.log('  secret:        ', s3Secret ? '********' : '(unset)');
  console.log('  forcePathStyle:', forcePathStyle);
  console.log('');
}

function validate(skipCredentials = false) {
  const missing = [];
  if (!skipCredentials) {
    if (!adminEmail) missing.push('POCKETBASE_ADMIN_EMAIL');
    if (!adminPassword) missing.push('POCKETBASE_ADMIN_PASSWORD');
  }
  if (!s3Bucket) missing.push('S3_BUCKET');
  if (!s3AccessKey) missing.push('S3_ACCESS_KEY');
  if (!s3Secret) missing.push('S3_SECRET');
  if (missing.length) {
    throw new Error(`Missing required env var(s): ${missing.join(', ')}`);
  }
}

function warnR2() {
  if (!isR2) return;
  const warnings = [];
  if (s3Region !== 'auto') {
    warnings.push(`S3_REGION is "${s3Region}" but Cloudflare R2 expects "auto".`);
  }
  if (forcePathStyle) {
    warnings.push('S3_FORCE_PATH_STYLE is "true" but Cloudflare R2 expects "false".');
  }
  if (warnings.length) {
    console.warn('\n⚠  R2 endpoint detected with non-R2 defaults (likely from your dev .env):');
    for (const w of warnings) console.warn(`   - ${w}`);
    console.warn('   Pass --env-file with R2 values, or override the vars explicitly.\n');
  }
}

async function authenticate() {
  const res = await fetch(`${pbUrl}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: adminEmail, password: adminPassword })
  });
  if (!res.ok) {
    throw new Error(`Superuser auth failed (${res.status}): ${await res.text()}`);
  }
  const { token } = await res.json();
  return token;
}

async function getCurrentS3(token) {
  const res = await fetch(`${pbUrl}/api/settings`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    throw new Error(`Failed to read settings (${res.status}): ${await res.text()}`);
  }
  const settings = await res.json();
  return settings.s3 || {};
}

async function testConnection(token) {
  // Flattened S3 config + filesystem name, per TestS3Filesystem form.
  const raw = await fetch(`${pbUrl}/api/settings/test/s3`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ filesystem: 'storage', ...s3Config })
  });

  if (raw.status === 404) {
    console.warn('S3 connection test endpoint not available on this PocketBase version — skipping.');
    return true;
  }
  if (!raw.ok) {
    let detail = await raw.text();
    try {
      detail = JSON.parse(detail).message || detail;
    } catch {}
    throw new Error(`S3 connection test failed (${raw.status}): ${detail}`);
  }
  console.log('S3 connection test passed.');
  return true;
}

async function applySettings(token) {
  const res = await fetch(`${pbUrl}/api/settings`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ s3: s3Config })
  });
  if (!res.ok) {
    let detail = await res.text();
    try {
      detail = JSON.parse(detail).message || detail;
    } catch {}
    throw new Error(`Failed to update S3 settings (${res.status}): ${detail}`);
  }
  console.log('S3 settings saved.');
}

async function confirm() {
  if (ASSUME_YES) return true;
  const isLocal = /127\.0\.0\.1|localhost/.test(pbUrl);
  if (isLocal) return true;

  process.stdout.write(`Apply S3 settings to ${pbUrl}? [y/N] `);
  const answer = await new Promise((resolve) => {
    process.stdin.once('data', (data) => resolve(data.toString().trim()));
  });
  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
}

async function main() {
  validate(DRY_RUN);
  printConfig();
  warnR2();

  if (DRY_RUN) {
    console.log('Dry run — no changes made. PATCH payload:');
    console.log(JSON.stringify({ s3: { ...s3Config, secret: '***' } }, null, 2));
    return;
  }

  const token = await authenticate();

  const current = await getCurrentS3(token);
  console.log('Current S3 settings on server:', {
    enabled: current.enabled,
    bucket: current.bucket,
    endpoint: current.endpoint,
    forcePathStyle: current.forcePathStyle
  });
  console.log('');

  if (!NO_TEST) {
    await testConnection(token);
  }

  if (TEST_ONLY) {
    console.log('Test-only mode — settings not saved.');
    return;
  }

  if (!(await confirm())) {
    console.log('Aborted. No changes made.');
    return;
  }

  await applySettings(token);
  console.log('Done. New uploads through the PocketBase dashboard will now go to your S3/R2 bucket.');
  console.log('Note: files already stored in pb_data/storage are NOT migrated automatically.');
}

main().catch((err) => {
  console.error('configure-s3 failed:', err.message);
  process.exit(1);
});
