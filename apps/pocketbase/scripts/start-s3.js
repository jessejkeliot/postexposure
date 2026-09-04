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

console.log('Starting local S3 (MinIO) container...');

try {
  // 3. Remove existing container if it exists
  execSync('docker rm -f local-s3', { stdio: 'ignore' });
} catch {
  // Ignore error if container didn't exist
}

// 4. Run Docker container with injected JS env variables
const dockerCmd = `docker run -d \
  --name local-s3 \
  -p 9000:9000 \
  -p 9001:9001 \
  -e MINIO_ROOT_USER="${accessKey}" \
  -e MINIO_ROOT_PASSWORD="${secretKey}" \
  minio/minio server /data --console-address ":9001"`;

try {
  const containerId = execSync(dockerCmd).toString().trim();
  console.log(`MinIO running - Container ID: ${containerId.substring(0, 12)}`);
  console.log(`Access Key: ${accessKey}`);
  console.log(`Admin Console: http://127.0.0.1:9001`);
} catch (error) {
  console.error('Failed to start MinIO container:', error.message);
  process.exit(1);
}