import { NavLink } from 'react-router';
import styles from './NavBar.module.css';

// NavLink adds the "active" class to the link that matches the current URL.
const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? `${styles.link} ${styles.active}` : styles.link;

export function NavBar() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Main">
        {/* Plain text wordmark: the Syvra logo is never used in the app. */}
        <span className={styles.brand}>Syvra Workouts</span>
        <NavLink to="/workouts" className={linkClass}>
          Workouts
        </NavLink>
        <NavLink to="/exercises" className={linkClass}>
          Exercises
        </NavLink>
      </nav>
    </header>
  );
}
