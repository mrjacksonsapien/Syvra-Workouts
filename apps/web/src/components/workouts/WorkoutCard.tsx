import type { WorkoutSummary } from '@syvra/shared';
import { Link } from 'react-router';
import { formatDate } from '../../utils/format';
import { Button } from '../ui/Button';
import styles from './WorkoutCard.module.css';

interface WorkoutCardProps {
  workout: WorkoutSummary;
  onEdit: (workout: WorkoutSummary) => void;
  onDelete: (workout: WorkoutSummary) => void;
}

export function WorkoutCard({ workout, onEdit, onDelete }: WorkoutCardProps) {
  return (
    <li className={styles.card}>
      <h2 className={styles.name}>
        <Link to={`/workouts/${workout.id}`}>{workout.name}</Link>
      </h2>
      <p className={styles.meta}>{formatDate(workout.scheduledDate)}</p>
      <p className={styles.meta}>
        {workout.exerciseCount} {workout.exerciseCount === 1 ? 'exercise' : 'exercises'}
      </p>
      <div className={styles.actions}>
        <Button variant="secondary" onClick={() => onEdit(workout)}>
          Edit
        </Button>
        <Button variant="danger" onClick={() => onDelete(workout)}>
          Delete
        </Button>
      </div>
    </li>
  );
}
