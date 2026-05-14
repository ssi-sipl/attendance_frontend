'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtectedRoute({
  children,
}) {
  const router = useRouter();

  const [authorized, setAuthorized] =
    useState(false);

  useEffect(() => {
    const isLoggedIn =
      localStorage.getItem('isLoggedIn');

    if (!isLoggedIn) {
      router.push('/');
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) {
    return null;
  }

  return children;
}