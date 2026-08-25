import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor: Attach JWT Token from localStorage to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: Centralized response error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // If token expired or unauthorized, clear storage and trigger reload/redirect
    if (error.response && error.response.status === 401) {
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';

    return Promise.reject(new Error(message));
  }
);

// Auth Service
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me')
};

// Subjects Service
export const subjectAPI = {
  getAll: () => api.get('/subjects'),
  getById: (id) => api.get(`/subjects/${id}`),
  create: (data) => api.post('/subjects', data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`)
};

// Exams Service
export const examAPI = {
  getAll: (params) => api.get('/exams', { params }),
  getById: (id) => api.get(`/exams/${id}`),
  create: (data) => api.post('/exams', data),
  update: (id, data) => api.put(`/exams/${id}`, data),
  delete: (id) => api.delete(`/exams/${id}`),
  publish: (id) => api.post(`/exams/${id}/publish`)
};

// Questions Service
export const questionAPI = {
  getByExam: (examId) => api.get(`/questions/exam/${examId}`),
  create: (data) => api.post('/questions', data),
  update: (id, data) => api.put(`/questions/${id}`, data),
  delete: (id) => api.delete(`/questions/${id}`)
};

// Exam Attempt & Engine Service
export const attemptAPI = {
  start: (examId) => api.post('/attempts/start', { examId }),
  saveAnswer: (attemptId, answerData) =>
    api.put(`/attempts/${attemptId}/answer`, answerData),
  submit: (attemptId) => api.post(`/attempts/${attemptId}/submit`),
  autoSubmit: (attemptId) => api.post(`/attempts/${attemptId}/auto-submit`),
  getById: (id) => api.get(`/attempts/${id}`),
  getMyResults: () => api.get('/attempts/my-results'),
  getByExam: (examId) => api.get(`/attempts/exam/${examId}`)
};

// Dashboard Stats Service
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats')
};

export default api;
