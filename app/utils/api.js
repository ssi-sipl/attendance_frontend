import axios from 'axios';

const API_BASE = 'http://localhost:5000';

const isSuccess = (status) => status === true || status === 'success';

export const apiCall = async (method, endpoint, body = {}) => {
  try {
    const res = await axios[method](`${API_BASE}${endpoint}`, body);
    const { status, message, data } = res.data;
    if (isSuccess(status)) return { success: true, message, data };
    return { success: false, message: message || 'Something went wrong.' };
  } catch (err) {
    return {
      success: false,
      message:
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to connect to server.',
    };
  }
};

export const getUsers = (page = 1, limit = 20, search = '') =>
  apiCall('get', `/api/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);

export const getAttendance = (userId = '', date = '', page = 1, limit = 20) =>
  apiCall('get', `/api/attendance?user_id=${userId}&date=${date}&page=${page}&limit=${limit}`);
