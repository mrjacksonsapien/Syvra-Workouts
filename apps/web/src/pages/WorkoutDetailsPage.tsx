import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ApiError } from '../api/client';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';
import { DeleteWorkoutDialog } from '../components/workouts/DeleteWorkoutDialog';
import { WorkoutExercisesPanel } from '../components/workouts/WorkoutExercisesPanel';
import { WorkoutForm } from '../components/workouts/WorkoutForm';
import { useWorkout } from '../hooks/useWorkouts';
import { formatDate } from '../utils/format';
import styles from './WorkoutDetailsPage.module.css';

export function WorkoutDetailsPage() {
  const id = Number(useParams().id);
  const navigate = useNavigate();
  const { data: workout, error, isLoading, reload } = useWorkout(id);

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // Changing the key remounts the exercise list, so it reloads after the edit modal changed it.
  const [panelKey, setPanelKey] = useState(0);

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

  // The edit modal can also change the exercises, so closing it refreshes everything.
  function closeEdit() {
    if (!isEditing) return; // the modal also reports a close after we close it ourselves
    setIsEditing(false);
    setPanelKey((key) => key + 1);
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

      <WorkoutExercisesPanel key={panelKey} workoutId={workout.id} />

      <Modal open={isEditing} title="Edit workout" onClose={closeEdit}>
        <WorkoutForm workout={workout} onSaved={closeEdit} onCancel={closeEdit} />
      </Modal>

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
