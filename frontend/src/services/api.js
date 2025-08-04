import axios from 'axios';

// Determine the API base URL based on the current location
const getApiBaseUrl = () => {
  // If we have an environment variable, use it
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  // For production with reverse proxy, use relative path
  if (process.env.NODE_ENV === 'production') {
    return '/api';
  }
  // Default to localhost for local development
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (currentPassword, newPassword) => 
    api.put('/auth/change-password', { currentPassword, newPassword }),
  logout: () => api.post('/auth/logout'),
};

// Employee API calls
export const employeeAPI = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
  getByDepartment: (department) => api.get(`/employees/department/${department}`),
};

// Performance API calls
export const performanceAPI = {
  getAll: (params) => api.get('/performance', { params }),
  getById: (id) => api.get(`/performance/${id}`),
  create: (data) => api.post('/performance', data),
  update: (id, data) => api.put(`/performance/${id}`, data),
  delete: (id) => api.delete(`/performance/${id}`),
  getByEmployee: (employeeId) => api.get(`/performance/employee/${employeeId}`),
  getByEvaluator: (evaluatorId) => api.get(`/performance/evaluator/${evaluatorId}`),
  updateStatus: (id, status) => api.patch(`/performance/${id}/status`, { status }),
};

// Goals API calls
export const goalsAPI = {
  getAll: (params) => api.get('/goals', { params }),
  getById: (id) => api.get(`/goals/${id}`),
  create: (data) => api.post('/goals', data),
  update: (id, data) => api.put(`/goals/${id}`, data),
  delete: (id) => api.delete(`/goals/${id}`),
  updateProgress: (id, progress) => api.patch(`/goals/${id}/progress`, { progress }),
  getByType: (targetType) => api.get(`/goals/type/${targetType}`),
  getByEmployee: (employeeId, params) => api.get(`/goals/employee/${employeeId}`, { params }),
};

// Competencies API calls
export const competenciesAPI = {
  getAll: (params) => api.get('/competencies', { params }),
  getById: (id) => api.get(`/competencies/${id}`),
  create: (data) => api.post('/competencies', data),
  update: (id, data) => api.put(`/competencies/${id}`, data),
  delete: (id) => api.delete(`/competencies/${id}`),
  getByEmployee: (employeeId, params) => api.get(`/competencies/employee/${employeeId}`, { params }),
  getStats: (params) => api.get('/competencies/stats/overview', { params }),
};

export default api; 