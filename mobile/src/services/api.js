import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// ── CONFIG ─────────────────────────────────────────────────────────────────────
import { Platform } from 'react-native';

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  // Use your local IP address for physical device testing
  return 'http://172.27.151.48:5001/api';
};
const BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor ────────────────────────────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    // Ensure token is always fresh from secure store
    const token = await SecureStore.getItemAsync('tfns_auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ───────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 — clear auth and redirect to login
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      await SecureStore.deleteItemAsync('tfns_auth_token');
      // Import would cause circular dependency; we use a different mechanism
      // In the app, the authStore.hydrate() handles this on next boot
    }

    return Promise.reject(error);
  }
);

export default api;
