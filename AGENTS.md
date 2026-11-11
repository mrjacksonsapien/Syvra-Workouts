# AGENTS.md

Instructions for AI coding agents working in this repository. (Claude Code reads this through `CLAUDE.md`.)

## Project

**Syvra Workouts**: a small full-stack web app. Users manage **exercises** and **workouts**; a workout contains many exercises, each with its own sets/reps/weight/rest (many-to-many via `workout_exercises`).

Stack: TypeScript · npm workspaces · Express 5 + `pg` (plain SQL) · PostgreSQL 18 · React + Vite + React Router · CSS Modules · zod · Vitest · Docker Compose (local) · Neon / Render / Vercel (production).

**Status:** planning done, implementation not started. Follow [docs/07-roadmap.md](docs/07-roadmap.md).

## Docs map: read before working on…

| Task | Read |
|---|---|
| Scope and feature questions | [docs/00-requirements.md](docs/00-requirements.md) |
| Folder layout, layers, patterns, decisions | [docs/01-architecture.md](docs/01-architecture.md) |
| Schema, constraints, seed data | [docs/02-database.md](docs/02-database.md) |
| Endpoints, payloads, error codes | [docs/03-api.md](docs/03-api.md) |
| Pages, hooks, components, styling | [docs/04-frontend.md](docs/04-frontend.md) |
| Tests | [docs/05-testing.md](docs/05-testing.md) |
| Hosting, env vars | [docs/06-deployment.md](docs/06-deployment.md) |
| What to build next | [docs/07-roadmap.md](docs/07-roadmap.md) |

`docs/00-requirements.md` is the authoritative source for scope. If code and docs disagree, ask; update the docs in the same change when a decision changes.

## Hard rules

1. **Repository pattern:** only files in `apps/api/src/repositories/` run SQL or import the pg pool. Routes, controllers and services never do.
2. **Layers:** routes → controllers (HTTP only) → services (business rules) → repositories (SQL only). Wire dependencies through constructors in `createApp()`.
3. **SQL is always parameterised** (`$1`, `$2`). Never build SQL with string interpolation of user input.
4. **No secrets in the repo.** Only `.env.example` files with placeholders are committed.
5. **Validation** uses the zod schemas from `@syvra/shared`, on both the API and the forms. Don't duplicate rules.
6. `packages/shared`, `apps/web/src/api` and `apps/web/src/hooks` must not import React components, CSS, or browser globals (`window`, `document`). Keep them React-Native-ready.
7. Styling uses **CSS Modules** and the variables in `styles/tokens.css`; no CSS frameworks, no inline style objects for layout.
8. **Never use or recreate the Syvra logo** in the app. Only the brand colours from `docs/04-frontend.md` are used.
9. Keep the three tables and the names from the requirements (`workouts`, `exercises`, `workout_exercises`).
10. Keep code simple: every line must be understandable and explainable. Prefer clear code over clever code, and add no dependency without a reason.

## Conventions

- TypeScript `strict`; no `any` unless justified in a comment.
- DB `snake_case`, JSON/TS `camelCase`; mapping happens in repositories.
- Files: `PascalCase` for classes/components (`ExerciseRepository.ts`, `ExerciseCard.tsx`), `camelCase` for hooks/utilities (`useAsync.ts`); tests next to the file (`*.test.ts(x)`).
- Errors: throw `AppError` subclasses; never send responses from services.
- Commits: small, imperative mood (`Add ExerciseRepository with tests`).

## Git workflow

- **Never commit directly to `main`.** `main` is the production branch: Render and Vercel deploy from it.
- **All commits go on `develop`.** Before committing, check the current branch (`git branch --show-current`); if it is `main`, switch with `git switch develop` first.
- **`main` only changes through Pull Requests from `develop` → `main`** (`gh pr create --base main --head develop`). Open the PR when a milestone (or a coherent chunk of one) is done and lint, typecheck and tests pass.
- Never force-push to `main` or `develop`, and never merge locally into `main`.
- After a PR is merged, update `develop` from `main` if they diverged (`git pull origin main` on `develop`).

## Commands (planned; available once M0 is done)

```bash
npm install                 # install all workspaces
docker compose up           # local db + api (:3000) + web (:5173)
docker compose down -v      # wipe local DB (re-seeded on next up)
npm test                    # all tests
npm run lint && npm run typecheck
npm run build:api | build:web
```

Before finishing a task: run lint, typecheck and tests for the affected workspace.
