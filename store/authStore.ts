// Authentication store using Zustand

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, MilitaryProfile, UserSettings } from '../types';
import { generateId } from '../utils';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isOnboarded: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, displayName?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  updateMilitaryProfile: (profile: Partial<MilitaryProfile>) => void;
  completeOnboarding: () => void;
  clearError: () => void;
}

const DEFAULT_USER_SETTINGS: UserSettings = {
  theme: 'system',
  currency: 'USD',
  notifications: {
    billReminders: true,
    budgetAlerts: true,
    savingsGoals: true,
  },
  privacy: {
    localOnlyMode: false,
    biometricLock: false,
  },
  payPeriodDates: {
    firstPayday: 1,
    secondPayday: 15,
  },
};

const DEFAULT_MILITARY_PROFILE: MilitaryProfile = {
  status: 'active_duty',
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isOnboarded: false,

      setUser: (user) =>
        set({ user, isAuthenticated: !!user }),

      setLoading: (isLoading) =>
        set({ isLoading }),

      setError: (error) =>
        set({ error }),

      clearError: () =>
        set({ error: null }),

      login: async (email: string, _password: string) => {
        set({ isLoading: true, error: null });

        try {
          // Simulate API call - in production, this would hit Firebase/Supabase
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // For now, create a mock user (local-first mode)
          const user: User = {
            id: generateId(),
            email,
            displayName: email.split('@')[0],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            militaryProfile: DEFAULT_MILITARY_PROFILE,
            isPremium: false,
            settings: DEFAULT_USER_SETTINGS,
          };

          set({ user, isAuthenticated: true, isLoading: false });
          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Login failed';
          set({ error: message, isLoading: false });
          return false;
        }
      },

      register: async (email: string, _password: string, displayName?: string) => {
        set({ isLoading: true, error: null });

        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const user: User = {
            id: generateId(),
            email,
            displayName: displayName || email.split('@')[0],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            militaryProfile: DEFAULT_MILITARY_PROFILE,
            isPremium: false,
            settings: DEFAULT_USER_SETTINGS,
          };

          set({ user, isAuthenticated: true, isLoading: false, isOnboarded: false });
          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Registration failed';
          set({ error: message, isLoading: false });
          return false;
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      updateProfile: (updates) => {
        const { user } = get();
        if (!user) return;

        set({
          user: {
            ...user,
            ...updates,
            updatedAt: new Date().toISOString(),
          },
        });
      },

      updateMilitaryProfile: (profileUpdates) => {
        const { user } = get();
        if (!user) return;

        set({
          user: {
            ...user,
            militaryProfile: {
              ...user.militaryProfile,
              ...profileUpdates,
            },
            updatedAt: new Date().toISOString(),
          },
        });
      },

      completeOnboarding: () => {
        set({ isOnboarded: true });
      },
    }),
    {
      name: 'securepoint-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isOnboarded: state.isOnboarded,
      }),
    }
  )
);
