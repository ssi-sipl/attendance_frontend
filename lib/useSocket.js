'use client';
import { useEffect } from 'react';
import { io } from 'socket.io-client';

let socket;

export default function useSocket(onAttendanceUpdate) {
  useEffect(() => {
    socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');

    socket.on('new_attendance', () => {
      if (onAttendanceUpdate) onAttendanceUpdate();
    });

    return () => {
      socket.disconnect();
    };
  }, [onAttendanceUpdate]);
}
