import { create } from 'zustand';
import api from '../services/api';

export const useBillStore = create((set) => ({
  myBills:        [],
  serviceBills:   [], // Owner view
  isLoading:      false,
  isGenerating:   false,
  error:          null,

  fetchMyBills: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/bill/my');
      set({ myBills: res.data.data.bills, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load bills', isLoading: false });
    }
  },

  fetchServiceBills: async (month, year) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/bill/service', { params: { month, year } });
      set({ serviceBills: res.data.data.bills, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load bills', isLoading: false });
    }
  },

  generateBill: async (payload) => {
    set({ isGenerating: true, error: null });
    try {
      const res = await api.post('/bill/generate', payload);
      set({ isGenerating: false });
      return { success: true, bill: res.data.data.bill };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to generate bill';
      set({ error: message, isGenerating: false });
      return { success: false, message };
    }
  },

  recordPayment: async (billId, payload) => {
    set({ isLoading: true });
    try {
      const res = await api.post(`/bill/${billId}/payment`, payload);
      const updatedBill = res.data.data.bill;
      // Update in serviceBills list
      set((state) => ({
        serviceBills: state.serviceBills.map((b) => b._id === billId ? updatedBill : b),
        isLoading: false,
      }));
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to record payment';
      set({ isLoading: false });
      return { success: false, message };
    }
  },

  reset: () => set({ myBills: [], serviceBills: [], isLoading: false, error: null }),
}));
