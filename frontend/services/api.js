import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANT: Use your computer's network IP (shown in backend console)
const API_BASE_URL = 'http://172.111.3.31:5000/api';
// For localhost testing in browser: 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (refreshToken) {
          const { data } = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            {},
            {
              headers: { Authorization: `Bearer ${refreshToken}` }
            }
          );
          
          await AsyncStorage.setItem('access_token', data.access_token);
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password, behavioralData = {}) =>
    api.post('/auth/login', { email, password, behavioral_data: behavioralData }),
  
  register: (email, password, name) =>
    api.post('/auth/register', { email, password, name }),
  
  verifyChallenge: (challengeType) =>
    api.post('/auth/verify-challenge', { challenge_type: challengeType }),
  
  getCurrentUser: () => api.get('/auth/me'),
};

export const postsAPI = {
  getPosts: () => api.get('/posts'),
  
  createPost: (content, behavioralData = {}) =>
    api.post('/posts', { content, behavioral_data: behavioralData }),
  
  likePost: (postId) => api.post(`/posts/${postId}/like`),
};

export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations'),
  
  getMessages: (receiverId) => api.get(`/messages/${receiverId}`),
  
  sendMessage: (receiverId, text) =>
    api.post('/messages', { receiver_id: receiverId, text }),
};

export const securityAPI = {
  getDashboard: () => api.get('/security/dashboard'),
  
  captureBehavioralData: (data) =>
    api.post('/security/behavioral-data', data),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  
  getAllEvents: (page = 1, perPage = 50, riskLevel = null) =>
    api.get('/admin/events', { 
      params: { page, per_page: perPage, risk_level: riskLevel } 
    }),
  
  getAllUsers: () => api.get('/admin/users'),
  
  lockUser: (userId) => api.post(`/admin/users/${userId}/lock`),
  
  unlockUser: (userId) => api.post(`/admin/users/${userId}/unlock`),
  
  makeAdmin: (userId) => api.post(`/admin/users/${userId}/make-admin`),
};

export default api;
