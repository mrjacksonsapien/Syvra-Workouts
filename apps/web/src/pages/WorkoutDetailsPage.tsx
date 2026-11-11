import type { WorkoutExercise } from '@syvra/shared';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ApiError } from '../api/client';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';
import { AddWorkoutExerciseForm } from '../components/workouts/AddWorkoutExerciseForm';
import { DeleteWorkoutDialog } from '../components/workouts/DeleteWorkoutDialog';
import { EditWorkoutExerciseForm } from '../components/workouts/EditWorkoutExerciseForm';
import { RemoveWorkoutExerciseDialog } from '../components/workouts/RemoveWorkoutExerciseDialog';
import { WorkoutExerciseRow } from '../components/workouts/WorkoutExerciseRow';
import { WorkoutForm } from '../components/workouts/WorkoutForm';
import { useExercises } from '../hooks/useExercises';
import { useWorkout } from '../hooks/useWorkouts';
import { formatDate } from '../utils/format';
import styles from './WorkoutDetailsPage.module.css';

export function WorkoutDetailsPage() {
  const id = Number(useParams().id);
  const navigate = useNavigate();
  const { data: workout, error, isLoading, reload } = useWorkout(id);
  const exercisesQuery = useExercises();

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editRow, setEditRow] = useState<WorkoutExercise | null>(null);
  const [removeRow, setRemoveRow] = useState<WorkoutExercise | null>(null);

  if (isLoading && !workout) return <Spinner />;
  if (error) {
    // 400 = the id in the URL is not a valid number.
    const notFound = error instanceof ApiError && (error.status === 404 || error.status === 400);
    return notFound ? (
      <EmptyState title="Workout not found">
        <Link to="/workouts">Back to workouts</Link>
      </EmptyState>
    ) : (
      <ErrorMessage message={error.message} onRetry={reload} />
    );
  }
  if (!workout) return null;

  // Exercises already in the workout cannot be added twice.
  const usedIds = new Set(workout.exercises.map((row) => row.exerciseId));
  const availableExercises = (exercisesQuery.data ?? []).filter((e) => !usedIds.has(e.id));

  function afterRowChange() {
    setIsAdding(false);
    setEditRow(null);
    setRemoveRow(null);
    reload();
  }

  return (
    <>
      <Link to="/workouts">← Workouts</Link>
      <div className={styles.header}>
        <div>
          <h1>{workout.name}</h1>
          <p className={styles.muted}>{formatDate(workout.scheduledDate)}</p>
          {workout.description && <p>{workout.description}</p>}
        </div>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
          <Button variant="danger" onClick={() => setIsDeleting(true)}>
            Delete
          </Button>
        </div>
      </div>

      <div className={styles.sectionHeader}>
        <h2>Exercises</h2>
        <Button onClick={() => setIsAdding(true)}>Add exercise</Button>
      </div>
      {workout.exercises.length === 0 ? (
        <p>No exercises in this workout yet.</p>
      ) : (
        <ul className={styles.list}>
          {workout.exercises.map((row) => (
            <WorkoutExerciseRow
              key={row.exerciseId}
              workoutExercise={row}
              onEdit={setEditRow}
              onRemove={setRemoveRow}
            />
          ))}
        </ul>
      )}

      <Modal open={isEditing} title="Edit workout" onClose={() => setIsEditing(false)}>
        <WorkoutForm
          workout={workout}
          onSaved={() => {
            setIsEditing(false);
            reload();
          }}
          onCancel={() => setIsEditing(false)}
        />
      </Modal>

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
            workoutId={workout.id}
            exercises={availableExercises}
            onSaved={afterRowChange}
            onCancel={() => setIsAdding(false)}
          />
        )}
      </Modal>

      <Modal open={editRow !== null} title="Edit exercise" onClose={() => setEditRow(null)}>
        {editRow && (
          <EditWorkoutExerciseForm
            workoutId={workout.id}
            workoutExercise={editRow}
            onSaved={afterRowChange}
            onCancel={() => setEditRow(null)}
          />
        )}
      </Modal>

      {removeRow && (
        <RemoveWorkoutExerciseDialog
          workoutId={workout.id}
          workoutExercise={removeRow}
          onRemoved={afterRowChange}
          onCancel={() => setRemoveRow(null)}
        />
      )}

      {isDeleting && (
        <DeleteWorkoutDialog
          workout={workout}
          onDeleted={() => navigate('/workouts')}
          onCancel={() => setIsDeleting(false)}
        />
      )}
    </>
  );
}
