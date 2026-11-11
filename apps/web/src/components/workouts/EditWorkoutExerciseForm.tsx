import {
  updateWorkoutExerciseSchema,
  type UpdateWorkoutExerciseInput,
  type WorkoutExercise,
} from '@syvra/shared';
import { ApiError } from '../../api/client';
import { updateWorkoutExercise } from '../../api/workouts';
import { useForm } from '../../hooks/useForm';
import { useMutation } from '../../hooks/useMutation';
import { toNumber, toNumberOrNull } from '../../utils/form';
import { Button } from '../ui/Button';
import { ErrorMessage } from '../ui/ErrorMessage';
import { FormField } from '../ui/FormField';
import styles from './WorkoutExerciseForm.module.css';
import { WorkoutExerciseFields } from './WorkoutExerciseFields';

interface EditWorkoutExerciseFormProps {
  workoutId: number;
  workoutExercise: WorkoutExercise;
  onSaved: () => void;
  onCancel: () => void;
}

export function EditWorkoutExerciseForm({
  workoutId,
  workoutExercise,
  onSaved,
  onCancel,
}: EditWorkoutExerciseFormProps) {
  const { mutate, isPending, error } = useMutation((input: UpdateWorkoutExerciseInput) =>
    updateWorkoutExercise(workoutId, workoutExercise.exerciseId, input),
  );

  const { values, errors, setField, handleSubmit } = useForm(
    updateWorkoutExerciseSchema,
    {
      sets: String(workoutExercise.sets),
      reps: String(workoutExercise.reps),
      weightKg: workoutExercise.weightKg === null ? '' : String(workoutExercise.weightKg),
      restSeconds: workoutExercise.restSeconds === null ? '' : String(workoutExercise.restSeconds),
      position: String(workoutExercise.position),
    },
    (v) => ({
      sets: toNumber(v.sets),
      reps: toNumber(v.reps),
      weightKg: toNumberOrNull(v.weightKg),
      restSeconds: toNumberOrNull(v.restSeconds),
      position: toNumber(v.position),
    }),
  );

  async function save(input: UpdateWorkoutExerciseInput) {
    await mutate(input);
    onSaved();
  }

  const showFormError = error && !(error instanceof ApiError && error.code === 'VALIDATION_ERROR');

  return (
    <form onSubmit={handleSubmit(save)} noValidate>
      <p>{workoutExercise.exercise.name}</p>
      <WorkoutExerciseFields values={values} errors={errors} setField={setField} />
      <FormField label="Position in the workout" error={errors.position}>
        {(p) => (
          <input
            {...p}
            type="number"
            inputMode="numeric"
            value={values.position}
            onChange={(e) => setField('position', e.target.value)}
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
