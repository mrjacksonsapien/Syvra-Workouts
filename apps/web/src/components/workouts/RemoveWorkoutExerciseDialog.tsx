import type { WorkoutExercise } from '@syvra/shared';
import { removeExerciseFromWorkout } from '../../api/workouts';
import { useMutation } from '../../hooks/useMutation';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface RemoveWorkoutExerciseDialogProps {
  workoutId: number;
  workoutExercise: WorkoutExercise;
  onRemoved: () => void;
  onCancel: () => void;
}

export function RemoveWorkoutExerciseDialog({
  workoutId,
  workoutExercise,
  onRemoved,
  onCancel,
}: RemoveWorkoutExerciseDialogProps) {
  const { mutate, isPending, error } = useMutation(removeExerciseFromWorkout);

  async function confirm() {
    await mutate(workoutId, workoutExercise.exerciseId);
    onRemoved();
  }

  return (
    <ConfirmDialog
      open
      title="Remove exercise?"
      message={`"${workoutExercise.exercise.name}" will be removed from this workout.`}
      confirmLabel="Remove"
      isPending={isPending}
      error={error}
      onConfirm={() => void confirm().catch(() => undefined)}
      onCancel={onCancel}
    />
  );
}
