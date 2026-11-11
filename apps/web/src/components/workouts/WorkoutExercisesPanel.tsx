import type { WorkoutExercise } from '@syvra/shared';
import { useState } from 'react';
import { useExercises } from '../../hooks/useExercises';
import { useWorkout } from '../../hooks/useWorkouts';
import { Button } from '../ui/Button';
import { ErrorMessage } from '../ui/ErrorMessage';
import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner';
import { AddWorkoutExerciseForm } from './AddWorkoutExerciseForm';
import { EditWorkoutExerciseForm } from './EditWorkoutExerciseForm';
import { RemoveWorkoutExerciseDialog } from './RemoveWorkoutExerciseDialog';
import { WorkoutExerciseRow } from './WorkoutExerciseRow';
import styles from './WorkoutExercisesPanel.module.css';

// The exercises of one workout, with add / edit / remove. Used on the details page and inside the
// workout form. It loads its own data, and every change is saved to the API immediately.
// Do not render it inside a <form>: its own modals contain forms, and forms cannot be nested.
export function WorkoutExercisesPanel({ workoutId }: { workoutId: number }) {
  const workoutQuery = useWorkout(workoutId);
  const exercisesQuery = useExercises();

  const [isAdding, setIsAdding] = useState(false);
  const [editRow, setEditRow] = useState<WorkoutExercise | null>(null);
  const [removeRow, setRemoveRow] = useState<WorkoutExercise | null>(null);

  function afterChange() {
    setIsAdding(false);
    setEditRow(null);
    setRemoveRow(null);
    workoutQuery.reload();
  }

  const rows = workoutQuery.data?.exercises;
  // Exercises already in the workout cannot be added twice.
  const usedIds = new Set((rows ?? []).map((row) => row.exerciseId));
  const availableExercises = (exercisesQuery.data ?? []).filter((e) => !usedIds.has(e.id));

  return (
    <section>
      <div className={styles.header}>
        <h2>Exercises</h2>
        <Button onClick={() => setIsAdding(true)} disabled={!rows}>
          Add exercise
        </Button>
      </div>

      {workoutQuery.isLoading && !rows && <Spinner />}
      {workoutQuery.error && (
        <ErrorMessage message={workoutQuery.error.message} onRetry={workoutQuery.reload} />
      )}
      {rows && rows.length === 0 && <p>No exercises in this workout yet.</p>}
      {rows && rows.length > 0 && (
        <ul className={styles.list}>
          {rows.map((row) => (
            <WorkoutExerciseRow
              key={row.exerciseId}
              workoutExercise={row}
              onEdit={setEditRow}
              onRemove={setRemoveRow}
            />
          ))}
        </ul>
      )}

      <Modal open={isAdding} title="Add exercise" onClose={() => setIsAdding(false)}>
        {exercisesQuery.isLoading && !exercisesQuery.data && <Spinner />}
        {exercisesQuery.error && (
          <ErrorMessage message={exercisesQuery.error.message} onRetry={exercisesQuery.reload} />
        )}
        {exercisesQuery.data && availableExercises.length === 0 && (
          <p>Every exercise is already in this workout.</p>
        )}
        {availableExercises.length > 0 && (
          <AddWorkoutExerciseForm
            workoutId={workoutId}
            exercises={availableExercises}
            onSaved={afterChange}
            onCancel={() => setIsAdding(false)}
          />
        )}
      </Modal>

      <Modal open={editRow !== null} title="Edit exercise" onClose={() => setEditRow(null)}>
        {editRow && (
          <EditWorkoutExerciseForm
            workoutId={workoutId}
            workoutExercise={editRow}
            onSaved={afterChange}
            onCancel={() => setEditRow(null)}
          />
        )}
      </Modal>

      {removeRow && (
        <RemoveWorkoutExerciseDialog
          workoutId={workoutId}
          workoutExercise={removeRow}
          onRemoved={afterChange}
          onCancel={() => setRemoveRow(null)}
        />
      )}
    </section>
  );
}
