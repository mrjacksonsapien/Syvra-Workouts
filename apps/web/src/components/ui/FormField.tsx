import { useId, type ReactNode } from 'react';
import styles from './FormField.module.css';

// Props to spread on the control (<input>, <select>, <textarea>) so the label,
// the error text and the accessibility attributes are wired together.
interface ControlProps {
  id: string;
  'aria-invalid': boolean;
  'aria-describedby': string | undefined;
}

interface FormFieldProps {
  label: string;
  error?: string;
  children: (controlProps: ControlProps) => ReactNode;
}

// Usage: <FormField label="Name" error={errors.name}>{(p) => <input {...p} />}</FormField>
export function FormField({ label, error, children }: FormFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      {children({
        id,
        'aria-invalid': Boolean(error),
        'aria-describedby': error ? errorId : undefined,
      })}
      {/* The region always exists so screen readers announce the message when it appears. */}
      <div id={errorId} className={styles.error} aria-live="polite">
        {error}
      </div>
    </div>
  );
}
