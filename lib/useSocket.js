'use client';
import { useEffect } from 'react';
import { io } from 'socket.io-client';

let socket;

export default function useSocket(onAttendanceUpdate) {
  useEffect(() => {
    socket = io('http://localhost:5000');

    socket.on('new_attendance', () => {
      if (onAttendanceUpdate) onAttendanceUpdate();
    });

    return () => {
      socket.disconnect();
    };
  }, []);
}
