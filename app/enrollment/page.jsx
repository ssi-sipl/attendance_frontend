'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import AppNavbar from '@/app/components/Navbar.jsx';
import PageHeader from '@/app/components/PageHeader.jsx';
import ProtectedRoute from '@/app/components/ProtectedRoute.jsx';

export default function EnrollmentPage() {
  const router = useRouter();

 

  const [name, setName] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('idle');
  const [submitting, setSubmitting] = useState(false);

 

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Please enter the employee name');
      return;
    }

    setScanning(true);
    setScanStatus('scanning');

    setTimeout(async () => {
      setScanStatus('success');

      try {
        setSubmitting(true);

        const res = await fetch(
          'http://localhost:5000/api/enroll',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: name.trim(),
            }),
          }
        );

        const data = await res.json();

        if (data.status) {
          setTimeout(() => {
            setScanning(false);
            setScanStatus('idle');
            setSubmitting(false);

            alert(
              `Enrolled successfully!\nAssigned Employee ID: ${data.data.user_id}`
            );

            setName('');

            router.push('/dashboard');
          }, 1500);

        } else {
          setScanning(false);
          setScanStatus('idle');
          setSubmitting(false);

          alert(`Error: ${data.message}`);
        }

      } catch (err) {
        setScanning(false);
        setScanStatus('idle');
        setSubmitting(false);

        alert(
          'Failed to connect to server. Make sure the backend is running on port 5000.'
        );
      }
    }, 3000);
  };

  const handleCloseModal = () => {
    if (submitting) return;

    setScanning(false);
    setScanStatus('idle');
  };

  

  return (
    <ProtectedRoute>
    <div className={styles.page}>
      <AppNavbar/>

      <main className={styles.main}>
        
          <PageHeader
              title="Enrollment"
              subtitle="Register a new employee with fingerprint"
          />

        <div className={styles.card}>
          <form
            onSubmit={handleSubmit}
            className={styles.form}
          >
            <div className={styles.field}>
              <label
                className={styles.label}
                htmlFor="name"
              >
                Full Name
              </label>

              <input
                id="name"
                type="text"
                placeholder="e.g. Arjun Singh"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                className={styles.input}
              />
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
            >
              Enroll Employee
            </button>
          </form>
        </div>
      </main>

      {scanning && (
        <div
          className={styles.overlay}
          onClick={handleCloseModal}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <p className={styles.modalTitle}>
              {scanStatus === 'scanning'
                ? 'Place your finger on the scanner'
                : 'Fingerprint captured!'}
            </p>

            <div
              className={`${styles.fingerprintBox} ${
                scanStatus === 'success'
                  ? styles.success
                  : ''
              }`}
            >
              <svg
                className={`${styles.fingerprintSvg} ${
                  scanStatus === 'scanning'
                    ? styles.scanning
                    : ''
                }`}
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M50 15 C30 15 15 30 15 50 C15 70 30 85 50 85 C70 85 85 70 85 50"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                <path
                  d="M50 25 C35 25 25 37 25 50 C25 63 35 75 50 75 C65 75 75 63 75 50"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                <path
                  d="M50 35 C40 35 33 42 33 50 C33 58 40 65 50 65 C60 65 67 58 67 50"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                <path
                  d="M50 45 C45 45 42 47 42 50 C42 53 45 56 50 56 C55 56 58 53 58 50"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                <circle
                  cx="50"
                  cy="50"
                  r="3"
                  fill="currentColor"
                />

                <path
                  d="M50 15 C55 15 60 16 64 18"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                <path
                  d="M50 25 C58 25 65 29 69 35"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                <path
                  d="M50 35 C56 35 62 38 65 44"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>

              {scanStatus === 'scanning' && (
                <div className={styles.scanLine} />
              )}

              {scanStatus === 'success' && (
                <div className={styles.checkmark}>
                  ✓
                </div>
              )}
            </div>

            <p className={styles.modalSub}>
              {scanStatus === 'scanning'
                ? 'Scanning...'
                : 'Enrolling, please wait...'}
            </p>

            <button
              className={styles.cancelBtn}
              onClick={handleCloseModal}
              disabled={submitting}
              style={{
                opacity: submitting ? 0.5 : 1,
                cursor: submitting
                  ? 'not-allowed'
                  : 'pointer',
              }}
            >
              {scanStatus === 'success'
                ? 'Please wait...'
                : 'Cancel'}
            </button>
          </div>
        </div>
      )}
    </div>
    </ProtectedRoute>
  );
}