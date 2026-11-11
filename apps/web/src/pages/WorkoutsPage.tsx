import type { WorkoutSummary } from '@syvra/shared';
import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';
import { DeleteWorkoutDialog } from '../components/workouts/DeleteWorkoutDialog';
import { WorkoutCard } from '../components/workouts/WorkoutCard';
import { WorkoutForm } from '../components/workouts/WorkoutForm';
import { useWorkouts } from '../hooks/useWorkouts';
import styles from './ListPage.module.css';

export function WorkoutsPage() {
  const { data: workouts, error, isLoading, reload } = useWorkouts();

  // 'new' = create form, a workout = edit form, null = closed.
  const [formTarget, setFormTarget] = useState<'new' | WorkoutSummary | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WorkoutSummary | null>(null);

  function afterChange() {
    setFormTarget(null);
    setDeleteTarget(null);
    reload();
  }

  return (
    <>
      <div className={styles.header}>
        <h1>Workouts</h1>
        <Button onClick={() => setFormTarget('new')}>New workout</Button>
      </div>

      {isLoading && !workouts && <Spinner />}
      {error && <ErrorMessage message={error.message} onRetry={reload} />}
      {workouts && workouts.length === 0 && (
        <EmptyState title="No workouts yet" message="Create your first workout.">
          <Button onClick={() => setFormTarget('new')}>Create one</Button>
        </EmptyState>
      )}
      {workouts && workouts.length > 0 && (
        <ul className={styles.grid}>
          {workouts.map((workout) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              onEdit={setFormTarget}
              onDelete={setDeleteTarget}
            />
          ))}
        </ul>
      )}

      <Modal
        open={formTarget !== null}
        title={formTarget === 'new' ? 'New workout' : 'Edit workout'}
        onClose={() => setFormTarget(null)}
      >
        <WorkoutForm
          workout={formTarget === 'new' || formTarget === null ? undefined : formTarget}
          onSaved={afterChange}
          onCancel={() => setFormTarget(null)}
        />
      </Modal>

      {deleteTarget && (
        <DeleteWorkoutDialog
          workout={deleteTarget}
          onDeleted={afterChange}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
