# 00 — Requirements

This file lists the project's requirements as a checklist and is the reference for scope. Every requirement has an ID so other docs, commits and the final README can reference it.

> **Goal:** build and **deploy** a small full-stack web app to manage workouts and their exercises — React front end, REST API, relational database.
>
> **Context:** in Syvra Fitness, a workout contains several exercises, and the same exercise is used in many workouts, each time with its own sets and repetitions (a **many-to-many** relationship with data on the link). Not intended for production use. AI tools may be used, but **every part of the code must be understood and explainable.**

---

## 1. Must-have

### Database
| ID | Requirement | Covered in |
|---|---|---|
| R-DB-1 | Relational database **hosted online** (PostgreSQL; Neon chosen) | [06-deployment](06-deployment.md) |
| R-DB-2 | Exactly three tables: `workouts`, `exercises`, `workout_exercises` | [02-database](02-database.md) |
| R-DB-3 | `workout_exercises` stores **sets and repetitions** | [02-database](02-database.md) |
| R-DB-4 | `workout_exercises` has **two foreign keys** and a **unique pair** | [02-database](02-database.md) |
| R-DB-5 | Seeded with fictional data: **~15 exercises, ~5 workouts** | [02-database](02-database.md#seed-data) |

### API
| ID | Requirement | Covered in |
|---|---|---|
| R-API-1 | REST API (Node.js + Express) | [03-api](03-api.md) |
| R-API-2 | Full CRUD on **workouts** | [03-api](03-api.md#workouts) |
| R-API-3 | Full CRUD on **exercises** | [03-api](03-api.md#exercises) |
| R-API-4 | Endpoints to **add, edit and remove an exercise in a workout** | [03-api](03-api.md#exercises-inside-a-workout) |

### Design pattern
| ID | Requirement | Covered in |
|---|---|---|
| R-PAT-1 | **Repository pattern**: all DB queries live in repositories (e.g. `WorkoutRepository`) | [01-architecture](01-architecture.md#repository-pattern) |
| R-PAT-2 | Routes **never** query the database directly | [01-architecture](01-architecture.md#api-layers) |

### Front end
| ID | Requirement | Covered in |
|---|---|---|
| R-FE-1 | React | [04-frontend](04-frontend.md) |
| R-FE-2 | Responsive (phone and computer) | [04-frontend](04-frontend.md#responsive-design) |
| R-FE-3 | At least **one custom hook** | [04-frontend](04-frontend.md#custom-hooks) |
| R-FE-4 | **Exercises** page: list, **filter by muscle group**, create, edit, delete | [04-frontend](04-frontend.md#pages) |
| R-FE-5 | **Exercise details** page: the workouts that use this exercise | [04-frontend](04-frontend.md#pages) |
| R-FE-6 | **Workouts** page: list, create, edit, delete | [04-frontend](04-frontend.md#pages) |
| R-FE-7 | **Workout details** page: its exercises with sets and reps; add, edit, remove one | [04-frontend](04-frontend.md#pages) |

### Tests
| ID | Requirement | Covered in |
|---|---|---|
| R-TEST-1 | Unit tests (Vitest) for the **repositories** | [05-testing](05-testing.md) |
| R-TEST-2 | Unit tests for **at least one React component or hook** | [05-testing](05-testing.md) |

### Deployment
| ID | Requirement | Covered in |
|---|---|---|
| R-DEP-1 | Website, API and database deployed (free plans) | [06-deployment](06-deployment.md) |
| R-DEP-2 | Passwords in **environment variables**, never in the repository | [06-deployment](06-deployment.md#environment-variables) |
| R-DEP-3 | **It must work online.** The deployed URLs are the deliverable; nobody is expected to clone or run the project locally | [06-deployment](06-deployment.md) |

## 2. Deliverables

| ID | Deliverable |
|---|---|
| D-1 | Link to the deployed **website** |
| D-2 | Link to the deployed **API** |
| D-3 | Link to the **GitHub repository** (public or shared) |
| D-4 | **Database schema** in the repository (`db/schema.sql`) |
| D-5 | **Unit tests** in the repository |
| D-6 | **README** with: an **ERD** diagram, a short explanation of the **Repository pattern**, and the **AI tools used** |

## 3. Nice to have (all planned)

| ID | Item | Plan |
|---|---|---|
| N-1 | TypeScript | Used everywhere (API, web, shared) |
| N-2 | Form validation | zod schemas shared by front end and API |
| N-3 | Loading and error states on **every** page | `useAsync`-based hooks + `Spinner` / `ErrorMessage` / `EmptyState` components |
| N-4 | Design follows the Syvra brand colours | CSS variables in `tokens.css` |

## 4. Recommendations

1. Deploy the **database and API first**, then the front end.
2. Test the deployed website in a **private window** before release (no cache, no local storage, no dev cookies).
3. Read and understand all AI-generated code before committing it.

## 5. Out of scope (deliberately)

- Authentication / users (not asked; all data is shared and fictional).
- Native mobile app (the web app is responsive; see the React Native note in [01-architecture](01-architecture.md#future-react-native)).
- Pagination, search, i18n (small dataset, single language: English).
- Repeating the same exercise twice in one workout. The unique pair is required (R-DB-4); to do an exercise "twice", increase its sets.
