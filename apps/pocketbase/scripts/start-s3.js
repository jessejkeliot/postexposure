import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. Resolve root .env path (works in monorepos)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootEnvPath = path.resolve(__dirname, '../../../.env'); // slightly magic path??

// 2. Load .env using Node's native process.loadEnvFile (Node 20.6+)
try {
  process.loadEnvFile(rootEnvPath);
} catch (err) {
  console.warn(`[s3] Warning: Could not load .env from ${rootEnvPath}`);
}

const accessKey = process.env.S3_ACCESS_KEY || 'minioadmin';
const secretKey = process.env.S3_SECRET || 'minioadmin';

// Resolve a persistent data directory next to the pocketbase app
const minioDataDir = path.resolve(__dirname, '../minio_data');

console.log('Starting local S3 (MinIO) container...');

// Try to start an existing stopped container first (preserves data)
try {
  execSync('docker start local-s3', { stdio: 'ignore' });
  console.log('MinIO container restarted (existing data preserved).');
  console.log(`Access Key: ${accessKey}`);
  console.log(`Admin Console: http://127.0.0.1:9001`);
  process.exit(0);
} catch {
  // Container doesn't exist yet — create a new one below
}

// Create a new container with a host volume mount so data survives restarts
const dockerCmd = `docker run -d \
  --name local-s3 \
  -p 9000:9000 \
  -p 9001:9001 \
  -v "${minioDataDir}:/data" \
  -e MINIO_ROOT_USER="${accessKey}" \
  -e MINIO_ROOT_PASSWORD="${secretKey}" \
  quay.io/minio/minio server /data --console-address ":9001"`;

try {
  const containerId = execSync(dockerCmd).toString().trim();
  console.log(`MinIO running - Container ID: ${containerId.substring(0, 12)}`);
  console.log(`Data persisted to: ${minioDataDir}`);
  console.log(`Access Key: ${accessKey}`);
  console.log(`Admin Console: http://127.0.0.1:9001`);
} catch (error) {
  console.error('Failed to start MinIO container:', error.message);
  process.exit(1);
}