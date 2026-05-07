'use client';

import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const tiles = [
  {
    id: 'attendance',
    icon: '✅',
    title: 'Attendance',
    description: 'Mark and track daily student attendance records',
    color: '#4f46e5',
    highlight: '#eef2ff',
  },
  {
    id: 'users',
    icon: '👤',
    title: 'Users',
    description: 'Manage teachers, admins and system user accounts',
    color: '#0891b2',
    highlight: '#ecfeff',
  },
  {
    id: 'enrollment',
    icon: '📋',
    title: 'Enrollment',
    description: 'Enroll students into classes and manage rosters',
    color: '#059669',
    highlight: '#ecfdf5',
  },
];

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className={styles.page}>
      <header className={styles.navbar}>
        <div className={styles.navLeft}>
          <span className={styles.navLogo}>📋</span>
          <span className={styles.navTitle}>AttendEase</span>
        </div>
        <button className={styles.logoutBtn} onClick={() => router.push('/login')}>
          Sign Out
        </button>
      </header>

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h1 className={styles.heading}>Dashboard</h1>
          <p className={styles.subheading}>Select a module to get started</p>
        </div>

        <div className={styles.grid}>
          {tiles.map((tile) => (
            <button
              key={tile.id}
              className={styles.tile}
              onClick={() => router.push(`/${tile.id}`)}
              style={{ '--tile-color': tile.color, '--tile-highlight': tile.highlight }}
            >
              <div className={styles.tileIcon}>{tile.icon}</div>
              <div className={styles.tileBody}>
                <h2 className={styles.tileTitle}>{tile.title}</h2>
                <p className={styles.tileDesc}>{tile.description}</p>
              </div>
              <span className={styles.tileArrow}>→</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
