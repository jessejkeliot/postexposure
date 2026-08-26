# Post Exposure Magazine Site

## Getting Started

You need to have node installed and a package manager like npm or pnpm(what I use)

First clone the repo

CD into the project root

copy the .env.sample into .env

Setting up the backend server for development:

In one terminal shell (this sets the admin password) write
pnpm run dev:setup
then
pnpm run dev:backend
then if you want the db filled with filler articles run
pnpm --filter pocketbase run populate ()

Then in a seperate terminal run pnpm run dev:frontend which will start the dev server.
Open http://localhost:5173/ in your browser of choice
or if you want to view the page on another device
Stop the webserver with Ctrl+C and then run
pnpm --filter frontend run dev --host

## Stack

Backend - pocketbase (SQLite)
Frontend - Sveltekit
Skeleton - UI Library
TailwindCSS - Styling