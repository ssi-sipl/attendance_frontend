import axios from 'axios';

const API_BASE = 'http://localhost:5000';

const isSuccess = (status) => status === true || status === 'success';

export const apiCall = async (method, endpoint, body = {}) => {
  try {
    const res = await axios[method](`${API_BASE}${endpoint}`, body);
    const { status, message, data } = res.data;

    if (isSuccess(status)) {
      return { success: true, message, data };
    } else {
      return { success: false, message: message || 'Something went wrong.',  {} };
    }

  } catch (err) {
    const message =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      'Failed to connect to server.';
    return { success: false, message,  {} };
  }
};
