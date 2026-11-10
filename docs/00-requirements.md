# 00 — Requirements

This file is the reference for scope: the features the app must have and the rules it must follow. Details are in the linked docs.

> **Goal:** a small full-stack web app to manage workouts and their exercises: React front end, REST API, relational database, deployed online.
>
> **Context:** a workout contains several exercises, and the same exercise is used in many workouts, each time with its own sets, repetitions, weight and rest (a **many-to-many** relationship with data on the link). All data is fictional.

---

## 1. Must-have

### Database
| Requirement | Details in |
|---|---|
| Relational database **hosted online** (PostgreSQL; Neon) | [06-deployment](06-deployment.md) |
| Exactly three tables: `workouts`, `exercises`, `workout_exercises` | [02-database](02-database.md) |
| `workout_exercises` stores **sets and repetitions** | [02-database](02-database.md) |
| `workout_exercises` has **two foreign keys** and a **unique pair** | [02-database](02-database.md) |
| Seeded with fictional data: **~15 exercises, ~5 workouts** | [02-database](02-database.md#seed-data) |

### API
| Requirement | Details in |
|---|---|
| REST API (Node.js + Express) | [03-api](03-api.md) |
| Full CRUD on **workouts** | [03-api](03-api.md#workouts) |
| Full CRUD on **exercises** | [03-api](03-api.md#exercises) |
| Endpoints to **add, edit and remove an exercise in a workout** | [03-api](03-api.md#exercises-inside-a-workout) |

### Design pattern
| Requirement | Details in |
|---|---|
| **Repository pattern**: all DB queries live in repositories (e.g. `WorkoutRepository`) | [01-architecture](01-architecture.md#repository-pattern) |
| Routes **never** query the database directly | [01-architecture](01-architecture.md#api-layers) |

### Front end
| Requirement | Details in |
|---|---|
| React | [04-frontend](04-frontend.md) |
| Responsive (phone and computer) | [04-frontend](04-frontend.md#responsive-design) |
| At least **one custom hook** | [04-frontend](04-frontend.md#custom-hooks) |
| **Exercises** page: list, **filter by muscle group**, create, edit, delete | [04-frontend](04-frontend.md#pages) |
| **Exercise details** page: the workouts that use this exercise | [04-frontend](04-frontend.md#pages) |
| **Workouts** page: list, create, edit, delete | [04-frontend](04-frontend.md#pages) |
| **Workout details** page: its exercises with sets and reps; add, edit, remove one | [04-frontend](04-frontend.md#pages) |

### Tests
| Requirement | Details in |
|---|---|
| Unit tests (Vitest) for the **repositories** | [05-testing](05-testing.md) |
| Unit tests for **at least one React component or hook** | [05-testing](05-testing.md) |

### Deployment
| Requirement | Details in |
|---|---|
| Website, API and database deployed (free plans) | [06-deployment](06-deployment.md) |
| Passwords in **environment variables**, never in the repository | [06-deployment](06-deployment.md#environment-variables) |
| The app must work online | [06-deployment](06-deployment.md) |

## 2. Quality goals (planned)

| Item | Plan |
|---|---|
| TypeScript | Used everywhere (API, web, shared) |
| Form validation | zod schemas shared by front end and API |
| Loading and error states on **every** page | `useAsync`-based hooks + `Spinner` / `ErrorMessage` / `EmptyState` components |
| Design follows the Syvra brand colours | CSS variables in `tokens.css` |

## 3. Out of scope (deliberately)

- Authentication / users (all data is shared and fictional).
- Native mobile app (the web app is responsive; see the React Native note in [01-architecture](01-architecture.md#future-react-native)).
- Pagination, search, i18n (small dataset, single language: English).
- Repeating the same exercise twice in one workout. The unique pair is required; to do an exercise "twice", increase its sets.
