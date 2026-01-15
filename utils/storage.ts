// Platform-aware storage utility for Zustand persistence
import { Platform } from 'react-native';
import { StateStorage } from 'zustand/middleware';

// Web storage implementation using localStorage
const webStorage: StateStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(name);
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(name, value);
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(name);
  },
};

// Native storage implementation using AsyncStorage
const createNativeStorage = (): StateStorage => {
  // Dynamic import to avoid issues on web
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  return {
    getItem: async (name: string): Promise<string | null> => {
      return AsyncStorage.getItem(name);
    },
    setItem: async (name: string, value: string): Promise<void> => {
      await AsyncStorage.setItem(name, value);
    },
    removeItem: async (name: string): Promise<void> => {
      await AsyncStorage.removeItem(name);
    },
  };
};

// Export the appropriate storage based on platform
export const storage: StateStorage = Platform.OS === 'web' ? webStorage : createNativeStorage();
