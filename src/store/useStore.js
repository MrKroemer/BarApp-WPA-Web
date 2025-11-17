import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export const useAuthStore = create(
  subscribeWithSelector((set, get) => ({
    user: null,
    userProfile: null,
    loading: true,
    setUser: (user) => set({ user }),
    setUserProfile: (profile) => set({ userProfile: profile }),
    setLoading: (loading) => set({ loading }),
    logout: () => set({ user: null, userProfile: null })
  }))
);

export const useDataStore = create(
  subscribeWithSelector((set, get) => ({
    products: [],
    orders: [],
    stock: [],
    customers: [],
    cashbacks: [],
    categories: [],
    metrics: {
      todaySales: 0,
      activeOrders: 0,
      totalCustomers: 0,
      stockStatus: 'OK'
    },
    setProducts: (products) => set({ products }),
    setOrders: (orders) => set({ orders }),
    setStock: (stock) => set({ stock }),
    setCustomers: (customers) => set({ customers }),
    setCashbacks: (cashbacks) => set({ cashbacks }),
    setCategories: (categories) => set({ categories }),
    setMetrics: (metrics) => set((state) => ({ metrics: { ...state.metrics, ...metrics } })),
    addProduct: (product) => set((state) => ({ 
      products: [...state.products, product] 
    })),
    updateProduct: (id, updates) => set((state) => ({
      products: state.products.map(p => p.id === id ? { ...p, ...updates } : p)
    })),
    addOrder: (order) => set((state) => ({ 
      orders: [order, ...state.orders] 
    })),
    updateOrder: (id, updates) => set((state) => ({
      orders: state.orders.map(o => o.id === id ? { ...o, ...updates } : o)
    })),
    updateStock: (productId, updates) => set((state) => ({
      stock: state.stock.map(s => s.productId === productId ? { ...s, ...updates } : s)
    }))
  }))
);

export const useUIStore = create((set) => ({
  currentPage: 'dashboard',
  sidebarOpen: true,
  modals: {
    addProduct: false,
    editProduct: false,
    stockMovement: false,
    orderDetails: false
  },
  setCurrentPage: (page) => set({ currentPage: page }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  openModal: (modal) => set((state) => ({
    modals: { ...state.modals, [modal]: true }
  })),
  closeModal: (modal) => set((state) => ({
    modals: { ...state.modals, [modal]: false }
  })),
  closeAllModals: () => set((state) => ({
    modals: Object.keys(state.modals).reduce((acc, key) => ({ ...acc, [key]: false }), {})
  }))
}));