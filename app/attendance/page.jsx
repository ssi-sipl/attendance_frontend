'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { getAttendance } from '@/lib/api';
import useSocket from '@/lib/useSocket';

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
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });
}

function SkeletonRows({ cols = 3, count = 8 }) {
  const widths = ['40%', '70%', '55%', '40%'];
  return Array(count).fill(0).map((_, i) => (
    <tr key={i} className={styles.row}>
      {Array(cols).fill(0).map((_, j) => (
        <td key={j} className={styles.td}>
          <div className={styles.skeleton} style={{ width: widths[j] || '60%' }} />
        </td>
      ))}
    </tr>
  ));
}

export default function AttendancePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(today);
  const [empIdFilterInput, setEmpIdFilterInput] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedEmployeeName, setSelectedEmployeeName] = useState('');
  const [empViewInput, setEmpViewInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [allRecords, setAllRecords] = useState([]);
  const [empRecords, setEmpRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [empLoading, setEmpLoading] = useState(false);
  const [error, setError] = useState(null);
  const [empError, setEmpError] = useState(null);

  const debouncedEmpId = useDebounce(empIdFilterInput, 400);

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAttendance(debouncedEmpId, selectedDate);
      console.log("Response:", res.data);
        if (!res.data.status) {
          setError(res.data.message);
          return(message);
          }
const mapped = res.data.data.records.map(r => ({
        empId: r.user_id,
        name: r.name,
        date: r.date,
        time: r.time,
        status: 'Present',
      }));
      setAllRecords(mapped);
    } catch (err) {
      console.error('Attendance error:', err);
      setError('Failed to load attendance. Make sure the backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, debouncedEmpId]);

  useEffect(() => {
    fetchAttendance();
    setCurrentPage(1);
  }, [fetchAttendance]);

  useSocket(fetchAttendance);

  const fetchEmployeeRecords = useCallback(async (userId) => {
    try {
      setEmpLoading(true);
      setEmpError(null);
      const res = await getAttendance(userId, '');
      if (!res.data.status) {
  setEmpError(res.data.message);
  return;
}

      if (!res.data.data.records.length) {
        setSelectedEmployee('NOT_FOUND');
        setSelectedEmployeeName('');
        setEmpRecords([]);
        return;
      }
      const mapped = res.data.data.records.map(r => ({
        empId: r.user_id,
        name: r.name,
        date: r.date,
        time: r.time,
        status: 'Present',
      })).sort((a, b) => new Date(b.date) - new Date(a.date));
      setEmpRecords(mapped);
      setSelectedEmployee(userId);
      setSelectedEmployeeName(mapped[0].name);
      setCurrentPage(1);
    } catch (err) {
      console.error('Employee fetch error:', err);
      setEmpError('Failed to load records for this employee.');
    } finally {
      setEmpLoading(false);
    }
  }, []);

  const users = [...new Map(allRecords.map(r => [r.empId, { id: r.empId, name: r.name }])).values()];
  const dailyRecords = allRecords.filter(r => r.date === selectedDate);
  const totalDailyPages = Math.ceil(dailyRecords.length / ITEMS_PER_PAGE);
  const paginatedDailyRecords = dailyRecords.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalEmpPages = Math.ceil(empRecords.length / ITEMS_PER_PAGE);
  const paginatedEmpRecords = empRecords.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const presentCount = dailyRecords.length;
  const totalUsers = users.length;
  const absentCount = Math.max(0, totalUsers - presentCount);

  const handleEmployeeSearch = () => {
    if (!empViewInput.trim()) return;
    fetchEmployeeRecords(empViewInput.trim());
  };

  return (
    <div className={styles.page}>
      <header className={styles.navbar}>
        <div className={styles.navLeft}>
          <button className={styles.backBtn} onClick={() => router.push('/dashboard')}>← Back</button>
          <div className={styles.divider} />
          <span className={styles.navLogo}>📋</span>
          <span className={styles.navTitle}>NCattendance</span>
        </div>
        <div className={styles.navRight}>
          <button className={styles.refreshBtn} onClick={fetchAttendance} title="Refresh">🔄</button>
          <button className={styles.logoutBtn} onClick={() => router.push('/')}>Sign Out</button>
        </div>
      </header>

      <main className={styles.main}>
        <div>
          <h1 className={styles.heading}>Attendance</h1>
          <p className={styles.subheading}>
            {loading ? 'Loading records...' : `${allRecords.length} total records`}
          </p>
        </div>

        {error && (
          <div className={styles.errorBox}>
            <span>⚠️ {error}</span>
            <button onClick={fetchAttendance} className={styles.retryBtn}>Retry</button>
          </div>
        )}

        <div className={styles.toggleRow}>
          <button
            className={`${styles.toggleBtn} ${activeTab === 'daily' ? styles.active : ''}`}
            onClick={() => { setActiveTab('daily'); setCurrentPage(1); }}
          >Daily View</button>
          <button
            className={`${styles.toggleBtn} ${activeTab === 'employee' ? styles.active : ''}`}
            onClick={() => { setActiveTab('employee'); setCurrentPage(1); }}
          >Filter by Employee</button>
        </div>

        {/* ── DAILY VIEW ── */}
        {activeTab === 'daily' && (
          <>
            <div className={styles.filterRow}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => { setSelectedDate(e.target.value); setCurrentPage(1); }}
                  className={styles.dateInput}
                />
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Employee ID <span className={styles.optional}>(optional)</span></label>
                <input
                  type="text"
                  placeholder="e.g. EMP001"
                  value={empIdFilterInput}
                  onChange={e => setEmpIdFilterInput(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              <div className={styles.statsRow}>
                <div className={styles.statBox} style={{ background: '#ecfdf5', color: '#059669' }}>
                  <span className={styles.statNum}>{presentCount}</span>
                  <span className={styles.statLabel}>Present</span>
                </div>
                <div className={styles.statBox} style={{ background: '#fef2f2', color: '#dc2626' }}>
                  <span className={styles.statNum}>{absentCount}</span>
                  <span className={styles.statLabel}>Absent</span>
                </div>
              </div>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Employee</th>
                    <th className={styles.th}>Emp ID</th>
                    <th className={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <SkeletonRows cols={3} count={8} />
                  ) : paginatedDailyRecords.length === 0 ? (
                    <tr>
                      <td colSpan={3}>
                        <div className={styles.emptyState}>
                          <span className={styles.emptyIcon}>📋</span>
                          <p className={styles.emptyText}>No records found</p>
                          <p className={styles.emptySubtext}>Try changing the date or Employee ID filter</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedDailyRecords.map((r, i) => (
                      <tr key={i} className={styles.row}>
                        <td className={styles.td}>
                          <div className={styles.nameCell}>
                            <div className={styles.avatar}>{getInitials(r.name)}</div>
                            <span className={styles.name}>{r.name}</span>
                          </div>
                        </td>
                        <td className={styles.td}><span className={styles.empId}>{r.empId}</span></td>
                        <td className={styles.td}><span className={`${styles.badge} ${styles.present}`}>Present</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!loading && totalDailyPages > 1 && (
              <div className={styles.pagination}>
                <button className={styles.pageBtn} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>← Prev</button>
                <span className={styles.pageInfo}>Page {currentPage} of {totalDailyPages}</span>
                <button className={styles.pageBtn} onClick={() => setCurrentPage(p => Math.min(totalDailyPages, p + 1))} disabled={currentPage === totalDailyPages}>Next →</button>
              </div>
            )}
          </>
        )}

        {/* ── EMPLOYEE VIEW ── */}
        {activeTab === 'employee' && (
          <>
            <div className={styles.filterRow}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Employee ID</label>
                <div className={styles.searchRow}>
                  <input
                    type="text"
                    placeholder="Enter Employee ID"
                    value={empViewInput}
                    onChange={e => setEmpViewInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleEmployeeSearch()}
                    className={styles.searchInput}
                  />
                  <button className={styles.searchBtn} onClick={handleEmployeeSearch}>Search</button>
                </div>
              </div>
            </div>

            {empError && (
              <div className={styles.errorBox}>
                <span>⚠️ {empError}</span>
                <button onClick={() => fetchEmployeeRecords(empViewInput.trim())} className={styles.retryBtn}>Retry</button>
              </div>
            )}

            {selectedEmployee === 'NOT_FOUND' && (
              <div className={styles.notFound}>⚠️ No employee found. Try a different ID.</div>
            )}

            {selectedEmployee && selectedEmployee !== 'NOT_FOUND' && (
              <>
                <div className={styles.employeeTag}>
                  <div className={styles.avatar}>{getInitials(selectedEmployeeName)}</div>
                  <div>
                    <p className={styles.empTagName}>{selectedEmployeeName}</p>
                    <p className={styles.empTagId}>{selectedEmployee} · {empRecords.length} records</p>
                  </div>
                </div>

                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th className={styles.th}>Date</th>
                        <th className={styles.th}>Time</th>
                        <th className={styles.th}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {empLoading ? (
                        <SkeletonRows cols={3} count={6} />
                      ) : paginatedEmpRecords.length === 0 ? (
                        <tr>
                          <td colSpan={3}>
                            <div className={styles.emptyState}>
                              <span className={styles.emptyIcon}>📋</span>
                              <p className={styles.emptyText}>No records found</p>
                              <p className={styles.emptySubtext}>This employee has no attendance history</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedEmpRecords.map((r, i) => (
                          <tr key={i} className={styles.row}>
                            <td className={styles.td}><span className={styles.dateText}>{formatDate(r.date)}</span></td>
                            <td className={styles.td}><span className={styles.dateText}>{r.time}</span></td>
                            <td className={styles.td}><span className={`${styles.badge} ${styles.present}`}>Present</span></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {!empLoading && totalEmpPages > 1 && (
                  <div className={styles.pagination}>
                    <button className={styles.pageBtn} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>← Prev</button>
                    <span className={styles.pageInfo}>Page {currentPage} of {totalEmpPages}</span>
                    <button className={styles.pageBtn} onClick={() => setCurrentPage(p => Math.min(totalEmpPages, p + 1))} disabled={currentPage === totalEmpPages}>Next →</button>
                  </div>
                )}
              </>
            )}

            {!selectedEmployee && !empError && (
              <div className={styles.tableWrapper}>
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>🔍</span>
                  <p className={styles.emptyText}>Search for an employee</p>
                  <p className={styles.emptySubtext}>Enter an Employee ID above and press Search</p>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
