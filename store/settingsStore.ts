// Settings store using Zustand with persistence

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserSettings } from '../types';
import { storage } from '../utils/storage';

interface SettingsState {
  settings: UserSettings;
  setTheme: (theme: UserSettings['theme']) => void;
  setCurrency: (currency: string) => void;
  setNotificationPreference: (key: keyof UserSettings['notifications'], value: boolean) => void;
  setPrivacyPreference: (key: keyof UserSettings['privacy'], value: boolean) => void;
  setPayPeriodDates: (firstPayday: number, secondPayday: number) => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: UserSettings = {
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

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,

      setTheme: (theme) =>
        set((state) => ({
          settings: { ...state.settings, theme },
        })),

      setCurrency: (currency) =>
        set((state) => ({
          settings: { ...state.settings, currency },
        })),

      setNotificationPreference: (key, value) =>
        set((state) => ({
          settings: {
            ...state.settings,
            notifications: { ...state.settings.notifications, [key]: value },
          },
        })),

      setPrivacyPreference: (key, value) =>
        set((state) => ({
          settings: {
            ...state.settings,
            privacy: { ...state.settings.privacy, [key]: value },
          },
        })),

      setPayPeriodDates: (firstPayday, secondPayday) =>
        set((state) => ({
          settings: {
            ...state.settings,
            payPeriodDates: { firstPayday, secondPayday },
          },
        })),

      resetSettings: () =>
        set({ settings: DEFAULT_SETTINGS }),
    }),
    {
      name: 'securepoint-settings',
      storage: createJSONStorage(() => storage),
    }
  )
);
