# 07 — Roadmap

Build order: database and API are deployed **before** the front end. Each milestone ends with something runnable, committed on `develop`, and merged into `main` through a PR. Check items off as they are done.

## M0: Repository setup
- [x] `.gitignore` (dependencies, builds, `.env*` except `.env.example`, coverage, logs, caches, hosting CLIs, editors/OS, local agent files)
- [x] GitHub repo created and connected (`origin` → `github.com/mrjacksonsapien/Syvra-Workouts`, branch `main`)
- [x] Root `package.json` with workspaces `apps/*`, `packages/*`; `tsconfig.base.json` (strict)
- [x] ESLint + Prettier config; root scripts (`dev`, `build:*`, `test`, `lint`, `typecheck`)
- [x] `AGENTS.md`, `CLAUDE.md`, `docs/` committed (initial commit)
- [x] `develop` branch created; all work is committed there and reaches `main` only through PRs (see [AGENTS.md](../AGENTS.md#git-workflow))
- [x] Branch protection on `main` (ruleset: require a PR before merging, block force pushes and deletion)
- [x] `.nvmrc` → Node 24

## M1: Database
- [x] `db/schema.sql` ([02-database](02-database.md))
- [x] `db/seed.sql` (15 exercises, 5 workouts)
- [x] `docker-compose.yml` with the `db` service; verify with `psql` that constraints behave (duplicate pair rejected, deleting a used exercise rejected, workout delete cascades)

## M2: Shared package
- [x] `packages/shared`: `MUSCLE_GROUPS`, zod input schemas, response types
- [x] Schema tests

## M3: API skeleton
- [x] `config/env.ts`, `db/pool.ts`, `app.ts` (`createApp`), `server.ts`
- [x] `AppError` classes, `errorHandler`, `notFound`, `validate()`
- [x] `GET /health`
- [x] `api` service in docker-compose + Dockerfile

## M4: Repositories (+ tests)
- [x] `ExerciseRepository`, `WorkoutRepository`, `WorkoutExerciseRepository`
- [x] Unit tests with a mocked pool

## M5: Services, controllers, routes
- [x] Exercises CRUD + `/exercises/:id/workouts`
- [x] Workouts CRUD (details include exercises)
- [x] Workout-exercise add/edit/remove
- [x] Service tests; manual curl run-through of every endpoint in [03-api](03-api.md)

## M6: Deploy database + API
- [x] Neon project, schema + seed loaded
- [ ] Render web service, env vars, `/health` green
- [ ] ~~Optional: GitHub Actions CI (lint, typecheck, test)~~ dropped for this assignment; see [02-database](02-database.md#decision-full-reset-instead-of-migrations)

## M7: Web skeleton
- [ ] Vite + React + TS, React Router, `AppLayout`/`NavBar`
- [ ] `tokens.css` (brand colours from [04-frontend](04-frontend.md#brand-colours)), `global.css`
- [ ] `api/client.ts`, `useAsync`, `useMutation`, `useForm`
- [ ] UI kit: Button, Modal, ConfirmDialog, FormField, Spinner, ErrorMessage, EmptyState
- [ ] `web` service in docker-compose

## M8: Exercises pages
- [ ] Exercises list + filter (URL param) + create/edit/delete (409 handled)
- [ ] Exercise details + workouts using it

## M9: Workouts pages
- [ ] Workouts list + create/edit/delete
- [ ] Workout details + add/edit/remove exercise

## M10: Front-end tests
- [ ] `useForm`, `useAsync` hook tests
- [ ] `ExerciseForm` component test

## M11: Deploy front end
- [ ] Vercel project, `VITE_API_URL`, SPA rewrite
- [ ] Update Render `CORS_ORIGIN`
- [ ] Manual checklist in a private window, on desktop and phone

## M12: README and polish
- [ ] README: live links (site, API, repo), short description, screenshots
- [ ] **ERD** (Mermaid, copied from [02-database](02-database.md#erd))
- [ ] **Repository pattern** explanation (short version of [01-architecture](01-architecture.md#repository-pattern))
- [ ] Local setup (`docker compose up`), scripts, tests, cold-start note
- [ ] Final responsive pass and accessibility check

## Definition of done
Every item in [00-requirements](00-requirements.md) is satisfied, `npm test` is green, and the deployed site passes the manual checklist in a private window.
