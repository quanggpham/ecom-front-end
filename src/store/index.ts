'use client';

import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import type { Cart, Product } from '@/types';
import { cartApi, authApi, getToken } from '@/lib/api';
import { jwtDecode } from 'jwt-decode';

// Minimal JWT payload (backend only sends sub/iat/exp - NO role claim)
interface JwtPayload {
  sub: string; // email
}

function getEmailFromToken(token: string): string {
  try {
    const payload = jwtDecode<JwtPayload>(token);
    return payload.sub || '';
  } catch {
    return '';
  }
}


// Safe storage for sandboxed environments
const safeStorage: StateStorage = {
  getItem: (name: string): string | null => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      localStorage.setItem(name, value);
    } catch {
      // localStorage not available in sandboxed environment
    }
  },
  removeItem: (name: string): void => {
    try {
      localStorage.removeItem(name);
    } catch {
      // localStorage not available in sandboxed environment
    }
  },
};

// ==================== CART STORE ====================
interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  
  fetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  setCart: (cart: Cart | null) => void;
}

export const useCartStore = create<CartState>()((set, get) => ({
  cart: null,
  isLoading: false,
  error: null,

  fetchCart: async () => {
    if (!authApi.isAuthenticated()) {
      set({ cart: null });
      return;
    }
    
    set({ isLoading: true, error: null });
    try {
      const response = await cartApi.get();
      set({ cart: response.data || null, isLoading: false });
    } catch {
      set({ cart: null, isLoading: false });
    }
  },

  addToCart: async (productId: number, quantity: number = 1) => {
    set({ isLoading: true, error: null });
    try {
      await cartApi.addItem(productId, quantity);
      await get().fetchCart();
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  updateQuantity: async (productId: number, quantity: number) => {
    set({ isLoading: true, error: null });
    try {
      await cartApi.updateQuantity(productId, quantity);
      await get().fetchCart();
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  removeItem: async (productId: number) => {
    set({ isLoading: true, error: null });
    try {
      await cartApi.removeItem(productId);
      await get().fetchCart();
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      await cartApi.clear();
      set({ cart: null, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  setCart: (cart: Cart | null) => set({ cart }),
}));

// ==================== AUTH STORE ====================
interface AuthUser {
  email: string;
  role: 'ADMIN' | 'USER';
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.login({ email, password });
          const token = getToken();
          const emailFromToken = token ? getEmailFromToken(token) : email;
          // Probe backend to determine actual role
          const role = await authApi.checkIsAdmin();
          set({ isAuthenticated: true, user: { email: emailFromToken, role }, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.register({ name, email, password });
          const token = getToken();
          const emailFromToken = token ? getEmailFromToken(token) : email;
          // New users are always USER, no need to probe
          set({ isAuthenticated: true, user: { email: emailFromToken, role: 'USER' }, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      logout: () => {
        authApi.logout();
        set({ isAuthenticated: false, user: null });
        useCartStore.getState().setCart(null);
      },

      checkAuth: async () => {
        const token = getToken();
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }
        const emailFromToken = getEmailFromToken(token);
        // Re-probe role to keep it fresh (e.g. after page refresh)
        const role = await authApi.checkIsAdmin();
        set({ isAuthenticated: true, user: { email: emailFromToken, role } });
      },
    }),
    {
      name: 'vietfood-auth',
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({ isAuthenticated: state.isAuthenticated, user: state.user }),
    }
  )
);

// ==================== UI STORE ====================
interface UIState {
  isCartOpen: boolean;
  isAuthModalOpen: boolean;
  isProductDetailOpen: boolean;
  isCheckoutOpen: boolean;
  selectedProduct: Product | null;
  authMode: 'login' | 'register';
  
  openCart: () => void;
  closeCart: () => void;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  openProductDetail: (product: Product) => void;
  closeProductDetail: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  setAuthMode: (mode: 'login' | 'register') => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isCartOpen: false,
  isAuthModalOpen: false,
  isProductDetailOpen: false,
  isCheckoutOpen: false,
  selectedProduct: null,
  authMode: 'login',

  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  openAuthModal: (mode = 'login') => set({ isAuthModalOpen: true, authMode: mode }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  openProductDetail: (product: Product) => set({ isProductDetailOpen: true, selectedProduct: product }),
  closeProductDetail: () => set({ isProductDetailOpen: false, selectedProduct: null }),
  openCheckout: () => set({ isCheckoutOpen: true, isCartOpen: false }),
  closeCheckout: () => set({ isCheckoutOpen: false }),
  setAuthMode: (mode) => set({ authMode: mode }),
}));

// Export types
export type { CartState, AuthState, UIState };
