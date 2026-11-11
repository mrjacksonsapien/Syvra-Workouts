import { Button } from './Button';
import styles from './ErrorMessage.module.css';

interface ErrorMessageProps {
  message: string;
  // When given, a "Retry" button is shown (pages pass the hook's reload()).
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className={styles.error} role="alert">
      <p>{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
