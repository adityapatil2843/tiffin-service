import { create } from 'zustand';
import api from '../services/api';

export const useMenuStore = create((set, get) => ({
  todaysMenu:   [],
  weeklyMenu:   [],
  menuItems:    [], // for Owner: list of all menu items
  isLoading:    false,
  error:        null,

  fetchTodaysMenu: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/menu/today');
      set({ todaysMenu: res.data.data.menus, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load menu', isLoading: false });
    }
  },

  fetchWeeklyMenu: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/menu/week');
      set({ weeklyMenu: res.data.data.menus, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load menu', isLoading: false });
    }
  },

  fetchMenuItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/menu/items');
      set({ menuItems: res.data.data.items, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load items', isLoading: false });
    }
  },

  reset: () => set({ todaysMenu: [], weeklyMenu: [], menuItems: [], isLoading: false, error: null }),
}));
