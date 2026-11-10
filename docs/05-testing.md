# 05 — Testing

**Vitest** is the test runner for both apps: it finds `*.test.ts(x)` files, runs them in Node and reports results. Its API (`describe`, `it`, `expect`, `vi.fn()`) is the same as Jest's. For React, **React Testing Library** renders components and hooks inside **jsdom**, a simulated browser DOM running in Node.

Planned: tests for the **repositories** and for **at least one React component or hook**, plus a few cheap extras.

## Layout and commands

Tests sit next to the code they test: `ExerciseRepository.ts` and `ExerciseRepository.test.ts`.

| Command (from repo root) | Runs |
|---|---|
| `npm test` | All workspaces |
| `npm test -w apps/api` | API tests (Node environment) |
| `npm test -w apps/web` | Web tests (jsdom environment) |
| `npm run test:watch -w apps/web` | Watch mode while developing |
| `npm run coverage` | Coverage report (v8), informational, no threshold |

Unit tests need **no database and no network**, so they run anywhere (and in CI).

## API

### Repositories (required)

A repository receives a `pg` `Pool` in its constructor, so the test passes a fake:

```ts
const pool = { query: vi.fn() };
const repo = new ExerciseRepository(pool as unknown as Pool);

it('filters by muscle group with a parameterised query', async () => {
  pool.query.mockResolvedValue({ rows: [{ id: 1, name: 'Back Squat', muscle_group: 'legs', /* … */ }] });

  const result = await repo.findAll({ muscleGroup: 'legs' });

  const [sql, params] = pool.query.mock.calls[0];
  expect(sql).toMatch(/WHERE muscle_group = \$1/);
  expect(params).toEqual(['legs']);
  expect(result[0]).toMatchObject({ id: 1, muscleGroup: 'legs' }); // snake_case → camelCase
});
```

What each repository test file checks:

| Repository | Cases |
|---|---|
| `ExerciseRepository` | `findAll` without/with filter (SQL + params); row mapping; `findById` returns `null` when no row; `create`/`update` pass values in the right order and return the mapped row; `delete` returns `true`/`false` from `rowCount` |
| `WorkoutRepository` | `findAll` maps `exercise_count` to a number; `findById` null case; `findByExerciseId` passes the id and maps the joined fields; `update`/`delete` not-found behaviour |
| `WorkoutExerciseRepository` | `findByWorkoutId` maps nested `exercise` and converts `weight_kg` string → number (and keeps `null`); `add` computes position in SQL (`COALESCE(MAX(position), 0) + 1`); `update`/`remove` use **both** ids; `countByExerciseId` returns a number |

These are **unit** tests: they check our code (queries built, parameters, mapping), not PostgreSQL itself. Constraints are covered by the DB and by manual checks (below).

### Services (extra, recommended)

Services get fake repositories, so business rules are tested in isolation:
- `ExerciseService.delete` throws `ConflictError('EXERCISE_IN_USE')` when the count > 0, throws `NotFoundError` when missing, and calls `repo.delete` otherwise.
- `WorkoutExerciseService.add` throws `NotFoundError` if the workout or exercise is missing, and `ConflictError('EXERCISE_ALREADY_IN_WORKOUT')` if the link exists.

### Middleware (extra, small)
- `errorHandler` maps `AppError` → status/code; Postgres `23505` → 409; unknown → 500 without leaking details.
- `validate()` returns 400 with `fieldErrors`.

## Web

### Hook (required: at least one of component/hook)
`useForm.test.ts` with `renderHook`:
- initial values exposed;
- `handleSubmit` with invalid values → `errors` filled, `onSubmit` **not** called;
- valid values → `onSubmit` called with parsed data (numbers converted, empty optionals → `null`);
- API `fieldErrors` passed to `setServerErrors` appear on fields.

`useAsync.test.ts`:
- `isLoading` true then `data` set;
- rejected promise → `error` set;
- `reload()` re-runs;
- a stale response (deps changed before it resolved) is ignored.

### Component
`ExerciseForm.test.tsx` with `render` + `@testing-library/user-event`:
- submitting empty shows "Name is required" and doesn't call `onSubmit`;
- filling the fields and choosing a muscle group calls `onSubmit` with the expected object;
- in edit mode, fields are pre-filled.

Optional: `MuscleGroupFilter.test.tsx` (clicking a chip calls `onChange('legs')`).

### Mocking API calls in web tests
Hooks and pages are tested by mocking the `api/` module (`vi.mock('../api/exercises')`). No real HTTP.

## Shared package
`packages/shared` schemas get a small test file: valid and invalid examples for each schema (e.g. `sets: 0` rejected, `scheduledDate: '2026-02-30'` rejected).

## Manual end-to-end checklist (before release)

Run against the **deployed** site, in a **private window**, on desktop **and** phone (or DevTools device mode):

- [ ] Exercises list loads; each muscle group filter works; refresh keeps the filter
- [ ] Create / edit / delete an exercise; duplicate name shows an error
- [ ] Deleting an exercise used in a workout shows "Used in N workouts"
- [ ] Exercise details lists the right workouts
- [ ] Create / edit / delete a workout; deleting it removes its links
- [ ] Workout details: add, edit, remove an exercise; adding a duplicate is prevented
- [ ] Invalid form values show field errors (front) and the API rejects them too (try with curl)
- [ ] Loading and error states visible (DevTools → Network → Offline)
- [ ] Direct URL refresh on `/workouts/1` works
- [ ] No secrets in the repo (`git grep -i password`, check `.env` is gitignored)

## CI (nice extra)
`.github/workflows/ci.yml`: on push/PR → `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`. A green badge in the README is cheap evidence of quality.
