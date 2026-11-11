import { Navigate, Route, Routes } from 'react-router';
import { AppLayout } from './components/layout/AppLayout';
import { ExerciseDetailsPage } from './pages/ExerciseDetailsPage';
import { ExercisesPage } from './pages/ExercisesPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { WorkoutDetailsPage } from './pages/WorkoutDetailsPage';
import { WorkoutsPage } from './pages/WorkoutsPage';

// The router itself (<BrowserRouter>) is in main.tsx, so tests can wrap <App /> in a MemoryRouter.
export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/workouts" replace />} />
        <Route path="/exercises" element={<ExercisesPage />} />
        <Route path="/exercises/:id" element={<ExerciseDetailsPage />} />
        <Route path="/workouts" element={<WorkoutsPage />} />
        <Route path="/workouts/:id" element={<WorkoutDetailsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
