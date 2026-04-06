import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/profile', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export const usersAPI = {
  search: (q) => api.get(`/users/search?q=${encodeURIComponent(q)}`),
  getById: (id) => api.get(`/users/${id}`),
  getContacts: () => api.get('/users/contacts'),
};

export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations'),
  startConversation: (recipientId) => api.get(`/messages/conversations/${recipientId}/start`),
  getMessages: (conversationId, page = 1) =>
    api.get(`/messages/${conversationId}?page=${page}`),
  sendMessage: (conversationId, data) =>
    api.post(`/messages/${conversationId}`, data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    }),
  markAsSeen: (conversationId) => api.patch(`/messages/${conversationId}/seen`),
};

export default api;
