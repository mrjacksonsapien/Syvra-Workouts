import type { ReactNode } from 'react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  title: string;
  message?: string;
  // Call to action, e.g. a "Create one" button or a link.
  children?: ReactNode;
}

export function EmptyState({ title, message, children }: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      <h2>{title}</h2>
      {message && <p>{message}</p>}
      {children}
    </div>
  );
}
