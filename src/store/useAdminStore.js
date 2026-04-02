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

  updateProduct: async (updatedProduct) => {
    try {
      await api.updateProduct(updatedProduct);
      set((state) => ({
        products: state.products.map((p) => p.id === updatedProduct.id ? updatedProduct : p)
      }));
    } catch (error) {
      set({ error: error.message });
    }
  },

  addProduct: async (productData) => {
    try {
      const newProduct = await api.createProduct(productData);
      set((state) => ({ 
        products: [newProduct, ...state.products] 
      }));
      return newProduct;
    } catch (error) {
      set({ error: error.message });
    }
  },

  replenishStock: async (productId, quantityToAdd) => {
    try {
      const products = get().products;
      const product = products.find(p => p.id === productId);
      if (product) {
        const updatedProduct = { ...product, stock: (product.stock || 0) + quantityToAdd };
        await api.updateProduct(updatedProduct);
        set({
          products: products.map(p => p.id === productId ? updatedProduct : p)
        });
      }
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
      const order = orders.find(o => o.id === orderId);
      if (order) {
        const newStatus = order.paymentStatus === 'Payé' ? 'Non payé' : 'Payé';
        await api.updateOrderPaymentStatus(orderId, newStatus);
        
        const updatedOrders = orders.map(o => 
          o.id === orderId ? { ...o, paymentStatus: newStatus } : o
        );
        set({ orders: updatedOrders });
      }
    } catch (error) {
      set({ error: error.message });
    }
  }
}));
