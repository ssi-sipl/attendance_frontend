'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './page.module.css';
import { getAttendance } from '@/app/utils/api';
import useSocket from '@/lib/useSocket';
import AppNavbar from '@/app/components/Navbar.jsx';
import PageHeader from '@/app/components/PageHeader.jsx';
import EmptyState from '@/app/components/EmptyState.jsx';
import Avatar from '@/app/components/Avatar.jsx';
import ProtectedRoute from '@/app/components/ProtectedRoute.jsx';
import Pagination from '@/app/components/Pagination.jsx';

const today = new Date().toLocaleDateString('en-CA');
const ITEMS_PER_PAGE = 20;

function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}

function getInitials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(
    'en-IN',
    {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }
  );
}

function SkeletonRows({ cols = 3, count = 8 }) {
  const widths = ['40%', '70%', '55%', '40%'];

  return Array(count)
    .fill(0)
    .map((_, i) => (
      <tr key={i} className={styles.row}>
        {Array(cols)
          .fill(0)
          .map((_, j) => (
            <td key={j} className={styles.td}>
              <div
                className={styles.skeleton}
                style={{
                  width: widths[j] || '60%',
                }}
              />
            </td>
          ))}
      </tr>
    ));
}

export default function AttendancePage() {
  

   

  const [activeTab, setActiveTab] = useState('daily');

  const [selectedDate, setSelectedDate] =
    useState(today);

  const [empIdFilterInput, setEmpIdFilterInput] =
    useState('');

  const [currentPage, setCurrentPage] =
    useState(1);

  const [allRecords, setAllRecords] = useState([]);

  const [totalPages, setTotalPages] =
    useState(1);

  const [totalRecords, setTotalRecords] =
    useState(0);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [selectedEmployee, setSelectedEmployee] =
    useState('');

  const [
    selectedEmployeeName,
    setSelectedEmployeeName,
  ] = useState('');

  const [empViewInput, setEmpViewInput] =
    useState('');

  const [empRecords, setEmpRecords] =
    useState([]);

  const [empPage, setEmpPage] = useState(1);

  const [empTotalPages, setEmpTotalPages] =
    useState(1);

  const [empTotalRecords, setEmpTotalRecords] =
    useState(0);

  const [empLoading, setEmpLoading] =
    useState(false);

  const [empError, setEmpError] =
    useState(null);

  
    

  const debouncedEmpId = useDebounce(
    empIdFilterInput,
    400
  );

  const fetchAttendance = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError(null);

        const res = await getAttendance(
          debouncedEmpId,
          selectedDate,
          page,
          ITEMS_PER_PAGE
        );

        if (!res.success) {
          setError(
            res.message ||
              'Failed to fetch attendance'
          );
          return;
        }

        const {
          records,
          total_pages,
          total,
        } = res.data;

        setAllRecords(
          (records || []).map((r) => ({
            empId: r.user_id,
            name: r.name,
            date: r.date,
            entry_time: r.entry_time,
            exit_time: r.exit_time,
            status: r.status,
          }))
        );

        setTotalPages(total_pages || 1);
        setTotalRecords(total || 0);
        setCurrentPage(page);

      } catch (err) {
        setError(
          'Failed to load attendance. Make sure the backend is running on port 5000.'
        );
      } finally {
        setLoading(false);
      }
    },
    [selectedDate, debouncedEmpId]
  );

  useEffect(() => {
  fetchAttendance(1);
}, [fetchAttendance]);
  useSocket(() =>
    fetchAttendance(currentPage)
  );

  const fetchEmployeeRecords = useCallback(
    async (userId, page = 1) => {
      if (!userId) return;

      try {
        setEmpLoading(true);
        setEmpError(null);

        const res = await getAttendance(
          userId,
          '',
          page,
          ITEMS_PER_PAGE
        );

        if (!res.success) {
          setEmpError(
            res.message ||
              'Failed to fetch records'
          );
          return;
        }

        const {
          records,
          total_pages,
          total,
        } = res.data;

        if (!records.length && page === 1) {
          setSelectedEmployee('NOT_FOUND');
          setSelectedEmployeeName('');
          setEmpRecords([]);
          return;
        }

        const mapped = (records || []).map(
          (r) => ({
            empId: r.user_id,
            name: r.name,
            date: r.date,
            entry_time: r.entry_time,
            exit_time: r.exit_time,
            status: r.status,
          })
        );

        setEmpRecords(mapped);

        setEmpTotalPages(total_pages || 1);

        setEmpTotalRecords(total || 0);

        setEmpPage(page);

        setSelectedEmployee(userId);

        if (page === 1) {
          setSelectedEmployeeName(
            mapped[0]?.name || ''
          );
        }

      } catch (err) {
        setEmpError(
          'Failed to load records for this employee.'
        );
      } finally {
        setEmpLoading(false);
      }
    },
    []
  );

  const handleEmployeeSearch = () => {
    if (!empViewInput.trim()) return;

    fetchEmployeeRecords(
      empViewInput.trim(),
      1
    );
  };

  

  return (
  <ProtectedRoute>
  <div className={styles.page}>
    <AppNavbar
      showRefresh
      onRefresh={() => fetchAttendance(currentPage)}
    />

    <main className={styles.main}>
      <PageHeader
        title="Attendance"
        subtitle={
          loading
            ? 'Loading...'
            : `${totalRecords} present on ${formatDate(selectedDate)}`
        }
      />
      

        

        {error && (
          <div className={styles.errorBox}>
            <span>⚠️ {error}</span>

            <button
              onClick={() =>
                fetchAttendance(1)
              }
              className={styles.retryBtn}
            >
              Retry
            </button>
          </div>
        )}

        <div className={styles.toggleRow}>
          <button
            className={`${styles.toggleBtn} ${
              activeTab === 'daily'
                ? styles.active
                : ''
            }`}
            onClick={() => {
              setActiveTab('daily');
              fetchAttendance(1);
            }}
          >
            Daily View
          </button>

          <button
            className={`${styles.toggleBtn} ${
              activeTab === 'employee'
                ? styles.active
                : ''
            }`}
            onClick={() => {
              setActiveTab('employee');
              setEmpPage(1);
            }}
          >
            Filter by Employee
          </button>
        </div>

        {/* DAILY VIEW */}
        {activeTab === 'daily' && (
          <>
            <div className={styles.filterRow}>
              <div className={styles.filterGroup}>
                <label
                  className={styles.filterLabel}
                >
                  Date
                </label>

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) =>
                    setSelectedDate(
                      e.target.value
                    )
                  }
                  className={styles.dateInput}
                />
              </div>

              <div className={styles.filterGroup}>
                <label
                  className={styles.filterLabel}
                >
                  Employee ID{' '}
                  <span
                    className={styles.optional}
                  >
                    (optional)
                  </span>
                </label>

                <input
                  type="text"
                  placeholder="e.g. 3"
                  value={empIdFilterInput}
                  onChange={(e) =>
                    setEmpIdFilterInput(
                      e.target.value
                    )
                  }
                  className={styles.searchInput}
                />
              </div>

              <div className={styles.statsRow}>
                <div
                  className={styles.statBox}
                  style={{
                    background: '#ecfdf5',
                    color: '#059669',
                  }}
                >
                  <span
                    className={styles.statNum}
                  >
                    {totalRecords}
                  </span>

                  <span
                    className={styles.statLabel}
                  >
                    Present
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>
                      Employee
                    </th>

                    <th className={styles.th}>
                      Emp ID
                    </th>

                    <th className={styles.th}>
                      ENTRY
                    </th>
                    <th className={styles.th}>
                      EXIT
                    </th>
                  

                    <th className={styles.th}>
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <SkeletonRows
                      cols={5}
                      count={8}
                    />
                  ) : allRecords.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <EmptyState
                          icon="📋"
                          title="No records found"
                          subtitle="Try changing the date or Employee ID filter"
                        />
                      </td>
                    </tr>
                  ) : (
                    allRecords.map((r, i) => (
                      <tr
                        key={i}
                        className={styles.row}
                      >
                        <td
                          className={styles.td}
                        >
                          <div
                            className={
                              styles.nameCell
                            }
                          >
                            <Avatar name={r.name} />

                            <span
                              className={
                                styles.name
                              }
                            >
                              {r.name}
                            </span>
                          </div>
                        </td>

                        

                  
                              

             <td className={styles.td}>
  <span className={styles.empId}>
    {r.empId || '-'}
  </span>
</td>

<td className={styles.td}>
  <span className={styles.dateText}>
    {r.entry_time || '-'}
  </span>
</td>

<td className={styles.td}>
  <span className={styles.dateText}>
    {r.exit_time || '-'}
  </span>
</td>

<td className={styles.td}>
  <span
    className={`${styles.badge} ${
      r.status === 'Absent'
        ? styles.absent
        : r.status === 'OUT'
        ? styles.out
        : styles.present
    }`}
  >
    {r.status || '-'}
  </span>
</td>
                        
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!loading &&
              totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPrev={() =>
                    fetchAttendance(currentPage - 1)
                  }
                    onNext={() =>
                      fetchAttendance(currentPage + 1)
                }
/>
              )}
          </>
        )}

        {/* EMPLOYEE VIEW */}
        {activeTab === 'employee' && (
          <>
            <div className={styles.filterRow}>
              <div className={styles.filterGroup}>
                <label
                  className={styles.filterLabel}
                >
                  Employee ID
                </label>

                <div className={styles.searchRow}>
                  <input
                    type="text"
                    placeholder="Enter Employee ID"
                    value={empViewInput}
                    onChange={(e) =>
                      setEmpViewInput(
                        e.target.value
                      )
                    }
                    onKeyDown={(e) =>
                      e.key === 'Enter' &&
                      handleEmployeeSearch()
                    }
                    className={styles.searchInput}
                  />

                  <button
                    className={styles.searchBtn}
                    onClick={
                      handleEmployeeSearch
                    }
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>

            {empError && (
              <div className={styles.errorBox}>
                <span>⚠️ {empError}</span>

                <button
                  onClick={() =>
                    fetchEmployeeRecords(
                      empViewInput.trim(),
                      1
                    )
                  }
                  className={styles.retryBtn}
                >
                  Retry
                </button>
              </div>
            )}

            {selectedEmployee ===
              'NOT_FOUND' && (
              <div className={styles.notFound}>
                ⚠️ No employee found. Try a
                different ID.
              </div>
            )}

            {selectedEmployee &&
              selectedEmployee !==
                'NOT_FOUND' && (
                <>
                  <div
                    className={
                      styles.employeeTag
                    }
                  >
                    <Avatar
                      name={selectedEmployeeName}
                    />

                    <div>
                      <p
                        className={
                          styles.empTagName
                        }
                      >
                        {selectedEmployeeName}
                      </p>

                      <p
                        className={
                          styles.empTagId
                        }
                      >
                        {selectedEmployee} ·{' '}
                        {empTotalRecords}{' '}
                        records
                      </p>
                    </div>
                  </div>

                  <div
                    className={
                      styles.tableWrapper
                    }
                  >
                    <table
                      className={styles.table}
                    >
                      <thead>
                        <tr>
                          <th
                            className={
                              styles.th
                            }
                          >
                            Date
                          </th>

                          <th
                            className={
                              styles.th
                            }
                          >
                            ENTRY
                          </th>
                          <th
                            className={
                              styles.th
                            }
                          >
                            EXIT
                          </th>

                          <th
                            className={
                              styles.th
                            }
                          >
                            Status
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {empLoading ? (
                          <SkeletonRows
                            cols={4}
                            count={6}
                          />
                        ) : empRecords.length ===
                          0 ? (
                          <tr>
                            <td colSpan={4}>
                              <EmptyState
                                  icon="📋"
                                   title="No records found"
                                    subtitle="This employee has no attendance history"
                                  />
                                
                                  
                            </td>
                          </tr>
                        ) : (
                          empRecords.map(
                            (r, i) => (
                              <tr
                                key={i}
                                className={
                                  styles.row
                                }
                              >
                                <td
                                  className={
                                    styles.td
                                  }
                                >
                                  <span
                                    className={
                                      styles.dateText
                                    }
                                  >
                                    {formatDate(
                                      r.date
                                    )}
                                  </span>
                                </td>

                               <td
  className={
    styles.td
  }
>
  <span
    className={
      styles.dateText
    }
  >
    {r.entry_time || '-'}
  </span>
</td>

<td
  className={
    styles.td
  }
>
  <span
    className={
      styles.dateText
    }
  >
    {r.exit_time || '-'}
  </span>
</td>
<td
  className={
    styles.td
  }
>
  <span
    className={`${styles.badge} ${
      r.status === 'Absent'
        ? styles.absent
        : r.status === 'OUT'
        ? styles.out
        : styles.present
    }`}
  >
    {r.status || '-'}
  </span>
</td>
                                
                                  
                              </tr>
                            )
                          )
                        )}
                      </tbody>
                    </table>
                  </div>

                  {!empLoading &&
                    empTotalPages > 1 && (
                      
                        <Pagination
                          currentPage={empPage}
                          totalPages={empTotalPages}
                            onPrev={() =>
                            fetchEmployeeRecords(
                              selectedEmployee,
                            empPage - 1
                           )
                          }
                          onNext={() =>
                        fetchEmployeeRecords(
                        selectedEmployee,
                          empPage + 1
                  )
  }
/>
                        
                    )}
                </>
              )}

            {!selectedEmployee &&
              !empError && (
                <div className={styles.tableWrapper}>
                  <EmptyState
                  icon="🔍"
                title="Search for an employee"
                subtitle="Enter an Employee ID above and press Search"
                />
    </div>
              )}
          </>
        )}
      </main>
        </div>
  </ProtectedRoute>
  );
}
