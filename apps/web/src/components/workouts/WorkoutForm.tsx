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

interface WorkoutFormProps {
  // Given: edit this workout. Missing: create a new one.
  workout?: Workout;
  onSaved: () => void;
  onCancel: () => void;
}

export function WorkoutForm({ workout, onSaved, onCancel }: WorkoutFormProps) {
  const { mutate, isPending, error } = useMutation((input: WorkoutInput) =>
    workout ? updateWorkout(workout.id, input) : createWorkout(input),
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
    await mutate(input);
    onSaved();
  }

  const showFormError = error && !(error instanceof ApiError && error.code === 'VALIDATION_ERROR');

  return (
    <form onSubmit={handleSubmit(save)} noValidate>
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
      <div className={styles.actions}>
        <Button variant="secondary" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  );
}
