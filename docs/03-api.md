# 03 — REST API

Express 5 + TypeScript, in `apps/api`. Layers and patterns are described in [01-architecture](01-architecture.md#api-layers).

## Conventions

- Base path: **`/api`** (plus `/health` at the root).
- JSON in and out, **`camelCase`** field names. Dates: `scheduledDate` is `"YYYY-MM-DD"`; timestamps are ISO 8601 strings.
- IDs in the URL are positive integers, validated by zod (`/api/exercises/abc` → 400).
- Create → `201` with the created resource. Update → `200` with the updated resource. Delete → `204` with no body.
- **Updates use `PUT` with the full editable object** (forms always send every field). Optional fields may be `null` to clear them.
- CORS: only the origin in `CORS_ORIGIN` (the Vercel URL, or `http://localhost:5173` locally) is allowed.
- Body size limit `100kb` (`express.json({ limit: '100kb' })`).

## Endpoint summary

| Method | Path | Purpose | Success |
|---|---|---|---|
| GET | `/health` | Liveness + DB check | 200 |
| GET | `/api/exercises?muscleGroup=legs` | List exercises (optional filter) | 200 |
| GET | `/api/exercises/:id` | One exercise | 200 |
| GET | `/api/exercises/:id/workouts` | Workouts using this exercise | 200 |
| POST | `/api/exercises` | Create exercise | 201 |
| PUT | `/api/exercises/:id` | Update exercise | 200 |
| DELETE | `/api/exercises/:id` | Delete exercise (409 if in use) | 204 |
| GET | `/api/workouts` | List workouts (with exercise count) | 200 |
| GET | `/api/workouts/:id` | One workout **with its exercises** | 200 |
| POST | `/api/workouts` | Create workout | 201 |
| PUT | `/api/workouts/:id` | Update workout (name/description/date) | 200 |
| DELETE | `/api/workouts/:id` | Delete workout (cascades links) | 204 |
| POST | `/api/workouts/:id/exercises` | **Add** an exercise to a workout | 201 |
| PUT | `/api/workouts/:id/exercises/:exerciseId` | **Edit** sets/reps/weight/rest/position | 200 |
| DELETE | `/api/workouts/:id/exercises/:exerciseId` | **Remove** an exercise from a workout | 204 |

## Resource shapes

```ts
type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'full_body';

interface Exercise {
  id: number;
  name: string;
  muscleGroup: MuscleGroup;
  description: string | null;
  equipment: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Workout {
  id: number;
  name: string;
  description: string | null;
  scheduledDate: string | null; // "YYYY-MM-DD"
  createdAt: string;
  updatedAt: string;
}

interface WorkoutSummary extends Workout { exerciseCount: number }   // list
interface WorkoutDetails extends Workout { exercises: WorkoutExercise[] } // details

interface WorkoutExercise {          // one row of workout_exercises + its exercise
  exerciseId: number;
  sets: number;
  reps: number;
  weightKg: number | null;
  restSeconds: number | null;
  position: number;
  exercise: Pick<Exercise, 'id' | 'name' | 'muscleGroup' | 'equipment'>;
}

interface ExerciseUsage extends Workout { // GET /api/exercises/:id/workouts
  sets: number; reps: number; weightKg: number | null; restSeconds: number | null;
}
```

All of these types (and the input schemas below) live in `@syvra/shared`.

## Health

### `GET /health`
Runs `SELECT 1`. Useful to wake Render/Neon and to check the deploy.
```json
200 { "status": "ok", "database": "ok" }
503 { "status": "degraded", "database": "unreachable" }
```

## Exercises

### `GET /api/exercises`
Query: `muscleGroup` (optional, one of the allowed values; otherwise 400). Sorted by `name`.
```json
200 [ { "id": 1, "name": "Bench Press", "muscleGroup": "chest", "description": null, "equipment": "Barbell", "createdAt": "…", "updatedAt": "…" } ]
```

### `GET /api/exercises/:id`
`200 Exercise` · `404 NOT_FOUND`

### `GET /api/exercises/:id/workouts`
Workouts containing the exercise, with that exercise's sets/reps in each, sorted by `scheduledDate` (nulls last) then `name`.
`200 ExerciseUsage[]` (may be empty) · `404 NOT_FOUND` if the exercise doesn't exist.

### `POST /api/exercises`
```json
{ "name": "Goblet Squat", "muscleGroup": "legs", "description": "Hold a kettlebell at chest height…", "equipment": "Kettlebell" }
```
| Field | Rules |
|---|---|
| `name` | required, trimmed, 2–80 chars, unique |
| `muscleGroup` | required, allowed value |
| `description` | optional, ≤ 500 chars, nullable |
| `equipment` | optional, ≤ 50 chars, nullable |

`201 Exercise` · `400 VALIDATION_ERROR` · `409 EXERCISE_NAME_TAKEN`

### `PUT /api/exercises/:id`
Same body as POST. `200 Exercise` · `400` · `404` · `409 EXERCISE_NAME_TAKEN`

### `DELETE /api/exercises/:id`
`204` · `404` · `409 EXERCISE_IN_USE`:
```json
{ "error": { "code": "EXERCISE_IN_USE", "message": "This exercise is used in 3 workouts. Remove it from those workouts first.", "details": { "workoutCount": 3 } } }
```

## Workouts

### `GET /api/workouts`
Sorted by `scheduledDate` (nulls last), then `name`. `200 WorkoutSummary[]`.

### `GET /api/workouts/:id`
`200 WorkoutDetails` (exercises sorted by `position`) · `404`.
```json
{
  "id": 1, "name": "Push Day", "description": null, "scheduledDate": "2026-11-16",
  "createdAt": "…", "updatedAt": "…",
  "exercises": [
    { "exerciseId": 1, "sets": 4, "reps": 8, "weightKg": 60, "restSeconds": 120, "position": 1,
      "exercise": { "id": 1, "name": "Bench Press", "muscleGroup": "chest", "equipment": "Barbell" } }
  ]
}
```

### `POST /api/workouts`
```json
{ "name": "Leg Day", "description": "Heavy lower body", "scheduledDate": "2026-11-20" }
```
| Field | Rules |
|---|---|
| `name` | required, trimmed, 2–80 chars |
| `description` | optional, ≤ 500 chars, nullable |
| `scheduledDate` | optional, `YYYY-MM-DD`, valid date, nullable |

`201 Workout` · `400`

### `PUT /api/workouts/:id`
Same body as POST. `200 Workout` · `400` · `404`

### `DELETE /api/workouts/:id`
`204` (its `workout_exercises` rows are cascaded) · `404`

## Exercises inside a workout

### `POST /api/workouts/:id/exercises`
```json
{ "exerciseId": 7, "sets": 3, "reps": 10, "weightKg": 60, "restSeconds": 90 }
```
| Field | Rules |
|---|---|
| `exerciseId` | required, positive integer, must exist |
| `sets` | required, integer 1–20 |
| `reps` | required, integer 1–100 |
| `weightKg` | optional, number ≥ 0, max 2 decimals, nullable |
| `restSeconds` | optional, integer 0–600, nullable |

`position` is assigned automatically (last).
`201 WorkoutExercise` · `400` · `404 NOT_FOUND` (workout or exercise) · `409 EXERCISE_ALREADY_IN_WORKOUT`

### `PUT /api/workouts/:id/exercises/:exerciseId`
```json
{ "sets": 4, "reps": 8, "weightKg": 65, "restSeconds": 120, "position": 1 }
```
Same rules as above (`position` integer ≥ 1). `200 WorkoutExercise` · `400` · `404` (link not found)

### `DELETE /api/workouts/:id/exercises/:exerciseId`
`204` · `404`

## Error format

Every error response has the same shape:
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Invalid request body", "details": { "fieldErrors": { "sets": ["Must be at least 1"] } } } }
```

| Status | `code` | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | zod validation failed (body, params, query); `details.fieldErrors` maps field → messages so forms can show them |
| 404 | `NOT_FOUND` | Resource or link doesn't exist; also unknown routes |
| 409 | `EXERCISE_IN_USE` | Delete an exercise used in workouts |
| 409 | `EXERCISE_NAME_TAKEN` | Duplicate exercise name |
| 409 | `EXERCISE_ALREADY_IN_WORKOUT` | Unique pair violation |
| 500 | `INTERNAL_ERROR` | Anything unexpected (logged server-side, generic message to the client) |

Services check these conditions first so messages are friendly. The `errorHandler` also maps raw Postgres codes (`23505`, `23503`, `23514`) as a safety net, for example if two requests race.

## Where each endpoint's logic lives

| Endpoint group | Controller | Service | Repositories used |
|---|---|---|---|
| `/api/exercises` | `ExerciseController` | `ExerciseService` | `ExerciseRepository`, `WorkoutExerciseRepository` (in-use count), `WorkoutRepository` (usage list) |
| `/api/workouts` | `WorkoutController` | `WorkoutService` | `WorkoutRepository`, `WorkoutExerciseRepository` (details) |
| `/api/workouts/:id/exercises` | `WorkoutExerciseController` | `WorkoutExerciseService` | `WorkoutRepository`, `ExerciseRepository` (existence), `WorkoutExerciseRepository` |
