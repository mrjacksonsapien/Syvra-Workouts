import { FormField } from '../ui/FormField';

type FieldName = 'sets' | 'reps' | 'weightKg' | 'restSeconds';

interface WorkoutExerciseFieldsProps {
  values: Record<FieldName, string>;
  errors: Record<string, string>;
  setField: (field: FieldName, value: string) => void;
}

// The four number inputs shared by the "add" and "edit" forms.
export function WorkoutExerciseFields({ values, errors, setField }: WorkoutExerciseFieldsProps) {
  return (
    <>
      <FormField label="Sets" error={errors.sets}>
        {(p) => (
          <input
            {...p}
            type="number"
            inputMode="numeric"
            value={values.sets}
            onChange={(e) => setField('sets', e.target.value)}
          />
        )}
      </FormField>
      <FormField label="Reps" error={errors.reps}>
        {(p) => (
          <input
            {...p}
            type="number"
            inputMode="numeric"
            value={values.reps}
            onChange={(e) => setField('reps', e.target.value)}
          />
        )}
      </FormField>
      <FormField label="Weight in kg (optional)" error={errors.weightKg}>
        {(p) => (
          <input
            {...p}
            type="number"
            inputMode="decimal"
            step="any"
            value={values.weightKg}
            onChange={(e) => setField('weightKg', e.target.value)}
          />
        )}
      </FormField>
      <FormField label="Rest in seconds (optional)" error={errors.restSeconds}>
        {(p) => (
          <input
            {...p}
            type="number"
            inputMode="numeric"
            value={values.restSeconds}
            onChange={(e) => setField('restSeconds', e.target.value)}
          />
        )}
      </FormField>
    </>
  );
}
