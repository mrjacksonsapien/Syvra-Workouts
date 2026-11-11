import { Link } from 'react-router';
import { EmptyState } from '../components/ui/EmptyState';

export function NotFoundPage() {
  return (
    <EmptyState title="Page not found" message="This page does not exist.">
      <Link to="/workouts">Back to workouts</Link>
    </EmptyState>
  );
}
