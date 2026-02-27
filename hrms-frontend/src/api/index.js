import axios from 'axios';

const API_BASE =
  import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  },
});

// Employees
export const getEmployees = () => api.get('/api/employees');
export const createEmployee = (data) => api.post('/api/employees', data);
export const deleteEmployee = (employeeId) => api.delete(`/api/employees/${employeeId}`);

// Attendance
export const getAttendance = (employeeId) => api.get(`/api/attendance/${employeeId}`);
export const getAllAttendance = (date) => api.get('/api/attendance', {
  params: date ? {
    date
  } : {}
});
export const markAttendance = (data) => api.post('/api/attendance', data);

// Dashboard
export const getDashboard = () => api.get('/api/dashboard');

export default api;