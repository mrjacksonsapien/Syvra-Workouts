import { Button } from './Button';
import { ErrorMessage } from './ErrorMessage';
import { Modal } from './Modal';
import styles from './ConfirmDialog.module.css';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  isPending?: boolean;
  // Server error to show inside the dialog (e.g. "Used in 3 workouts…").
  error?: Error | null;
  onConfirm: () => void;
  onCancel: () => void;
}

// Confirm step before every destructive action.
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  isPending = false,
  error = null,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p>{message}</p>
      {error && <ErrorMessage message={error.message} />}
      <div className={styles.actions}>
        <Button variant="secondary" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={isPending}>
          {isPending ? 'Working…' : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
