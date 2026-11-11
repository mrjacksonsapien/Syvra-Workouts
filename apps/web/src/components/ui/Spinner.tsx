import { useEffect, useState } from 'react';
import styles from './Spinner.module.css';

const SLOW_AFTER_MS = 5000;

// Shown while a request is pending. Render's free tier sleeps, so after a few seconds
// we explain the wait instead of looking frozen.
export function Spinner() {
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsSlow(true), SLOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.wrapper} role="status" aria-live="polite">
      <div className={styles.spinner} aria-hidden="true" />
      <p>Loading…</p>
      {isSlow && <p className={styles.hint}>Waking up the server, this can take up to a minute…</p>}
    </div>
  );
}
