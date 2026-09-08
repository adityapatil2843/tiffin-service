import { create } from 'zustand';
import api from '../services/api';

export const useTiffinStore = create((set) => ({
  myRequests:       [],
  serviceRequests:  [], // Owner view — pending requests
  isLoading:        false,
  isSubmitting:     false,
  error:            null,

  fetchMyRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/tiffin/my');
      set({ myRequests: res.data.data.requests, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load requests', isLoading: false });
    }
  },

  fetchServiceRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/owner/requests');
      set({ serviceRequests: res.data.data.requests, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load requests', isLoading: false });
    }
  },

  submitRequest: async (payload) => {
    set({ isSubmitting: true, error: null });
    try {
      const res = await api.post('/tiffin/request', payload);
      set((state) => ({
        myRequests: [res.data.data.tiffinRequest, ...state.myRequests],
        isSubmitting: false,
      }));
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to submit request';
      set({ error: message, isSubmitting: false });
      return { success: false, message };
    }
  },

  reviewRequest: async (requestId, payload) => {
    set({ isSubmitting: true });
    try {
      const res = await api.put(`/owner/requests/${requestId}`, payload);
      set((state) => ({
        serviceRequests: state.serviceRequests.filter((r) => r._id !== requestId),
        isSubmitting: false,
      }));
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to review request';
      set({ isSubmitting: false });
      return { success: false, message };
    }
  },

  reset: () => set({ myRequests: [], serviceRequests: [], isLoading: false, error: null }),
}));
