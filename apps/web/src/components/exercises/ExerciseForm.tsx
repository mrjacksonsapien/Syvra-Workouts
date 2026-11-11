import { exerciseInputSchema, MUSCLE_GROUPS, type Exercise, type MuscleGroup } from '@syvra/shared';
import { ApiError } from '../../api/client';
import { createExercise, updateExercise } from '../../api/exercises';
import { useForm } from '../../hooks/useForm';
import { useMutation } from '../../hooks/useMutation';
import { muscleGroupLabel } from '../../utils/format';
import { Button } from '../ui/Button';
import { ErrorMessage } from '../ui/ErrorMessage';
import { FormField } from '../ui/FormField';
import styles from './ExerciseForm.module.css';

interface ExerciseFormProps {
  // Given: edit this exercise. Missing: create a new one.
  exercise?: Exercise;
  onSaved: () => void;
  onCancel: () => void;
}

export function ExerciseForm({ exercise, onSaved, onCancel }: ExerciseFormProps) {
  const { mutate, isPending, error } = useMutation((input: Parameters<typeof createExercise>[0]) =>
    exercise ? updateExercise(exercise.id, input) : createExercise(input),
  );

  const { values, errors, setField, handleSubmit } = useForm(
    exerciseInputSchema,
    {
      name: exercise?.name ?? '',
      muscleGroup: exercise?.muscleGroup ?? '',
      description: exercise?.description ?? '',
      equipment: exercise?.equipment ?? '',
    },
    // Empty optional fields are sent as null so they are cleared.
    (v) => ({
      name: v.name,
      muscleGroup: v.muscleGroup,
      description: v.description.trim() === '' ? null : v.description,
      equipment: v.equipment.trim() === '' ? null : v.equipment,
    }),
  );

  async function save(input: Parameters<typeof createExercise>[0]) {
    await mutate(input);
    onSaved();
  }

  // Field errors from the server are shown on the fields; anything else (e.g. name taken) here.
  const showFormError = error && !(error instanceof ApiError && error.code === 'VALIDATION_ERROR');

  return (
    <form onSubmit={handleSubmit(save)} noValidate>
      <FormField label="Name" error={errors.name}>
        {(p) => (
          <input {...p} value={values.name} onChange={(e) => setField('name', e.target.value)} />
        )}
      </FormField>
      <FormField label="Muscle group" error={errors.muscleGroup}>
        {(p) => (
          <select
            {...p}
            value={values.muscleGroup}
            onChange={(e) => setField('muscleGroup', e.target.value)}
          >
            <option value="">Choose…</option>
            {MUSCLE_GROUPS.map((group: MuscleGroup) => (
              <option key={group} value={group}>
                {muscleGroupLabel(group)}
              </option>
            ))}
          </select>
        )}
      </FormField>
      <FormField label="Equipment (optional)" error={errors.equipment}>
        {(p) => (
          <input
            {...p}
            value={values.equipment}
            onChange={(e) => setField('equipment', e.target.value)}
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
