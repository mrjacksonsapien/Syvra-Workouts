import { useState, type FormEvent } from 'react';
import { flattenError, type ZodType } from 'zod';
import { ApiError } from '../api/client';

// Form fields are strings (what <input> gives us), keyed by field name.
type FormValues = Record<string, string>;
type FormErrors = Record<string, string>;

// Form state + validation with the same zod schema the API uses.
// - `toInput` converts the string values into the object the schema expects
//   (numbers as numbers, empty optional fields as null).
// - Validation runs on submit; after the first submit, a field is re-validated when it changes.
// - If the API answers 400 with fieldErrors, they are shown on the matching fields.
export function useForm<Values extends FormValues, Input>(
  schema: ZodType<Input>,
  initialValues: Values,
  toInput: (values: Values) => unknown = (values) => values,
) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Returns the first message per field, or the parsed data when everything is valid.
  function validate(current: Values) {
    const result = schema.safeParse(toInput(current));
    if (result.success) return { data: result.data, errors: {} as FormErrors };
    const fieldErrors: FormErrors = {};
    for (const [field, messages] of Object.entries(flattenError(result.error).fieldErrors)) {
      if (Array.isArray(messages) && messages.length > 0) fieldErrors[field] = String(messages[0]);
    }
    return { data: undefined, errors: fieldErrors };
  }

  function setField(field: keyof Values & string, value: string) {
    const next = { ...values, [field]: value };
    setValues(next);
    if (!hasSubmitted) return;
    // Only this field's message is updated; other fields keep what they showed.
    const message = validate(next).errors[field];
    setErrors((previous) => {
      const updated = { ...previous };
      if (message) updated[field] = message;
      else delete updated[field];
      return updated;
    });
  }

  // Use as <form onSubmit={handleSubmit(save)}>. `onValid` receives the validated data.
  function handleSubmit(onValid: (data: Input) => Promise<unknown> | unknown) {
    return async (event: FormEvent) => {
      event.preventDefault();
      setHasSubmitted(true);
      const result = validate(values);
      setErrors(result.errors);
      if (result.data === undefined) return;

      try {
        await onValid(result.data);
      } catch (err) {
        if (!(err instanceof ApiError)) throw err;
        // Server-side field errors go onto the fields; any other API error is
        // already available to the page through useMutation().error.
        const serverErrors = err.details?.fieldErrors ?? {};
        const mapped: FormErrors = {};
        for (const [field, messages] of Object.entries(serverErrors)) {
          if (messages.length > 0) mapped[field] = messages[0];
        }
        setErrors(mapped);
      }
    };
  }

  function reset(newValues: Values = initialValues) {
    setValues(newValues);
    setErrors({});
    setHasSubmitted(false);
  }

  return { values, errors, setField, handleSubmit, reset };
}
