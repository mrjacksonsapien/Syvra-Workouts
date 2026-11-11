import { MUSCLE_GROUPS, type Exercise, type MuscleGroup } from '@syvra/shared';
import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { DeleteExerciseDialog } from '../components/exercises/DeleteExerciseDialog';
import { ExerciseCard } from '../components/exercises/ExerciseCard';
import { ExerciseForm } from '../components/exercises/ExerciseForm';
import { MuscleGroupFilter } from '../components/exercises/MuscleGroupFilter';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';
import { useExercises } from '../hooks/useExercises';
import styles from './ListPage.module.css';

export function ExercisesPage() {
  // The filter lives in the URL (?muscleGroup=legs): it survives refresh and can be shared.
  const [searchParams, setSearchParams] = useSearchParams();
  const param = searchParams.get('muscleGroup');
  const muscleGroup = MUSCLE_GROUPS.find((group) => group === param);

  const { data: exercises, error, isLoading, reload } = useExercises(muscleGroup);

  // 'new' = create form, an Exercise = edit form, null = closed.
  const [formTarget, setFormTarget] = useState<'new' | Exercise | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Exercise | null>(null);

  function changeFilter(group: MuscleGroup | undefined) {
    setSearchParams(group ? { muscleGroup: group } : {});
  }

  function afterChange() {
    setFormTarget(null);
    setDeleteTarget(null);
    reload();
  }

  return (
    <>
      <div className={styles.header}>
        <h1>Exercises</h1>
        <Button onClick={() => setFormTarget('new')}>New exercise</Button>
      </div>

      <MuscleGroupFilter value={muscleGroup} onChange={changeFilter} />

      {isLoading && !exercises && <Spinner />}
      {error && <ErrorMessage message={error.message} onRetry={reload} />}
      {exercises && exercises.length === 0 && (
        <EmptyState
          title="No exercises found"
          message={muscleGroup ? 'Nothing matches this filter.' : 'No exercises yet.'}
        >
          <Button onClick={() => setFormTarget('new')}>Create one</Button>
        </EmptyState>
      )}
      {exercises && exercises.length > 0 && (
        <ul className={styles.grid}>
          {exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onEdit={setFormTarget}
              onDelete={setDeleteTarget}
            />
          ))}
        </ul>
      )}

      <Modal
        open={formTarget !== null}
        title={formTarget === 'new' ? 'New exercise' : 'Edit exercise'}
        onClose={() => setFormTarget(null)}
      >
        <ExerciseForm
          exercise={formTarget === 'new' || formTarget === null ? undefined : formTarget}
          onSaved={afterChange}
          onCancel={() => setFormTarget(null)}
        />
      </Modal>

      {deleteTarget && (
        <DeleteExerciseDialog
          exercise={deleteTarget}
          onDeleted={afterChange}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
