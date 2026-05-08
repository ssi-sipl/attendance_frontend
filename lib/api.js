import axios from 'axios';

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
});

export const getAttendance = (user_id="", date="") => {
  console.log("Date:", date, "User ID:", user_id);
  return API.get('/api/attendance', { params: { user_id, date } });
};
export const getUsers = () => API.get('/api/users');
export const addUser = (name) => API.post('/api/users', { name });
export const scanFingerprint = () => API.get('/api/scan');

export default API;
