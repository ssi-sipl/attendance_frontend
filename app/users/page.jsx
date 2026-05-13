'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { getUsers, deleteUser } from '@/app/utils/api';

const ITEMS_PER_PAGE = 20;

function getInitials(name = '') {
  return name
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [search, setSearch] = useState('');
  const debounceRef = useRef(null);

  const fetchUsers = useCallback(async (page = 1, searchTerm = '') => {
    try {
      setLoading(true);
      setError(null);

      const res = await getUsers(page, ITEMS_PER_PAGE, searchTerm);

      if (!res.success) {
        setError(res.message || 'Failed to fetch users');
        return;
      }

      const { users: rawUsers, total_pages: tp, total } = res.data || {};

      setUsers(
        (rawUsers || []).map((u) => ({
          id: u.user_id,
          name: u.name,
          status: u.status,
        }))
      );
      setTotalPages(tp || 1);
      setTotalUsers(total || 0);
      setCurrentPage(page);
    } catch (err) {
      setError('Failed to load users. Make sure the backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(1, '');
  }, [fetchUsers]);

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchUsers(1, val);
    }, 400);
  };

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(`Are you sure you want to delete ${name}?`);
    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError(null);

      const res = await deleteUser(id);

      if (!res.success) {
        setError(res.message || 'Failed to delete user');
        setDeletingId(null);
        return;
      }

      const remainingUsers = users.filter((u) => u.id !== id);
      const nextTotal = Math.max(0, totalUsers - 1);

      setUsers(remainingUsers);
      setTotalUsers(nextTotal);

      if (remainingUsers.length === 0 && currentPage > 1) {
        await fetchUsers(currentPage - 1, search);
      } else {
        await fetchUsers(currentPage, search);
      }
    } catch (err) {
      setError('Failed to delete user. Make sure the backend is running.');
    } finally {
      setDeletingId(null);
    }
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    fetchUsers(page, search);
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
        <button className={styles.logoutBtn} onClick={() => router.push('/')}>
          Sign Out
        </button>
      </header>

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.heading}>Users</h1>
            <p className={styles.subheading}>
              {loading ? 'Loading…' : `${totalUsers} active employees in the system`}
            </p>
          </div>
          <button
            className={styles.refreshBtn}
            onClick={() => fetchUsers(currentPage, search)}
            title="Refresh"
          >
            🔄 Refresh
          </button>
        </div>

        <div className={styles.searchWrapper}>
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Search by name or ID…"
            value={search}
            onChange={handleSearchChange}
            aria-label="Search users"
          />
        </div>

        {error && (
          <div className={styles.errorBox}>
            <span>⚠️ {error}</span>
            <button onClick={() => fetchUsers(currentPage, search)} className={styles.retryBtn}>
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className={styles.tableWrapper}>
            {[...Array(8)].map((_, i) => (
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
                          onClick={() => handleDelete(user.id, user.name)}
                          title="Delete user"
                          aria-label={`Delete ${user.name}`}
                          disabled={deletingId === user.id}
                        >
                          {deletingId === user.id ? 'Deleting...' : '🗑️'}
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
                  <p className={styles.emptySubtext}>
                    {search ? `No results for "${search}"` : 'Add a new user to get started'}
                  </p>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageBtn}
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ← Prev
                </button>
                <span className={styles.pageInfo}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className={styles.pageBtn}
                  onClick={() => goToPage(currentPage + 1)}
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
