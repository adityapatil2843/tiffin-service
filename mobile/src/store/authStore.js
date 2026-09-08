import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

const TOKEN_KEY = 'tfns_auth_token';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isHydrated: false,

  // Load token from secure store on app start
  hydrate: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const res = await api.get('/auth/me');
        set({ user: res.data.data.user, token, isHydrated: true });
      } else {
        set({ isHydrated: true });
      }
    } catch (error) {
      // Token invalid or expired
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      set({ user: null, token: null, isHydrated: true });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/auth/login', credentials);
      const { user, token } = res.data.data;
      
      // Persist token
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      set({ user, token, isLoading: false });
      return { success: true, role: user.role };
    } catch (error) {
      set({ isLoading: false });
      console.log('--- LOGIN ERROR ---', error.message, error.response?.data);
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, message };
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    delete api.defaults.headers.common['Authorization'];
    set({ user: null, token: null });
  },

  updateUser: (updatedUser) => set({ user: updatedUser }),
}));
