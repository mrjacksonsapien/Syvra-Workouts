import { Outlet } from 'react-router';
import { NavBar } from './NavBar';
import styles from './AppLayout.module.css';

export function AppLayout() {
  return (
    <>
      <NavBar />
      <main className={styles.main}>
        <Outlet />
      </main>
    </>
  );
}
