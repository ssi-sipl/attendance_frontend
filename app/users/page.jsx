'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const initialUsers = [
  { id: 'EMP001', name: 'Rajesh Kumar' },
  { id: 'EMP002', name: 'Priya Sharma' },
  { id: 'EMP003', name: 'Amit Verma' },
  { id: 'EMP004', name: 'Sunita Patel' },
  { id: 'EMP005', name: 'Rohan Mehta' },
  { id: 'EMP006', name: 'Kavya Nair' },
];

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = (id) => {
    setDeletingId(id);
    setTimeout(() => {
      setUsers(prev => prev.filter(u => u.id !== id));
      setDeletingId(null);
    }, 300);
  };

  return (
    <div className={styles.page}>
      <header className={styles.navbar}>
        <div className={styles.navLeft}>
          <button className={styles.backBtn} onClick={() => router.push('/dashboard')}>
            ← Back
          </button>
          <div className={styles.divider} />
          <span className={styles.navLogo}>📋</span>
          <span className={styles.navTitle}>AttendEase</span>
        </div>
        <button className={styles.logoutBtn} onClick={() => router.push('/login')}>
          Sign Out
        </button>
      </header>

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.heading}>Users</h1>
            <p className={styles.subheading}>{users.length} active users in the system</p>
          </div>
          
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Employee ID</th>
                <th className={styles.th}>Name</th>
                <th className={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className={`${styles.row} ${deletingId === user.id ? styles.deleting : ''}`}
                >
                  <td className={styles.td}>
                    <span className={styles.empId}>{user.id}</span>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.nameCell}>
                      <div className={styles.avatar}>{getInitials(user.name)}</div>
                      <span className={styles.name}>{user.name}</span>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(user.id)}
                      title="Delete user"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>👥</span>
              <p className={styles.emptyText}>No users found</p>
              <p className={styles.emptySubtext}>Add a new user to get started</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
