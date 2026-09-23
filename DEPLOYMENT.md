# Deployment Guide for Post Exposure

This guide outlines the complete setup and deployment procedure for the **Post Exposure** cinema & magazine platform.

---

## Architecture Overview

The system consists of three primary components:
1. **Frontend (`apps/frontend`)**: SvelteKit 5 application handling SSR, auth endpoints, ticket viewing/QR generation, admin verification, and Stripe checkout.
2. **Backend & Database (`apps/pocketbase`)**: PocketBase (Go binary + SQLite + file storage + migrations).
3. **External Services**:
   - **Stripe**: Handles ticket purchasing, subscriptions, and webhooks.
   - **S3 / MinIO**: Media asset storage (posters, stills, magazine PDFs).

---

## 1. Deploying PocketBase (Backend)

PocketBase is a single self-contained binary backed by SQLite. It can be hosted on any Linux VPS (DigitalOcean, Hetzner), Fly.io, Railway, or Docker.

### Requirements
- A server with persistent disk storage (to preserve SQLite database files under `pb_data/`).
- Port `8090` exposed to your internal network or reverse proxy.

### Steps
1. **Transfer Files**:
   Copy the `pocketbase` executable and the migrations folder `apps/pocketbase/pb_migrations/` to your server.
   ```
   /var/www/pocketbase/
   ├── pocketbase
   ├── pb_migrations/
   │   └── 123456789_base_migration.js
   └── pb_data/ (created automatically)
   ```

2. **Run Migrations & Start Service**:
   When PocketBase starts, it will automatically execute `123456789_base_migration.js` to create all collections (`users`, `sessions`, `accounts`, `verifications`, `screenings`, `films`, `seasons`, `tickets`, `purchases`, `issues`, etc.).

   ```bash
   ./pocketbase serve --http="0.0.0.0:8090"
   ```

3. **Create Superuser Admin**:
   ```bash
   ./pocketbase superuser create admin@magazine.com <YOUR_SECURE_PASSWORD>
   ```

4. **Run Systemd Service (VPS / Linux)**:
   Create `/etc/systemd/system/pocketbase.service`:
   ```ini
   [Unit]
   Description=PocketBase Service
   After=network.target

   [Service]
   Type=simple
   User=www-data
   Group=www-data
   WorkingDirectory=/var/www/pocketbase
   ExecStart=/var/www/pocketbase/pocketbase serve --http="127.0.0.1:8090"
   Restart=always
   RestartSec=5

   [Install]
   WantedBy=multi-user.target
   ```
   Enable and start:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable --now pocketbase
   ```

---

## 2. S3 / Object Storage Configuration

Configure S3 or MinIO storage for film stills, magazine covers, and downloadable PDFs:

1. Log into the PocketBase Admin UI (`https://pb.yourdomain.com/_/`).
2. Go to **Settings → Files storage**.
3. Enable **S3 storage** and enter:
   - **Bucket**: `my-media-bucket`
   - **Region**: `us-east-1` (or your S3 region)
   - **Endpoint**: `https://s3.amazonaws.com` (or your MinIO / Cloudflare R2 endpoint)
   - **Access Key** & **Secret Key**
   - **Force path style**: `true` (if using MinIO/R2) or `false` (standard S3)

---

## 3. Stripe Dashboard Setup

1. **API Keys**:
   - Retrieve `STRIPE_SECRET_KEY` (`sk_live_...` or `sk_test_...`) and `PUBLIC_STRIPE_KEY` (`pk_live_...` or `pk_test_...`) from **Stripe Dashboard → Developers → API keys**.

2. **Webhooks**:
   - Go to **Developers → Webhooks → Add endpoint**.
   - **Endpoint URL**: `https://yourdomain.com/api/stripe/webhook`
   - **Events to send**:
     - `checkout.session.completed`
   - Reveal the **Signing Secret** (`whsec_...`) and assign it to `STRIPE_WEBHOOK_SECRET`.

3. **Branding**:
   - Configure your cinema name, logo, and theme colors in Stripe Checkout Settings.

---

## 4. Deploying the SvelteKit Frontend

### Production Adapter
If deploying to a Node.js server/Docker container:
```bash
pnpm --filter frontend add -D @sveltejs/adapter-node
```

Update `apps/frontend/svelte.config.js` (if using adapter-node):
```js
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({ out: 'build' })
	}
};

export default config;
```

*(Note: If deploying to Vercel or Cloudflare, `@sveltejs/adapter-auto` works automatically.)*

### Environment Variables

Set the following environment variables in your deployment platform / `.env`:

```env
# PocketBase Connection
POCKETBASE_URL=https://pb.yourdomain.com
POCKETBASE_ADMIN_EMAIL=admin@magazine.com
POCKETBASE_ADMIN_PASSWORD=your_secure_pb_admin_password

# Better Auth
BETTER_AUTH_SECRET=generate_a_random_64_character_hex_or_alphanumeric_string
BETTER_AUTH_URL=https://yourdomain.com

# Stripe Integration
STRIPE_SECRET_KEY=sk_live_...
PUBLIC_STRIPE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# S3 Configuration (Optional fallback for direct backend uploads)
S3_FORCE_PATH_STYLE=true
S3_ENABLED=true
S3_BUCKET=my-media-bucket
S3_REGION=us-east-1
S3_ENDPOINT=https://s3.your-endpoint.com
S3_ACCESS_KEY=your_access_key
S3_SECRET=your_secret_key
```

### Build & Run
```bash
# Install dependencies
pnpm install

# Build frontend
pnpm --filter frontend build

# Start Node server
NODE_ENV=production PORT=3000 node apps/frontend/build/index.js
```

---

## 5. Reverse Proxy & Domain Routing (Caddy / Nginx)

Use Caddy or Nginx for SSL certificates and domain routing:

### Example Caddyfile
```caddy
# Frontend Application
yourdomain.com {
    reverse_proxy 127.0.0.1:3000
}

# PocketBase Backend API & Admin UI
pb.yourdomain.com {
    reverse_proxy 127.0.0.1:8090
}
```

### Example Nginx Configuration
```nginx
server {
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    server_name pb.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8090;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 100M;
    }
}
```

---

## 6. Post-Deployment Verification Checklist

1. **Authentication**: Register a new user at `/login` and verify session persistence.
2. **Ticket Purchase**:
   - Go to `/calendar` → select a film screening → `/buy`.
   - Complete checkout via Stripe.
   - Confirm redirect to `/tickets/success` and ticket appearance on `/tickets`.
3. **QR Admission Verification**:
   - Sign in with an account having `role: "admin"`.
   - Scan the ticket QR code (or visit `/tickets/verify/<ticket-id>`).
   - Confirm **"TICKET VERIFIED & ADMITTED"** acceptance screen appears and second scan shows **"TICKET ALREADY SCANNED"**.
4. **Subscription Gating**:
   - Verify `/subscribe` is accessible when logged out or unsubscribed.
   - Verify 20% ticket discounts apply automatically when logged in as a subscriber.
