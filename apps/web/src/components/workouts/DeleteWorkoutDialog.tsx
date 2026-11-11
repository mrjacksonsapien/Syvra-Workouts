import type { Workout } from '@syvra/shared';
import { deleteWorkout } from '../../api/workouts';
import { useMutation } from '../../hooks/useMutation';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface DeleteWorkoutDialogProps {
  workout: Workout;
  onDeleted: () => void;
  onCancel: () => void;
}

// Render it only while a workout is being deleted, so its error state starts fresh each time.
export function DeleteWorkoutDialog({ workout, onDeleted, onCancel }: DeleteWorkoutDialogProps) {
  const { mutate, isPending, error } = useMutation(deleteWorkout);

  async function confirm() {
    await mutate(workout.id);
    onDeleted();
  }

  return (
    <ConfirmDialog
      open
      title="Delete workout?"
      message={`"${workout.name}" and its list of exercises will be permanently deleted. The exercises themselves are kept.`}
      isPending={isPending}
      error={error}
      onConfirm={() => void confirm().catch(() => undefined)} // the error is shown via `error`
      onCancel={onCancel}
    />
  );
}
