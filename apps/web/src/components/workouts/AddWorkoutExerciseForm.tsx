import {
  addWorkoutExerciseSchema,
  type AddWorkoutExerciseInput,
  type Exercise,
} from '@syvra/shared';
import { ApiError } from '../../api/client';
import { addExerciseToWorkout } from '../../api/workouts';
import { useForm } from '../../hooks/useForm';
import { useMutation } from '../../hooks/useMutation';
import { toNumber, toNumberOrNull } from '../../utils/form';
import { Button } from '../ui/Button';
import { ErrorMessage } from '../ui/ErrorMessage';
import { FormField } from '../ui/FormField';
import styles from './WorkoutExerciseForm.module.css';
import { WorkoutExerciseFields } from './WorkoutExerciseFields';

interface AddWorkoutExerciseFormProps {
  workoutId: number;
  // Exercises that can still be added (the ones already in the workout are left out).
  exercises: Exercise[];
  onSaved: () => void;
  onCancel: () => void;
}

export function AddWorkoutExerciseForm({
  workoutId,
  exercises,
  onSaved,
  onCancel,
}: AddWorkoutExerciseFormProps) {
  const { mutate, isPending, error } = useMutation((input: AddWorkoutExerciseInput) =>
    addExerciseToWorkout(workoutId, input),
  );

  const { values, errors, setField, handleSubmit } = useForm(
    addWorkoutExerciseSchema,
    { exerciseId: '', sets: '', reps: '', weightKg: '', restSeconds: '' },
    (v) => ({
      exerciseId: toNumber(v.exerciseId),
      sets: toNumber(v.sets),
      reps: toNumber(v.reps),
      weightKg: toNumberOrNull(v.weightKg),
      restSeconds: toNumberOrNull(v.restSeconds),
    }),
  );

  async function save(input: AddWorkoutExerciseInput) {
    await mutate(input);
    onSaved();
  }

  const showFormError = error && !(error instanceof ApiError && error.code === 'VALIDATION_ERROR');

  return (
    <form onSubmit={handleSubmit(save)} noValidate>
      <FormField label="Exercise" error={errors.exerciseId}>
        {(p) => (
          <select
            {...p}
            value={values.exerciseId}
            onChange={(e) => setField('exerciseId', e.target.value)}
          >
            <option value="">Choose…</option>
            {exercises.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
              </option>
            ))}
          </select>
        )}
      </FormField>
      <WorkoutExerciseFields values={values} errors={errors} setField={setField} />
      {showFormError && <ErrorMessage message={error.message} />}
      <div className={styles.actions}>
        <Button variant="secondary" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving…' : 'Add'}
        </Button>
      </div>
    </form>
  );
}
