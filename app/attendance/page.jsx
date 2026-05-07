'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const users = [
  { id: 'EMP001', name: 'Rajesh Kumar' },
  { id: 'EMP002', name: 'Priya Sharma' },
  { id: 'EMP003', name: 'Amit Verma' },
  { id: 'EMP004', name: 'Sunita Patel' },
  { id: 'EMP005', name: 'Rohan Mehta' },
  { id: 'EMP006', name: 'Kavya Nair' },
];

const today = new Date().toISOString().split('T')[0];
const ITEMS_PER_PAGE = 20;

function generateRecords() {
  const records = [];
  const statuses = ['Present', 'Present', 'Present', 'Absent', 'Present'];
  for (let d = 0; d < 30; d++) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().split('T')[0];
    users.forEach((user, i) => {
      records.push({ empId: user.id, name: user.name, date: dateStr, status: statuses[(i + d) % statuses.length] });
    });
  }
  return records;
}

const allRecords = generateRecords();

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });
}

export default function AttendancePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(today);
  const [empIdFilter, setEmpIdFilter] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [empViewInput, setEmpViewInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const dailyRecords = allRecords.filter(r => {
    const dateMatch = r.date === selectedDate;
    const empMatch = empIdFilter.trim() === '' || r.empId.toLowerCase().includes(empIdFilter.toLowerCase());
    return dateMatch && empMatch;
  });
  const totalDailyPages = Math.ceil(dailyRecords.length / ITEMS_PER_PAGE);
  const paginatedDailyRecords = dailyRecords.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const employeeRecords = selectedEmployee && selectedEmployee !== 'NOT_FOUND'
    ? allRecords.filter(r => r.empId === selectedEmployee).sort((a, b) => new Date(b.date) - new Date(a.date))
    : [];
  const totalEmpPages = Math.ceil(employeeRecords.length / ITEMS_PER_PAGE);
  const paginatedEmpRecords = employeeRecords.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const presentCount = dailyRecords.filter(r => r.status === 'Present').length;
  const absentCount = dailyRecords.filter(r => r.status === 'Absent').length;
  const empPresentCount = employeeRecords.filter(r => r.status === 'Present').length;
  const empAbsentCount = employeeRecords.filter(r => r.status === 'Absent').length;

  const totalPages = activeTab === 'daily' ? totalDailyPages : totalEmpPages;

  const handleEmployeeSearch = () => {
    const found = users.find(u =>
      u.id.toLowerCase() === empViewInput.toLowerCase() ||
      u.name.toLowerCase().includes(empViewInput.toLowerCase())
    );
    setSelectedEmployee(found ? found.id : 'NOT_FOUND');
    setCurrentPage(1);
  };

  return (
    <div className={styles.page}>
      <header className={styles.navbar}>
        <div className={styles.navLeft}>
          <button className={styles.backBtn} onClick={() => router.push('/dashboard')}>← Back</button>
          <div className={styles.divider} />
          <span className={styles.navLogo}>📋</span>
          <span className={styles.navTitle}>AttendEase</span>
        </div>
        <button className={styles.logoutBtn} onClick={() => router.push('/login')}>Sign Out</button>
      </header>

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h1 className={styles.heading}>Attendance</h1>
          <p className={styles.subheading}>View and filter attendance records</p>
        </div>

        <div className={styles.toggleRow}>
          <button className={`${styles.toggleBtn} ${activeTab === 'daily' ? styles.active : ''}`}
            onClick={() => { setActiveTab('daily'); setCurrentPage(1); }}>
            Daily View
          </button>
          <button className={`${styles.toggleBtn} ${activeTab === 'employee' ? styles.active : ''}`}
            onClick={() => { setActiveTab('employee'); setCurrentPage(1); }}>
            Filter by Employee
          </button>
        </div>

        {/* ── DAILY VIEW ── */}
        {activeTab === 'daily' && (
          <>
            <div className={styles.filterRow}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Date</label>
                <input type="date" value={selectedDate} max={today}
                  onChange={(e) => { setSelectedDate(e.target.value); setCurrentPage(1); }}
                  className={styles.dateInput} />
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Employee ID <span className={styles.optional}>(optional)</span></label>
                <input type="text" placeholder="e.g. EMP001" value={empIdFilter}
                  onChange={(e) => { setEmpIdFilter(e.target.value); setCurrentPage(1); }}
                  className={styles.dateInput} />
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
                    <th className={styles.th}>Employee ID</th>
                    <th className={styles.th}>Name</th>
                    <th className={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDailyRecords.length > 0 ? paginatedDailyRecords.map((record) => (
                    <tr key={record.empId} className={styles.row}>
                      <td className={styles.td}><span className={styles.empId}>{record.empId}</span></td>
                      <td className={styles.td}>
                        <div className={styles.nameCell}>
                          <div className={styles.avatar}>{getInitials(record.name)}</div>
                          <span className={styles.name}>{record.name}</span>
                        </div>
                      </td>
                      <td className={styles.td}>
                        <span className={`${styles.badge} ${record.status === 'Present' ? styles.present : styles.absent}`}>
                          {record.status === 'Present' ? '✓ Present' : '✗ Absent'}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={3} className={styles.emptyRow}>No records found</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button className={styles.pageBtn} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>← Previous</button>
                <span className={styles.pageInfo}>Page {currentPage} of {totalPages}</span>
                <button className={styles.pageBtn} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next →</button>
              </div>
            )}
          </>
        )}

        {/* ── EMPLOYEE VIEW ── */}
        {activeTab === 'employee' && (
          <>
            <div className={styles.filterRow}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Search by Name or Employee ID</label>
                <div className={styles.searchRow}>
                  <input type="text" placeholder="e.g. Rajesh or EMP001" value={empViewInput}
                    onChange={(e) => setEmpViewInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleEmployeeSearch()}
                    className={styles.searchInput} />
                  <button className={styles.searchBtn} onClick={handleEmployeeSearch}>Search</button>
                </div>
              </div>
              {selectedEmployee && selectedEmployee !== 'NOT_FOUND' && (
                <div className={styles.statsRow}>
                  <div className={styles.statBox} style={{ background: '#ecfdf5', color: '#059669' }}>
                    <span className={styles.statNum}>{empPresentCount}</span>
                    <span className={styles.statLabel}>Present</span>
                  </div>
                  <div className={styles.statBox} style={{ background: '#fef2f2', color: '#dc2626' }}>
                    <span className={styles.statNum}>{empAbsentCount}</span>
                    <span className={styles.statLabel}>Absent</span>
                  </div>
                </div>
              )}
            </div>

            {selectedEmployee === 'NOT_FOUND' && (
              <div className={styles.notFound}>
                <span>⚠️</span>
                <span>No employee found. Try a different name or ID.</span>
              </div>
            )}

            {selectedEmployee && selectedEmployee !== 'NOT_FOUND' && (
              <>
                <div className={styles.employeeTag}>
                  <div className={styles.avatar}>{getInitials(users.find(u => u.id === selectedEmployee)?.name || '')}</div>
                  <div>
                    <p className={styles.empTagName}>{users.find(u => u.id === selectedEmployee)?.name}</p>
                    <p className={styles.empTagId}>{selectedEmployee} · All-time records ({employeeRecords.length} days)</p>
                  </div>
                </div>

                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th className={styles.th}>Date</th>
                        <th className={styles.th}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedEmpRecords.map((record) => (
                        <tr key={record.date} className={styles.row}>
                          <td className={styles.td}><span className={styles.dateText}>{formatDate(record.date)}</span></td>
                          <td className={styles.td}>
                            <span className={`${styles.badge} ${record.status === 'Present' ? styles.present : styles.absent}`}>
                              {record.status === 'Present' ? '✓ Present' : '✗ Absent'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className={styles.pagination}>
                    <button className={styles.pageBtn} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>← Previous</button>
                    <span className={styles.pageInfo}>Page {currentPage} of {totalPages}</span>
                    <button className={styles.pageBtn} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next →</button>
                  </div>
                )}
              </>
            )}

            {!selectedEmployee && (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>🔍</span>
                <p className={styles.emptyText}>Search for an employee above</p>
                <p className={styles.emptySubtext}>Enter a name or employee ID to view their all-time records</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
