import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000',
});

export const getAttendance = () => API.get('/api/attendance');
export const getUsers = () => API.get('/api/users');
export const addUser = (name) => API.post('/api/users', { name });
export const scanFingerprint = () => API.get('/api/scan');

export default API;
