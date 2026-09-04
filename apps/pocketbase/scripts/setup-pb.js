import { spawn, execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. Resolve monorepo root and load .env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
let rootEnvPath = path.resolve(__dirname, '../../../.env');

try {
  // Use git root if available
  const gitRoot = execSync('git rev-parse --show-toplevel', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  rootEnvPath = path.join(gitRoot, '.env');
} catch {
  // Fall back to relative parent directory
}

try {
  process.loadEnvFile(rootEnvPath);
  console.log(`Loaded environment from: ${rootEnvPath}`);
} catch {
  console.warn(`Could not load .env at ${rootEnvPath}`);
}

const PB_URL = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';
const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL || 'admin@magazine.com';
const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD || 'SuperSecretPassword123';

const s3Bucket = process.env.S3_BUCKET || 'media-bucket';
const s3Endpoint = process.env.S3_ENDPOINT || 'http://127.0.0.1:9000';
const s3AccessKey = process.env.S3_ACCESS_KEY || 'minioadmin';
const s3Secret = process.env.S3_SECRET || 'minioadmin';
const s3Region = process.env.S3_REGION || 'us-east-1';

// Dynamic forcePathStyle evaluation
const isLocalEndpoint = /localhost|127\.0\.0\.1|minio|localstack/.test(s3Endpoint);
const forcePathStyle = process.env.S3_FORCE_PATH_STYLE !== undefined 
  ? process.env.S3_FORCE_PATH_STYLE === 'true' 
  : isLocalEndpoint;

// Helper: Poll health endpoint until PocketBase responds
async function waitForPocketBase(retries = 20, delay = 250) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`${PB_URL}/api/health`);
      if (res.ok) return true;
    } catch {
      // Server not up yet
    }
    await new Promise((r) => setTimeout(r, delay));
  }
  throw new Error('PocketBase server timed out during startup.');
}

async function runSetup() {
  console.log('Starting PocketBase Setup...');

  // 1. Ensure MinIO Container & Bucket exist locally (if applicable)
  if (isLocalEndpoint) {
    try {
      console.log(`Ensuring local MinIO container & bucket "${s3Bucket}" exist...`);
      const bucketCmd = `docker exec local-s3 sh -c "
        mc alias set local http://127.0.0.1:9000 '${s3AccessKey}' '${s3Secret}' && \
        mc mb --ignore-existing local/${s3Bucket} && \
        mc anonymous set download local/${s3Bucket}
      "`;
      execSync(bucketCmd, { stdio: 'ignore' });
      console.log(`Bucket "${s3Bucket}" verified.`);
    } catch {
      console.warn('Could not configure MinIO bucket via Docker. Ensure MinIO is running.');
    }
  }

  // 2. Upsert Superuser Credentials
  console.log('Upserting Superuser account...');
  execSync(`pocketbase superuser upsert "${adminEmail}" "${adminPassword}"`, { stdio: 'inherit' });

  // 3. Start PocketBase in background process
  console.log('Starting PocketBase instance...');
  const pbProcess = spawn('pocketbase', ['serve', '--http=127.0.0.1:8090'], { stdio: 'ignore' });

  try {
    await waitForPocketBase();
    console.log('PocketBase server is healthy!');

    // 4. Authenticate against superuser endpoint (PB v0.22+)
    console.log('Authenticating superuser...');
    const authRes = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: adminEmail, password: adminPassword }),
    });

    if (!authRes.ok) {
      throw new Error(`Auth failed with status ${authRes.status}: ${await authRes.text()}`);
    }

    const { token } = await authRes.json();

    // 5. Patch S3 settings
    console.log('Patching S3 configuration...');
    const settingsRes = await fetch(`${PB_URL}/api/settings`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        s3: {
          enabled: process.env.S3_ENABLED !== 'false',
          bucket: s3Bucket,
          region: s3Region,
          endpoint: s3Endpoint,
          accessKey: s3AccessKey,
          secret: s3Secret,
          forcePathStyle: forcePathStyle,
        },
      }),
    });

    if (!settingsRes.ok) {
      throw new Error(`Failed to update S3 settings: ${await settingsRes.text()}`);
    }

    console.log('Setup finished successfully! S3 integration configured.');
  } finally {
    // Cleanly kill background process
    pbProcess.kill('SIGTERM');
  }
}

runSetup().catch((err) => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});