import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ApiError } from '../api/client';
import { DeleteExerciseDialog } from '../components/exercises/DeleteExerciseDialog';
import { ExerciseForm } from '../components/exercises/ExerciseForm';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';
import { useExercise, useExerciseWorkouts } from '../hooks/useExercises';
import { formatDate, formatSetsReps, muscleGroupLabel } from '../utils/format';
import styles from './ExerciseDetailsPage.module.css';

export function ExerciseDetailsPage() {
  const id = Number(useParams().id);
  const navigate = useNavigate();
  const exerciseQuery = useExercise(id);
  const workoutsQuery = useExerciseWorkouts(id);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: exercise, error, isLoading, reload } = exerciseQuery;

  if (isLoading && !exercise) return <Spinner />;
  if (error) {
    // 400 = the id in the URL is not a valid number.
    const notFound = error instanceof ApiError && (error.status === 404 || error.status === 400);
    return notFound ? (
      <EmptyState title="Exercise not found">
        <Link to="/exercises">Back to exercises</Link>
      </EmptyState>
    ) : (
      <ErrorMessage message={error.message} onRetry={reload} />
    );
  }
  if (!exercise) return null;

  const workouts = workoutsQuery.data;

  return (
    <>
      <Link to="/exercises">← Exercises</Link>
      <div className={styles.header}>
        <div>
          <h1>{exercise.name}</h1>
          <Badge>{muscleGroupLabel(exercise.muscleGroup)}</Badge>
          {exercise.equipment && <p className={styles.muted}>Equipment: {exercise.equipment}</p>}
          {exercise.description && <p>{exercise.description}</p>}
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

      <h2>Used in {workouts ? `${workouts.length} ` : ''}workouts</h2>
      {workoutsQuery.isLoading && !workouts && <Spinner />}
      {workoutsQuery.error && (
        <ErrorMessage message={workoutsQuery.error.message} onRetry={workoutsQuery.reload} />
      )}
      {workouts && workouts.length === 0 && <p>Not used in any workout yet.</p>}
      {workouts && workouts.length > 0 && (
        <ul className={styles.list}>
          {workouts.map((workout) => (
            <li key={workout.id} className={styles.item}>
              <Link to={`/workouts/${workout.id}`}>{workout.name}</Link>
              <span className={styles.muted}>{formatDate(workout.scheduledDate)}</span>
              <span>
                {formatSetsReps(workout.sets, workout.reps, workout.weightKg, workout.restSeconds)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <Modal open={isEditing} title="Edit exercise" onClose={() => setIsEditing(false)}>
        <ExerciseForm
          exercise={exercise}
          onSaved={() => {
            setIsEditing(false);
            reload();
          }}
          onCancel={() => setIsEditing(false)}
        />
      </Modal>

      {isDeleting && (
        <DeleteExerciseDialog
          exercise={exercise}
          onDeleted={() => navigate('/exercises')}
          onCancel={() => setIsDeleting(false)}
        />
      )}
    </>
  );
}
