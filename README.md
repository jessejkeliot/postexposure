# Post Exposure Magazine

A web application for the Post Exposure magazine built with SvelteKit and PocketBase.

## Stack

- Backend Database - [PocketBase (SQLite)](https://pocketbase.io/)
- Backend Dev Bucket - [MinIO](https://github.com/minio/minio)
- Frontend - [Sveltekit](https://svelte.dev/docs/kit/introduction)
- UI Library - [Skeleton](https://www.skeleton.dev/)
- Styling - [TailwindCSS](https://tailwindcss.com/)

### Prerequisites

- **Node.js** (v20.6+ recommended)
- **pnpm** (preferred) or **npm**
- **Docker Desktop** (required for local S3 storage) (or OrbStack)

## Getting Started

### 1. Repository Setup

Clone the repository, navigate to the root directory, and set up your environment variables:

```zsh
git clone 
cd postexposure
pnpm install
cp .env.sample .env
# Replace the sample variables in .env with your keys
```

### Local S3 Storage (MinIO)
If you're developing without connecting to AWS or GCP
1. Ensure Docker Desktop is running
2. Spin up the local MinIO bucket using
```zsh
pnpm --filter pocketbase run dev:s3:start
```

Resetting development
*(stop the MinIO instance by running ```zsh pnpm --filter pocketbase run dev:s3:stop```)*
*(delete the MinIO instance by running ```zsh pnpm --filter pocketbase run dev:s3:delete```)* 
(s3 data deletion)

### Configure Remote S3 Storage (Cloudflare R2, AWS, etc.)

PocketBase stores uploaded media either on local disk (`apps/pocketbase/pb_data/storage`) or in an S3-compatible bucket. To send media to a remote bucket instead of local disk, point PocketBase's file storage at it — either through the Admin UI (**Settings → Files storage**) or with the helper script below.

The script authenticates to PocketBase as a superuser and updates `settings.s3`:

```zsh
# Preview the resolved config without changing anything
pnpm --filter pocketbase run pb:configure-s3 -- --dry-run

# Test the bucket connection only
pnpm --filter pocketbase run pb:configure-s3 -- --test-only

# Apply (prompts for confirmation before touching a non-localhost server)
pnpm --filter pocketbase run pb:configure-s3
```

Required environment variables (read from the root `.env`, or a file passed with `--env-file`):

```env
POCKETBASE_URL=https://api.yourdomain.com
POCKETBASE_ADMIN_EMAIL=admin@magazine.com
POCKETBASE_ADMIN_PASSWORD=your_superuser_password

S3_BUCKET=my-media-bucket
S3_ACCESS_KEY=your_access_key
S3_SECRET=your_secret_key
S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
S3_REGION=auto
S3_FORCE_PATH_STYLE=false
```

For **Cloudflare R2** specifically:

- Endpoint: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`
- Region: `auto`
- Force path style: `false`
- Create an R2 API token with **Object Read & Write** and use its Access Key ID / Secret
- Keep the R2 credentials out of your dev `.env` by using a separate file, e.g.
  ```zsh
  pnpm --filter pocketbase run pb:configure-s3 -- --env-file .env.r2
  ```

Once configured, uploads made in the PocketBase dashboard go straight to the bucket — no per-file step in the Cloudflare dashboard is needed. Files already written to `pb_data/storage` are **not** migrated automatically; re-upload them or copy them into the bucket using the same object keys (`<collectionId>/<recordId>/<filename>`).

Run `pnpm --filter pocketbase run pb:configure-s3 -- --help` for all options.

### Backend Setup

In one terminal tab run the initialisation scripts (this sets the admin password)
```zsh
pnpm run dev:setup
# then to start the pocketbase dev server   
pnpm run dev:backend
```
then once the db is running if you want it filled with filler articles run
```pnpm --filter pocketbase run pb:populate```
To remove all data from the pocketbase backend just run
```rm -rf apps/pocketbase/pb_data```

### Frontent Setup

Then in a seperate terminal run 
```zsh
pnpm run dev:frontend
``` 
which will start the frontend dev server.
Open http://localhost:5173/ in your browser of choice
or if you want to view the page on another device
Stop the webserver with Ctrl+C and then run
```pnpm --filter frontend run dev --host```

### Total Reset
To totally reset the development environment to its initial state just stop the pocketbase process (Ctrl+C in its terminal window) then run:
```zsh
rm -rf apps/pocketbase/pb_data
pnpm --filter pocketbase run dev:s3:delete
# then optionally reset the .env file with
cp .env.sample .env
```

Matching the rest of the site's appearance I want you to add a login/logout system using better auth.
There needs to be a way to view the tickets associated with your account in the tickets page. Make a minimilistic component that displays all the relevant information about your ticket and a QR code which can then be scanned by a phone logged in as admin and so the qr code can just represent a custom url which if the scanning device's browser is authenticated, then the server sends back a Acceptance webpage and puts that ticket down as scanned (the acceptance webpage should only show up if that specific ticket hasn't been scanned already and it must exist). There needs to be a section for managing your account and viewing your previous purchases. The subscribe page should only show up if you are not logged in or you are logged in but aren't subscribed and on the page there should be a way to purchase a subscription using stripe.
