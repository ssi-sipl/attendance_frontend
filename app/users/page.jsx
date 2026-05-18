'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './page.module.css';
import { getUsers, deleteUser } from '@/app/utils/api';
import AppNavbar from '@/app/components/Navbar.jsx';
import PageHeader from '@/app/components/PageHeader.jsx';
import Pagination from '@/app/components/Pagination.jsx';
import Avatar from '@/app/components/Avatar.jsx';
import ProtectedRoute from '@/app/components/ProtectedRoute.jsx';

const ITEMS_PER_PAGE = 20;

function getInitials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function UsersPage() {
  

  

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

      const res = await getUsers(
        page,
        ITEMS_PER_PAGE,
        searchTerm
      );

      if (!res.success) {
        setError(res.message || 'Failed to fetch users');
        return;
      }

      const {
        users: rawUsers,
        total_pages: tp,
        total,
      } = res.data;

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
      setError(
        'Failed to load users. Make sure backend is running on port 5000.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    {
      fetchUsers(1, '');
    }
  }, [fetchUsers]);

  const handleSearchChange = (e) => {
    const val = e.target.value;

    setSearch(val);

    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      fetchUsers(1, val);
    }, 400);
  };

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);

      console.log('Deleting user:', id);

      const res = await deleteUser(id);

      console.log('Delete response:', res);

      if (!res.success) {
        alert(res.message || 'Failed to delete user');
        return;
      }

      setUsers((prev) =>
        prev.filter((u) => u.id !== id)
      );

      setTotalUsers((n) =>
        Math.max(0, n - 1)
      );

    } catch (err) {
      console.error(err);
      alert('Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;

    fetchUsers(page, search);
  };

    


  return (
    <ProtectedRoute>
    <div className={styles.page}>
      <AppNavbar showRefresh={true} onRefresh={() => fetchUsers(currentPage, search)} />

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <PageHeader
              title="Users"
              subtitle={
              loading
                ? 'Loading...'
                : ` ${totalUsers} active employees in the system`
  }
/>

          
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

            <button
              onClick={() =>
                fetchUsers(currentPage, search)
              }
              className={styles.retryBtn}
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className={styles.tableWrapper}>
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={styles.skeletonRow}
              />
            ))}
          </div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>
                      Employee ID
                    </th>

                    <th className={styles.th}>
                      Name
                    </th>

                    <th className={styles.th}></th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className={`${styles.row} ${
                        deletingId === user.id
                          ? styles.deleting
                          : ''
                      }`}
                    >
                      <td className={styles.td}>
                        <span className={styles.empId}>
                          {user.id}
                        </span>
                      </td>

                      <td className={styles.td}>
                        <div className={styles.nameCell}>
                          <Avatar name={user.name} />

                          <span className={styles.name}>
                            {user.name}
                          </span>
                        </div>
                      </td>

                      <td className={styles.td}>
                        <button
                          className={styles.deleteBtn}
                          onClick={() =>
                            handleDelete(user.id)
                          }
                          title="Delete user"
                          aria-label={`Delete ${user.name}`}
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
                  <span className={styles.emptyIcon}>
                    👥
                  </span>

                  <p className={styles.emptyText}>
                    No users found
                  </p>

                  <p className={styles.emptySubtext}>
                    {search
                      ? `No results for "${search}"`
                      : 'Add a new user to get started'}
                  </p>
                </div>
              )}
            </div>
            {totalPages > 1 && (
  <Pagination
    currentPage={currentPage}
    totalPages={totalPages}
    onPrev={() =>
      fetchUsers(currentPage - 1, search)
    }
    onNext={() =>
      fetchUsers(currentPage + 1, search)
    }
  />
)}

    
          </>
                 
        )}
      </main>
    </div>
    </ProtectedRoute>
  );
}