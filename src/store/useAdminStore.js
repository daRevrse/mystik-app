import { create } from 'zustand';
import { api } from '../services/api';

export const useAdminStore = create((set, get) => ({
  orders: [],
  products: [],
  newOrdersCount: 0,
  isLoading: false,
  error: null,

  incrementNewOrders: () => set((state) => ({ newOrdersCount: state.newOrdersCount + 1 })),
  resetNewOrdersCount: () => set({ newOrdersCount: 0 }),

  fetchOrders: async () => {
    set({ isLoading: true });
    try {
      const orders = await api.getOrders();
      set({ orders, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchProducts: async () => {
    try {
      const products = await api.getProducts();
      set({ products });
    } catch (error) {
      set({ error: error.message });
    }
  },

  updateStatus: async (orderId, status) => {
    try {
      await api.updateOrderStatus(orderId, status);
      const orders = get().orders.map((o) =>
        o.id === orderId ? { ...o, status } : o
      );
      set({ orders });
    } catch (error) {
      set({ error: error.message });
    }
  },

  updateProduct: async (product) => {
    try {
      await api.updateProduct(product);
      // Optionnel: rafraîchir la liste locale si besoin
    } catch (error) {
      set({ error: error.message });
    }
  },

  addOrder: async (orderData) => {
    set({ isLoading: true });
    try {
      const newOrder = await api.createOrder(orderData);
      set((state) => ({ 
        orders: [...state.orders, newOrder],
        isLoading: false 
      }));
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  togglePaymentStatus: async (orderId) => {
    try {
      const orders = get().orders;
      const index = orders.findIndex(o => o.id === orderId);
      if (index !== -1) {
        const newStatus = orders[index].paymentStatus === 'Payé' ? 'Non payé' : 'Payé';
        // Simulation API pour le statut de paiement
        const updatedOrders = orders.map(o => 
          o.id === orderId ? { ...o, paymentStatus: newStatus } : o
        );
        // Persistance via updateOrderStatus (ou une nouvelle méthode API si besoin, ici on simule)
        set({ orders: updatedOrders });
        localStorage.setItem('mystik_orders_v1', JSON.stringify(updatedOrders));
      }
    } catch (error) {
      set({ error: error.message });
    }
  }
}));
