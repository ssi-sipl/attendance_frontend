'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function EnrollmentPage() {
  const router = useRouter();
  const [empId, setEmpId] = useState('');
  const [name, setName] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('idle'); // idle | scanning | success

  const handleScan = () => {
    setScanning(true);
    setScanStatus('scanning');
    setTimeout(() => {
      setScanStatus('success');
      setTimeout(() => {
        setScanning(false);
        setScanStatus('idle');
      }, 2000);
    }, 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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
          <h1 className={styles.heading}>Enrollment</h1>
          <p className={styles.subheading}>Register a new employee with fingerprint</p>
        </div>

        <div className={styles.card}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="empId">Employee ID</label>
              <input
                id="empId"
                type="text"
                placeholder="e.g. EMP007"
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                placeholder="e.g. Arjun Singh"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Fingerprint</label>
              <button
                type="button"
                className={styles.scanBtn}
                onClick={handleScan}
              >
                <span className={styles.scanBtnIcon}>👆</span>
                Scan Fingerprint
              </button>
            </div>

            <button type="submit" className={styles.submitBtn}>
              Enroll Employee
            </button>
          </form>
        </div>
      </main>

      {/* Fingerprint Modal */}
      {scanning && (
        <div className={styles.overlay} onClick={() => { setScanning(false); setScanStatus('idle'); }}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <p className={styles.modalTitle}>
              {scanStatus === 'scanning' ? 'Place your finger on the scanner' : 'Fingerprint captured!'}
            </p>

            <div className={`${styles.fingerprintBox} ${scanStatus === 'success' ? styles.success : ''}`}>
              <svg className={`${styles.fingerprintSvg} ${scanStatus === 'scanning' ? styles.scanning : ''}`} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 15 C30 15 15 30 15 50 C15 70 30 85 50 85 C70 85 85 70 85 50" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                <path d="M50 25 C35 25 25 37 25 50 C25 63 35 75 50 75 C65 75 75 63 75 50" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                <path d="M50 35 C40 35 33 42 33 50 C33 58 40 65 50 65 C60 65 67 58 67 50" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                <path d="M50 45 C45 45 42 47 42 50 C42 53 45 56 50 56 C55 56 58 53 58 50" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                <circle cx="50" cy="50" r="3" fill="currentColor"/>
                <path d="M50 15 C55 15 60 16 64 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                <path d="M50 25 C58 25 65 29 69 35" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                <path d="M50 35 C56 35 62 38 65 44" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>

              {scanStatus === 'scanning' && (
                <div className={styles.scanLine} />
              )}

              {scanStatus === 'success' && (
                <div className={styles.checkmark}>✓</div>
              )}
            </div>

            <p className={styles.modalSub}>
              {scanStatus === 'scanning' ? 'Scanning...' : 'Scan complete'}
            </p>

            <button
              className={styles.cancelBtn}
              onClick={() => { setScanning(false); setScanStatus('idle'); }}
            >
              {scanStatus === 'success' ? 'Done' : 'Cancel'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
