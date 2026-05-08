'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { getUsers } from '@/lib/api';

const ITEMS_PER_PAGE = 20;

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
  const paginatedUsers = users.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log("Fetch Users called");
      setLoading(true);
      setError(null);
      const res = await getUsers();
      console.log("response: ", res);
      const mapped = res.data.data.map(u => ({
        id: u.user_id,
        name: u.name,
        status: u.status,
      }));
      console.log(mapped);
      setUsers(mapped);
    } catch (err) {
      setError('Failed to load users. Make sure the backend is running on port 5000.');
      console.log("Error at page/users/fetchUsers: ", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    setTimeout(() => {
      setUsers(prev => {
        const updated = prev.filter(u => u.id !== id);
        const newTotalPages = Math.ceil(updated.length / ITEMS_PER_PAGE);
        if (currentPage > newTotalPages) setCurrentPage(Math.max(1, newTotalPages));
        return updated;
      });
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
          <span className={styles.navTitle}>NCattendance</span>
        </div>
        <button className={styles.logoutBtn} onClick={() => router.push('/login')}>
          Sign Out
        </button>
      </header>

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.heading}>Users</h1>
            <p className={styles.subheading}>
              {loading ? 'Loading...' : `${users.length} active employees in the system`}
            </p>
          </div>
          <button className={styles.refreshBtn} onClick={fetchUsers} title="Refresh">
            🔄 Refresh
          </button>
        </div>

        {error && (
          <div className={styles.errorBox}>
            <span>⚠️ {error}</span>
            <button onClick={fetchUsers} className={styles.retryBtn}>Retry</button>
          </div>
        )}

        {loading ? (
          <div className={styles.tableWrapper}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className={styles.skeletonRow} />
            ))}
          </div>
        ) : (
          <>
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
                  {paginatedUsers.map((user) => (
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

              {users.length === 0 && !loading && (
                <div className={styles.empty}>
                  <span className={styles.emptyIcon}>👥</span>
                  <p className={styles.emptyText}>No users found</p>
                  <p className={styles.emptySubtext}>Add a new user to get started</p>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageBtn}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  ← Previous
                </button>
                <span className={styles.pageInfo}>Page {currentPage} of {totalPages}</span>
                <button
                  className={styles.pageBtn}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
