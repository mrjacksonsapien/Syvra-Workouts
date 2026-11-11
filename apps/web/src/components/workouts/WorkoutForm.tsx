import { useState } from 'react';
import { workoutInputSchema, type Workout, type WorkoutInput } from '@syvra/shared';
import { ApiError } from '../../api/client';
import { createWorkout, updateWorkout } from '../../api/workouts';
import { useForm } from '../../hooks/useForm';
import { useMutation } from '../../hooks/useMutation';
import { toTextOrNull } from '../../utils/form';
import { Button } from '../ui/Button';
import { ErrorMessage } from '../ui/ErrorMessage';
import { FormField } from '../ui/FormField';
import styles from './WorkoutForm.module.css';
import { WorkoutExercisesPanel } from './WorkoutExercisesPanel';

interface WorkoutFormProps {
  // Given: edit this workout. Missing: create a new one.
  workout?: Workout;
  onSaved: () => void;
  onCancel: () => void;
}

const FORM_ID = 'workout-form';

export function WorkoutForm({ workout, onSaved, onCancel }: WorkoutFormProps) {
  // The workout being edited. When creating, it is filled in after the first save, so the
  // exercises (which need a workout id) can be managed without closing the modal.
  const [current, setCurrent] = useState(workout);

  const { mutate, isPending, error } = useMutation((input: WorkoutInput) =>
    current ? updateWorkout(current.id, input) : createWorkout(input),
  );

  const { values, errors, setField, handleSubmit } = useForm(
    workoutInputSchema,
    {
      name: workout?.name ?? '',
      description: workout?.description ?? '',
      scheduledDate: workout?.scheduledDate ?? '',
    },
    (v) => ({
      name: v.name,
      description: toTextOrNull(v.description),
      scheduledDate: toTextOrNull(v.scheduledDate),
    }),
  );

  async function save(input: WorkoutInput) {
    const wasNew = current === undefined;
    const saved = await mutate(input);
    if (wasNew)
      setCurrent(saved); // stay open: the exercises can be added now
    else onSaved();
  }

  const showFormError = error && !(error instanceof ApiError && error.code === 'VALIDATION_ERROR');

  return (
    <>
      <form id={FORM_ID} onSubmit={handleSubmit(save)} noValidate>
        <FormField label="Name" error={errors.name}>
          {(p) => (
            <input {...p} value={values.name} onChange={(e) => setField('name', e.target.value)} />
          )}
        </FormField>
        <FormField label="Scheduled date (optional)" error={errors.scheduledDate}>
          {(p) => (
            <input
              {...p}
              type="date"
              value={values.scheduledDate}
              onChange={(e) => setField('scheduledDate', e.target.value)}
            />
          )}
        </FormField>
        <FormField label="Description (optional)" error={errors.description}>
          {(p) => (
            <textarea
              {...p}
              rows={4}
              value={values.description}
              onChange={(e) => setField('description', e.target.value)}
            />
          )}
        </FormField>
        {showFormError && <ErrorMessage message={error.message} />}
      </form>

      {/* Outside the <form>: the panel has its own modals with forms, and forms cannot be nested. */}
      {current ? (
        <>
          <WorkoutExercisesPanel workoutId={current.id} />
          <p className={styles.hint}>
            Exercise changes are saved immediately. Use Save for the name, date and description.
          </p>
        </>
      ) : (
        <p className={styles.hint}>Save the workout first, then you can add exercises.</p>
      )}

      <div className={styles.actions}>
        <Button variant="secondary" onClick={onCancel} disabled={isPending}>
          {current ? 'Close' : 'Cancel'}
        </Button>
        {/* Outside the <form> element, so it is linked with the `form` attribute. */}
        <Button type="submit" form={FORM_ID} disabled={isPending}>
          {isPending ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </>
  );
}
