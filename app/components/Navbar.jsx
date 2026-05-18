'use client';

import { useRouter } from 'next/navigation';
import styles from './Navbar.module.css';

export default function AppNavbar({
  showRefresh = false,
  onRefresh = null,
}) {
  const router = useRouter();

  return (
    <header className={styles.navbar}>
      <div className={styles.navLeft}>
        <button
          className={styles.backBtn}
          onClick={() => router.push('/dashboard')}
        >
          ← Back
        </button>

        <div className={styles.divider} />

        <span className={styles.navLogo}>
          📋
        </span>

        <span className={styles.navTitle}>
          NCattendance
        </span>
      </div>

      <div className={styles.navRight}>
        {showRefresh && (
          <button
            className={styles.refreshBtn}
            onClick={onRefresh}
            title="Refresh"
          >
            🔄
          </button>
        )}

        <button
          className={styles.logoutBtn}
          onClick={() => {
            localStorage.removeItem('isLoggedIn');
            router.push('/');
          }}
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}