import type { WorkoutExercise } from '@syvra/shared';
import { Link } from 'react-router';
import { formatSetsReps, muscleGroupLabel } from '../../utils/format';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import styles from './WorkoutExerciseRow.module.css';

interface WorkoutExerciseRowProps {
  workoutExercise: WorkoutExercise;
  onEdit: (workoutExercise: WorkoutExercise) => void;
  onRemove: (workoutExercise: WorkoutExercise) => void;
}

export function WorkoutExerciseRow({ workoutExercise, onEdit, onRemove }: WorkoutExerciseRowProps) {
  const { exercise, sets, reps, weightKg, restSeconds } = workoutExercise;
  return (
    <li className={styles.row}>
      <div className={styles.name}>
        <Link to={`/exercises/${exercise.id}`}>{exercise.name}</Link>
        <Badge>{muscleGroupLabel(exercise.muscleGroup)}</Badge>
      </div>
      <p className={styles.numbers}>{formatSetsReps(sets, reps, weightKg, restSeconds)}</p>
      <div className={styles.actions}>
        <Button variant="secondary" onClick={() => onEdit(workoutExercise)}>
          Edit
        </Button>
        <Button variant="danger" onClick={() => onRemove(workoutExercise)}>
          Remove
        </Button>
      </div>
    </li>
  );
}
