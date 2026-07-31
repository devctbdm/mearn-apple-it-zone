import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createAuthSlice, AuthSlice } from './slices/auth.slice';
import { createCartSlice, CartSlice } from './slices/cart.slice';
import { createUISlice, UISlice } from './slices/ui.slice';
import { createCheckoutSlice, CheckoutSlice } from './slices/checkout.slice';

export type RootStore = AuthSlice & CartSlice & UISlice & CheckoutSlice;

// Create the root store
export const useAppStore = create<RootStore>()(
  persist(
    (...args) => ({
      ...createAuthSlice(...args),
      ...createCartSlice(...args),
      ...createUISlice(...args),
      ...createCheckoutSlice(...args),
    }),
    {
      name: 'appleitzone-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      // ⚠️ Only persist the cart and UI settings (not auth, because we use HTTP-Only cookies)
      partialize: (state) => ({
        cart: {
          items: state.items,
          totalItems: state.totalItems,
          totalPrice: state.totalPrice,
        },
        ui: {
          isAdminSidebarOpen: state.isAdminSidebarOpen,
        },
        checkout: {
          shippingAddress: state.shippingAddress,
          paymentMethod: state.paymentMethod,
          step: state.step,
        },
      }),
      merge: (persistedState: any, currentState: RootStore) => {
        return {
          ...currentState,
          ...(persistedState?.cart || {}),
          ...(persistedState?.ui || {}),
          ...(persistedState?.checkout || {}),
        };
      },
    }
  )
);

// 🔥 Export individual hooks for better performance (selectors)
export const useAuth = () =>
  useAppStore((state) => ({
    user: state.user,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    login: state.login,
    register: state.register,
    logout: state.logout,
    fetchUser: state.fetchUser,
  }));

export const useCart = () =>
  useAppStore((state) => ({
    items: state.items,
    totalItems: state.totalItems,
    totalPrice: state.totalPrice,
    isLoading: state.isLoading,
    addItem: state.addItem,
    removeItem: state.removeItem,
    updateQuantity: state.updateQuantity,
    clearCart: state.clearCart,
    fetchCart: state.fetchCart,
    syncCartWithBackend: state.syncCartWithBackend,
  }));

export const useUI = () =>
  useAppStore((state) => ({
    isAdminSidebarOpen: state.isAdminSidebarOpen,
    isCartDrawerOpen: state.isCartDrawerOpen,
    isCheckoutLoading: state.isCheckoutLoading,
    globalLoading: state.globalLoading,
    toast: state.toast,
    toggleAdminSidebar: state.toggleAdminSidebar,
    toggleCartDrawer: state.toggleCartDrawer,
    setCheckoutLoading: state.setCheckoutLoading,
    setGlobalLoading: state.setGlobalLoading,
    showToast: state.showToast,
    hideToast: state.hideToast,
  }));

export const useCheckout = () =>
  useAppStore((state) => ({
    shippingAddress: state.shippingAddress,
    paymentMethod: state.paymentMethod,
    notes: state.notes,
    step: state.step,
    setShippingAddress: state.setShippingAddress,
    setPaymentMethod: state.setPaymentMethod,
    setNotes: state.setNotes,
    goToStep: state.goToStep,
    resetCheckout: state.resetCheckout,
  }));
