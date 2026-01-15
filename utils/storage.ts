// Platform-aware storage utility for Zustand persistence
import { StateStorage } from 'zustand/middleware';

// Simple storage that works on both web and native
export const storage: StateStorage = {
  getItem: (name: string): string | null | Promise<string | null> => {
    // Web: use localStorage
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      return localStorage.getItem(name);
    }
    // Native: use AsyncStorage
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return AsyncStorage.getItem(name);
  },
  setItem: (name: string, value: string): void | Promise<void> => {
    // Web: use localStorage
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem(name, value);
      return;
    }
    // Native: use AsyncStorage
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return AsyncStorage.setItem(name, value);
  },
  removeItem: (name: string): void | Promise<void> => {
    // Web: use localStorage
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem(name);
      return;
    }
    // Native: use AsyncStorage
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return AsyncStorage.removeItem(name);
  },
};
