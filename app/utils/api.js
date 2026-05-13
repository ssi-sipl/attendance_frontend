import axios from 'axios';

const API_BASE = 'http://localhost:5000';

const isSuccess = (status) => status === true || status === 'success';

export const apiCall = async (method, endpoint, body = {}) => {
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
    };

    if (method !== 'get' && method !== 'delete') {
      config.data = body;
    }

    const res = await axios(config);
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


export const deleteUser = (userId) =>
  apiCall('delete', `/api/users/${userId}`);
