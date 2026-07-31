// src/store/slices/cart.slice.ts
import { StateCreator } from 'zustand';
import { CartItem } from '../types';
import api from '@/lib/axios';

export interface CartSlice {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  error: string | null;

  // Helper
  recalculateTotals: (items: CartItem[]) => {
    totalItems: number;
    totalPrice: number;
  };

  // Actions
  fetchCart: () => Promise<void>;
  addItem: (
    product: Omit<CartItem, 'quantity'> & { quantity?: number }
  ) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  syncCartWithBackend: () => Promise<void>; // Merge guest cart after login
}

export const createCartSlice: StateCreator<CartSlice> = (set, get) => ({
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isLoading: false,
  error: null,

  // Helper: Recalculate totals
  recalculateTotals: (items: CartItem[]) => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    return { totalItems, totalPrice };
  },

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/cart');
      if (response.data.success) {
        const items: CartItem[] = response.data.items || [];
        const { totalItems, totalPrice } = get().recalculateTotals(items);
        set({ items, totalItems, totalPrice, isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addItem: async (product) => {
    const { items } = get();
    const existingIndex = items.findIndex(
      (item) => item.productId === product.productId
    );

    let newItems: CartItem[];
    if (existingIndex > -1) {
      // Update existing quantity
      newItems = items.map((item, index) =>
        index === existingIndex
          ? { ...item, quantity: item.quantity + (product.quantity || 1) }
          : item
      );
    } else {
      // Add new item
      const newItem: CartItem = {
        ...product,
        quantity: product.quantity || 1,
      };
      newItems = [...items, newItem];
    }

    const { totalItems, totalPrice } = get().recalculateTotals(newItems);
    set({ items: newItems, totalItems, totalPrice });

    // 🚀 Sync with backend if user is logged in
    // We'll let the persistence middleware handle local storage for guests
  },

  removeItem: async (productId: string) => {
    const newItems = get().items.filter((item) => item.productId !== productId);
    const { totalItems, totalPrice } = get().recalculateTotals(newItems);
    set({ items: newItems, totalItems, totalPrice });
  },

  updateQuantity: async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await get().removeItem(productId);
      return;
    }
    const newItems = get().items.map((item) =>
      item.productId === productId ? { ...item, quantity } : item
    );
    const { totalItems, totalPrice } = get().recalculateTotals(newItems);
    set({ items: newItems, totalItems, totalPrice });
  },

  clearCart: async () => {
    set({ items: [], totalItems: 0, totalPrice: 0 });
  },

  syncCartWithBackend: async () => {
    // If user just logged in, send local cart items to backend
    const { items } = get();
    if (items.length === 0) return;

    try {
      await api.post('/cart/sync', { items });
      // Optionally refetch from backend to ensure consistency
      await get().fetchCart();
    } catch (error) {
      console.error('Failed to sync cart:', error);
    }
  },
});
