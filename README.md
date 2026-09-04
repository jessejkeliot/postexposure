# Post Exposure Magazine

A modern web application built with SvelteKit and PocketBase.

## Prerequisites

- **Node.js** (v20.6+ recommended)
- **pnpm** (preferred) or **npm**
- **Docker Desktop** (required for local S3 storage)

## Getting Started

### 1. Repository Setup

Clone the repository, navigate to the root directory, and set up your environment variables:

```zsh
git clone 
cd postexposure
cp .env.sample .env
```

### Local S3 Storage (MinIO)
If you're developing without connecting to AWS or GCP
1. Ensure Docker Desktop is running
2. Spin up the local MinIO bucket using
```zsh
pnpm --filter pocketbase run dev:s3:start
```

*(stop the MinIO instance by running ```zsh pnpm --filter pocketbase run dev:s3:stop```)*

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


Then in a seperate terminal run 
```zsh pnpm run dev:frontend``` which will start the frontend dev server.
Open http://localhost:5173/ in your browser of choice
or if you want to view the page on another device
Stop the webserver with Ctrl+C and then run
```pnpm --filter frontend run dev --host```

## Stack

Backend Database - pocketbase (SQLite)
Backend Dev Bucket - MinIO
Frontend - Sveltekit
Skeleton - UI Library
TailwindCSS - Styling
