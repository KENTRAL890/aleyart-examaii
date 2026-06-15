// src/api/client.js — Axios API client for ALEYART EXAMAI PRO
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000, // 60s for AI generation
  headers: { 'Content-Type': 'application/json' },
});

// ─── REQUEST INTERCEPTOR — attach JWT ────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── RESPONSE INTERCEPTOR — handle 401 / token refresh ───────────────────────
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        const res = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefresh } = res.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefresh);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  login:          (data) => api.post('/auth/login', data),
  logout:         (data) => api.post('/auth/logout', data),
  me:             ()     => api.get('/auth/me'),
  register:       (data) => api.post('/auth/register', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  stats: () => api.get('/dashboard/stats'),
};

// ─── EXAMINATIONS ─────────────────────────────────────────────────────────────
export const examAPI = {
  list:       (params) => api.get('/examinations', { params }),
  get:        (uuid)   => api.get(`/examinations/${uuid}`),
  generate:   (data)   => api.post('/examinations/generate', data),
  update:     (uuid, data) => api.put(`/examinations/${uuid}`, data),
  approve:    (uuid)   => api.put(`/examinations/${uuid}/approve`),
  delete:     (uuid)   => api.delete(`/examinations/${uuid}`),
  duplicate:  (uuid)   => api.post(`/examinations/${uuid}/duplicate`),
};

// ─── QUESTIONS ────────────────────────────────────────────────────────────────
export const questionAPI = {
  list:   (params) => api.get('/questions', { params }),
  create: (data)   => api.post('/questions', data),
  update: (id, data) => api.put(`/questions/${id}`, data),
  delete: (id)     => api.delete(`/questions/${id}`),
};

// ─── STUDENTS ─────────────────────────────────────────────────────────────────
export const studentAPI = {
  list:   (params) => api.get('/students', { params }),
  create: (data)   => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id)     => api.delete(`/students/${id}`),
  report: (id)     => api.get(`/students/${id}/report`),
};

// ─── TEACHERS ─────────────────────────────────────────────────────────────────
export const teacherAPI = {
  list:           () => api.get('/teachers'),
  assignClasses:  (data) => api.post('/teachers/assign-classes', data),
  assignSubjects: (data) => api.post('/teachers/assign-subjects', data),
};

// ─── RESULTS ─────────────────────────────────────────────────────────────────
export const resultAPI = {
  list: (params) => api.get('/results', { params }),
  save: (data)   => api.post('/results', data),
};

// ─── SCHOOL CONFIG ────────────────────────────────────────────────────────────
export const schoolAPI = {
  getConfig:    ()     => api.get('/school/config'),
  updateConfig: (data) => api.put('/school/config', data),
};

// ─── REFERENCE DATA ───────────────────────────────────────────────────────────
export const refAPI = {
  classes:  () => api.get('/classes'),
  subjects: () => api.get('/subjects'),
};

// ─── EXPORTS ─────────────────────────────────────────────────────────────────
export const exportAPI = {
  examDocx:        (uuid)   => `${API_BASE}/export/exam/${uuid}/docx`,
  markingSchemeDocx:(uuid)  => `${API_BASE}/export/exam/${uuid}/marking-scheme/docx`,
  resultsXlsx:     (examId) => `${API_BASE}/export/results/${examId}/xlsx`,
  questionBankXlsx:()       => `${API_BASE}/export/question-bank/xlsx`,
};

export default api;
