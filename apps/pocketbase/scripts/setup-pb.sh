#!/bin/sh

# Load environment variables from .env file if it exists
if [ -f .env ]; then
  export $(cat .env | xargs)
fi

# 1. Upsert superuser credentials
pocketbase superuser upsert "${POCKETBASE_ADMIN_EMAIL}" "${POCKETBASE_ADMIN_PASSWORD}"

# 2. Start PocketBase in the background briefly to apply API configurations
pocketbase serve --http="127.0.0.1:8090" &
PB_PID=$!

# Wait for server process to spin up
sleep 2

# 3. Authenticate and obtain Superuser Bearer Token
TOKEN=$(curl -s -X POST http://127.0.0.1:8090/api/admins/auth-with-password \
  -H "Content-Type: application/json" \
  -d "{\"identity\":\"${POCKETBASE_ADMIN_EMAIL}\",\"password\":\"${POCKETBASE_ADMIN_PASSWORD}\"}" \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# 4. Patch S3 configurations directly via REST API
curl -s -X PATCH http://127.0.0.1:8090/api/settings \
  -H "Authorization: ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "s3": {
      "enabled": true,
      "bucket": "'"${S3_BUCKET}"'",
      "region": "'"${S3_REGION}"'",
      "endpoint": "'"${S3_ENDPOINT}"'",
      "accessKey": "'"${S3_ACCESS_KEY}"'",
      "secret": "'"${S3_SECRET}"'",
      "forcePathStyle": true
    }
  }'

# 5. Terminate the background PocketBase instance
kill $PB_PID