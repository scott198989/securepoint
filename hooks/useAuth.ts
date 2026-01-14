// Authentication hook for managing user state

import { useAuthStore } from '../store';
import { User, MilitaryProfile } from '../types';

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isOnboarded: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, displayName?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  updateMilitaryProfile: (profile: Partial<MilitaryProfile>) => void;
  completeOnboarding: () => void;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    isOnboarded,
    login,
    register,
    logout,
    updateProfile,
    updateMilitaryProfile,
    completeOnboarding,
    clearError,
  } = useAuthStore();

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    isOnboarded,
    login,
    register,
    logout,
    updateProfile,
    updateMilitaryProfile,
    completeOnboarding,
    clearError,
  };
}

// Convenience hook for military profile
export function useMilitaryProfile() {
  const { user, updateMilitaryProfile } = useAuth();
  return {
    profile: user?.militaryProfile || null,
    updateProfile: updateMilitaryProfile,
  };
}

// Convenience hook for checking premium status
export function useIsPremium(): boolean {
  const { user } = useAuth();
  if (!user) return false;
  if (!user.isPremium) return false;
  if (user.premiumExpiresAt) {
    return new Date(user.premiumExpiresAt) > new Date();
  }
  return true;
}
