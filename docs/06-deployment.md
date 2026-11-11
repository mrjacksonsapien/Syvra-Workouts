# 06 — Deployment

> The app must work online. Recommended order: **database → API → front end**.

## How deployment works

None of the hosts need a deploy command from you. Each one is connected to the GitHub repo once (in its dashboard). From then on, **every `git push` to `main`** triggers: pull the code → run the configured **build command** → (for the API) run the **start command** → serve. This is continuous deployment.

**Branches:** work happens on `develop`. Nothing is pushed to `main` directly; `main` only changes when a Pull Request `develop → main` is merged, so **merging a PR = deploying to production**. Vercel also builds a **preview URL** for `develop`, which is useful to check the front end before merging. Render only deploys `main`.

| Piece | Host | What runs there | Free-plan caveat |
|---|---|---|---|
| Database | **Neon** | Managed PostgreSQL | Compute suspends after ~5 min idle; wakes in < 1 s on the next query |
| API | **Render** (Web Service) | `node apps/api/dist/server.js`, a long-running process | **Sleeps after 15 min idle**; the first request then takes ~30–60 s |
| Website | **Vercel** | Static files (`vite build` output) on a global CDN | none relevant |

### Neon in short
Serverless PostgreSQL: storage (your data) and compute (the Postgres engine) are separate, so compute can scale to zero when idle and restart instantly. You get a standard connection string, a web SQL editor, and **branches** (instant copy-on-write copies of the database). We only need the main branch.

### Render in short
Runs a Node server for you, like a small managed server. It sets `PORT`, and the API must listen on `process.env.PORT`.

### Vercel in short
Builds the front end and serves the resulting HTML/JS/CSS from servers worldwide. It also gives a **preview URL** for every branch/PR.

## Environment variables

Secrets live **only** in each host's dashboard (and in local `.env` files, which are **gitignored**). Each app commits a `.env.example` with placeholder values.

| Variable | Where | Example | Notes |
|---|---|---|---|
| `DATABASE_URL` | Render (API) | `postgresql://user:***@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require` | Use Neon's **pooled** connection string (`-pooler` host). Secret. |
| `CORS_ORIGIN` | Render (API) | `https://syvra-workouts.vercel.app` | Exact Vercel URL; comma-separated if several |
| `NODE_ENV` | Render (API) | `production` | |
| `PORT` | Render (API) | set by Render | Local default 3000 |
| `VITE_API_URL` | Vercel (web) | `https://syvra-workouts-api.onrender.com` | **Public**: embedded into the JS bundle at build time, so never put secrets in `VITE_*` variables |

`apps/api/src/config/env.ts` validates these with zod at startup and **crashes early** with a clear message if one is missing.

## Root scripts used by the hosts

```jsonc
// package.json (root)
"scripts": {
  "build:shared": "npm run build -w packages/shared",
  "build:api":    "npm run build:shared && npm run build -w apps/api",
  "build:web":    "npm run build:shared && npm run build -w apps/web",
  "start:api":    "npm run start -w apps/api"
}
```

## Step 1: Database (Neon)

1. Create a Neon project (region close to the Render region, e.g. AWS `us-east`), Postgres 18.
2. Copy the **pooled** connection string.
3. Load schema + seed, either with `psql "$DATABASE_URL" -f db/schema.sql` then `psql "$DATABASE_URL" -f db/seed.sql` (needs `psql` locally, or `docker run --rm postgres:18-alpine psql …`) or by pasting `db/schema.sql` then `db/seed.sql` into the Neon SQL Editor.
4. Check: `SELECT count(*) FROM exercises;` → 15.

## Step 2: API (Render)

1. New → **Web Service** → connect the GitHub repo; runtime **Node**; branch `main`; root directory: repo root.
2. Build command: `npm ci --include=dev && npm run build:api` (`--include=dev` is needed because `NODE_ENV=production` makes `npm ci` skip devDependencies, including `typescript` and `@types/node`)
3. Start command: `npm run start:api`
4. Health check path: `/health`
5. Environment: `DATABASE_URL`, `NODE_ENV=production`, `CORS_ORIGIN` (temporarily `http://localhost:5173`; updated in step 4).
6. Deploy, then check `https://<api>.onrender.com/health` → `{"status":"ok","database":"ok"}` and `/api/exercises`.

The pg `Pool` uses SSL (Neon requires it; `sslmode=require` in the URL) and a small `max` (e.g. 5).

*Alternative:* Render can build `apps/api/Dockerfile` instead (runtime "Docker"). Not needed; Node runtime is simpler.

## Step 3: Front end (Vercel)

1. New Project → import the GitHub repo.
2. Framework preset: **Vite**. Root directory: repo root.
3. Build command: `npm run build:web`. Output directory: `apps/web/dist`. Install command: `npm ci`.
4. Environment: `VITE_API_URL=https://<api>.onrender.com`.
5. A root `vercel.json` (Vercel reads it from the project root, which is the repo root) contains the build settings and the SPA rewrite: `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`.
6. Deploy; note the production URL.

## Step 4: Connect them

1. Set Render's `CORS_ORIGIN` to the Vercel production URL → Render redeploys.
2. Open the site in a **private window**, then run the manual checklist in [05-testing](05-testing.md#manual-end-to-end-checklist-before-release).
3. Put the three links at the top of the README.

## Before sharing the links
- Hit `/health` a minute before sending the links (or mention the cold start in the README) so the first visitor doesn't wait for Render to wake up.
- Make sure the GitHub repo is public (or shared), and that no `.env` or connection string is in the Git history.

## Local vs production

| | Local | Production |
|---|---|---|
| DB | Docker `postgres:18-alpine`, user `syvra` / `syvra` (dev-only, not secret) | Neon |
| API | `docker compose up` or `npm run dev -w apps/api` (tsx watch) on :3000 | Render |
| Web | `docker compose up` or `npm run dev -w apps/web` (Vite) on :5173 | Vercel |
| Config | `.env` files (gitignored), compose `environment:` | Host dashboards |
