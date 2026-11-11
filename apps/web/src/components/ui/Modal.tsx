import { useEffect, useRef, type ReactNode } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

// Uses the native <dialog>: showModal() gives focus trapping, the Esc key and a backdrop.
export function Modal({ open, title, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Keep the dialog's real state in sync with the `open` prop.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="modal-title"
      // Fired by Esc and by dialog.close(); the parent decides what "closed" means.
      onClose={onClose}
      // A click on the backdrop lands on the <dialog> itself, not on its content.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {open && (
        <div className={styles.content}>
          <h2 id="modal-title">{title}</h2>
          {children}
        </div>
      )}
    </dialog>
  );
}
