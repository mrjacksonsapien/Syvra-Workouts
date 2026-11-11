import type { Exercise } from '@syvra/shared';
import { Link } from 'react-router';
import { muscleGroupLabel } from '../../utils/format';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import styles from './ExerciseCard.module.css';

interface ExerciseCardProps {
  exercise: Exercise;
  onEdit: (exercise: Exercise) => void;
  onDelete: (exercise: Exercise) => void;
}

export function ExerciseCard({ exercise, onEdit, onDelete }: ExerciseCardProps) {
  return (
    <li className={styles.card}>
      <h2 className={styles.name}>
        <Link to={`/exercises/${exercise.id}`}>{exercise.name}</Link>
      </h2>
      <div>
        <Badge>{muscleGroupLabel(exercise.muscleGroup)}</Badge>
      </div>
      <p className={styles.equipment}>{exercise.equipment ?? 'No equipment'}</p>
      <div className={styles.actions}>
        <Button variant="secondary" onClick={() => onEdit(exercise)}>
          Edit
        </Button>
        <Button variant="danger" onClick={() => onDelete(exercise)}>
          Delete
        </Button>
      </div>
    </li>
  );
}
