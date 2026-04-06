import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';
import { initSocket, disconnectSocket } from '../services/socket';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authAPI.register(data);
          const { token, user } = res.data;
          localStorage.setItem('token', token);
          initSocket(token);
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (err) {
          set({ error: err.response?.data?.message || 'Registration failed', isLoading: false });
          throw err;
        }
      },

      login: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authAPI.login(data);
          const { token, user } = res.data;
          localStorage.setItem('token', token);
          initSocket(token);
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (err) {
          set({ error: err.response?.data?.message || 'Login failed', isLoading: false });
          throw err;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        disconnectSocket();
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (user) => set({ user }),

      clearError: () => set({ error: null }),

      rehydrateSocket: () => {
        const { token } = get();
        if (token) initSocket(token);
      },
    }),
    {
      name: 'auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useAuthStore;
