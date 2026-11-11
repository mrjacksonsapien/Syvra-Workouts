import type { Exercise } from '@syvra/shared';
import { deleteExercise } from '../../api/exercises';
import { useMutation } from '../../hooks/useMutation';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface DeleteExerciseDialogProps {
  exercise: Exercise;
  onDeleted: () => void;
  onCancel: () => void;
}

// Render it only while an exercise is being deleted, so its error state starts fresh each time.
// A 409 EXERCISE_IN_USE answer is shown inside the dialog with the server's message.
export function DeleteExerciseDialog({ exercise, onDeleted, onCancel }: DeleteExerciseDialogProps) {
  const { mutate, isPending, error } = useMutation(deleteExercise);

  async function confirm() {
    await mutate(exercise.id);
    onDeleted();
  }

  return (
    <ConfirmDialog
      open
      title="Delete exercise?"
      message={`"${exercise.name}" will be permanently deleted.`}
      isPending={isPending}
      error={error}
      onConfirm={() => void confirm().catch(() => undefined)} // the error is shown via `error`
      onCancel={onCancel}
    />
  );
}
