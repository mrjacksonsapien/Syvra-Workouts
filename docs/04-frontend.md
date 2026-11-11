# 04 — Front end

React + TypeScript + Vite + React Router, in `apps/web`. One **responsive web app**: it works in phone and desktop browsers. No native app (see [React Native note](01-architecture.md#future-react-native)).

## Folder structure and layering

```
apps/web/src/
├── main.tsx                 # mounts <App/>, imports global CSS
├── App.tsx                  # route table + layout (<BrowserRouter> is in main.tsx)
├── api/                     # NO React. Plain functions that call the API.
│   ├── client.ts            # fetch wrapper: base URL, JSON, ApiError
│   ├── exercises.ts         # listExercises(filter), getExercise(id), createExercise(...)...
│   └── workouts.ts          # listWorkouts(), getWorkout(id), addExerciseToWorkout(...)...
├── hooks/                   # React, NO HTML/CSS. Custom hooks.
├── components/
│   ├── layout/              # AppLayout, NavBar
│   ├── ui/                  # Button, Modal, ConfirmDialog, FormField, Spinner, ErrorMessage, EmptyState, Badge
│   ├── exercises/           # ExerciseCard, ExerciseForm, MuscleGroupFilter
│   └── workouts/            # WorkoutCard, WorkoutForm, WorkoutExerciseRow, WorkoutExerciseForm
├── pages/                   # one per route; composes hooks + components
└── styles/
    ├── tokens.css           # CSS variables: brand colours, spacing, radius, breakpoints
    └── global.css           # reset, base typography
```

Dependency direction: `pages → components → hooks → api → @syvra/shared`. Never the other way. `api/` and `hooks/` never import components, CSS, `window` or `document`.

## Routes

| Path | Page |
|---|---|
| `/` | redirect → `/workouts` |
| `/exercises` | `ExercisesPage` |
| `/exercises/:id` | `ExerciseDetailsPage` |
| `/workouts` | `WorkoutsPage` |
| `/workouts/:id` | `WorkoutDetailsPage` |
| `*` | `NotFoundPage` |

The root `vercel.json` rewrites every path to `index.html`, so refreshing `/workouts/3` works on Vercel.

## Pages

### Exercises (`/exercises`)
- Grid of `ExerciseCard`s (name, muscle group badge, equipment); click → details.
- `MuscleGroupFilter`: "All" + one chip per group. The filter is stored in the **URL** (`?muscleGroup=legs`, via `useSearchParams`) so it survives refresh and can be shared. It is sent to the API as a query parameter.
- "New exercise" button → `Modal` with `ExerciseForm`.
- Each card: Edit (modal with pre-filled form) and Delete (`ConfirmDialog`). On `409 EXERCISE_IN_USE`, the dialog shows the server message ("Used in 3 workouts…").

### Exercise details (`/exercises/:id`)
- Header: name, muscle group, equipment, description; Edit / Delete buttons.
- "Used in N workouts": list of workouts with that exercise's sets × reps (and weight) in each; click → workout details.
- Empty state: "Not used in any workout yet."

### Workouts (`/workouts`)
- List of `WorkoutCard`s: name, scheduled date (formatted, or "Unscheduled"), exercise count.
- Create (modal `WorkoutForm`), Edit, Delete (`ConfirmDialog` warning that its exercise list is removed too).

### Workout details (`/workouts/:id`)
- Header: name, date, description; Edit / Delete workout.
- Ordered list of `WorkoutExerciseRow`: exercise name (link to its details), muscle group, `sets × reps`, weight, rest.
- Per row: **Edit** (modal with `WorkoutExerciseForm`: sets, reps, weight, rest, position) and **Remove** (confirm).
- **Add exercise**: modal with an exercise `<select>` (exercises already in the workout are excluded), plus sets/reps/weight/rest.

### Common to every page
- **Loading:** `Spinner` while the first request is pending.
- **Error:** `ErrorMessage` with the API message and a "Retry" button (calls `reload()` from the hook). A 404 shows "Not found" with a link back to the list.
- **Empty:** `EmptyState` with a call to action ("No workouts yet. Create one").
- **Mutations:** submit buttons are disabled and show "Saving…" while pending; server errors appear inside the form/dialog.

## Custom hooks

The data layer is built entirely from custom hooks.

| Hook | Returns | Purpose |
|---|---|---|
| `useAsync<T>(fn, deps)` | `{ data, error, isLoading, reload }` | **Generic** building block: runs an async function when `deps` change, tracks state, ignores responses that arrive after unmount or after deps changed (stale responses) |
| `useExercises(filter)` | `useAsync` result of `Exercise[]` | Exercises list |
| `useExercise(id)` | `Exercise` | Exercise details |
| `useExerciseWorkouts(id)` | `ExerciseUsage[]` | Workouts using an exercise |
| `useWorkouts()` | `WorkoutSummary[]` | Workouts list |
| `useWorkout(id)` | `WorkoutDetails` | Workout details |
| `useMutation(fn)` | `{ mutate, isPending, error }` | Wraps create/update/delete calls; `mutate` resolves to the result so the page can `reload()` the relevant list afterwards |
| `useForm(schema, initialValues)` | `{ values, errors, setField, handleSubmit, reset }` | Form state + **zod validation** with the shared schema; maps `400` `fieldErrors` from the API back onto fields |

After a successful mutation, the page calls `reload()` on the affected query hooks. This is a deliberate simple alternative to a cache library: easy to explain, and enough for this size.

### `api/client.ts`
- Base URL from `import.meta.env.VITE_API_URL`.
- `request<T>(path, options)`: sets JSON headers, parses JSON, returns `undefined` on 204, and throws `ApiError { status, code, message, details }` built from the API's error format. Network failures become `ApiError(0, 'NETWORK_ERROR', 'Cannot reach the server')`.
- Because Render's free tier sleeps, the first request can take about 30–60 s. While loading takes longer than about 5 s, `Spinner` shows the hint *"Waking up the server, this can take up to a minute…"*.

## Forms and validation

- Forms use the **same zod schemas** as the API, from `@syvra/shared` (e.g. `exerciseInputSchema`).
- Validation runs on submit and then on change for fields already touched; errors show under each `FormField` (`aria-invalid`, `aria-describedby`).
- Numeric inputs (`sets`, `reps`, `weightKg`, `restSeconds`) use `type="number"` with `inputMode` for mobile keyboards, and are converted from string to number before validation; empty optional values become `null`.
- No form library: `useForm` is ~60 lines and fully explainable.

## Styling: CSS Modules

- Each component has a sibling `Component.module.css`. Vite turns class names into unique ones (`.card` → `ExerciseCard_card__x7f2`), so styles never leak between components. Usage: `import styles from './ExerciseCard.module.css'` then `className={styles.card}`.
- `styles/tokens.css` defines global **CSS custom properties** (variables), used everywhere as `var(--color-primary)`.
- No CSS framework, no CSS-in-JS.

### Brand colours

Taken from the fill colours of Syvra's logo (the logo file is not kept in the repo).

> **The logo is copyrighted by Syvra and must never be used or recreated in the app.** Only its colours are reused. The app shows its own plain text wordmark (e.g. "Workouts" in the brand font and colour).

| Swatch | Hex | Source |
|---|---|---|
| Teal | `#006785` | Logo letters (S, Y, R, A) |
| Mint | `#78D3CF` | Logo "V": gradient start, accent dots |
| Light mint | `#AEE9D8` | Logo "V": gradient end |
| Deep teal | `#00526A` | *Derived:* teal darkened ~20% for hover/pressed states (not in the logo) |
| Off-white | `#F9F9F9` | Neutral page background |

The logo's mint gradient (`#78D3CF → #AEE9D8`) may be reused as a subtle CSS `linear-gradient` accent, e.g. a thin bar under the header. That reuses the colours, not the logo.

```css
:root {
  --color-primary: #006785;        /* Syvra teal: primary buttons, links, active nav, headings */
  --color-primary-hover: #00526a;  /* derived deep teal: hover/pressed */
  --color-accent: #78d3cf;         /* Syvra mint: highlights, active filter chip, badges */
  --color-accent-light: #aee9d8;   /* Syvra light mint: subtle backgrounds, selected rows */
  --gradient-accent: linear-gradient(90deg, var(--color-accent), var(--color-accent-light));
  --color-bg: #f9f9f9;             /* page background */
  --color-surface: #ffffff;        /* cards, modals */
  --color-text: #1d2b33;
  --color-text-muted: #5b6b73;
  --color-danger: #c0392b;         /* delete actions, errors */
  --radius: 8px;
  --space-1: 4px; --space-2: 8px; --space-3: 16px; --space-4: 24px; --space-5: 32px;
  --font-family: 'Poppins', system-ui, sans-serif; /* geometric sans-serif, matching the brand style */
}
```
Contrast: white text on `--color-primary` is about 6.4:1, which passes WCAG AA (the accessibility guidelines' contrast standard). The mints are only used behind dark text or as decoration, never as text on white (too low contrast).


## Responsive design

- **Mobile-first:** base styles target a ~360 px phone; media queries add layout for larger screens.
- Breakpoints: `min-width: 640px` (tablet) and `min-width: 1024px` (desktop).

| Element | Phone | Tablet / desktop |
|---|---|---|
| NavBar | Top bar: logo + two tabs (Workouts / Exercises), full width | Same bar, content centred in a max-width container (1100 px) |
| Card lists | 1 column | CSS Grid `repeat(auto-fill, minmax(280px, 1fr))` |
| Workout exercise rows | Stacked card: name on top, `4 × 8 · 60 kg · 120 s` below, actions in a row | Table-like row with aligned columns |
| Modals | Full-screen sheet | Centred dialog, max-width 520 px |
| Touch targets | ≥ 44 × 44 px | same |

`Modal` uses the native `<dialog>` element (`showModal()`), which gives focus trapping, the Esc key and a backdrop for free.

## Accessibility basics
Semantic HTML (`<nav>`, `<main>`, `<button>`, `<label for>`), visible focus styles, `aria-live="polite"` on error and loading regions, a confirm step before every delete.
