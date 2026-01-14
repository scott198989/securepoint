// User and authentication types

export type MilitaryBranch = 'army' | 'navy' | 'air_force' | 'marine_corps' | 'coast_guard' | 'space_force';

export type MilitaryStatus =
  | 'active_duty'
  | 'national_guard'
  | 'reserve'
  | 'veteran'
  | 'retired'
  | 'family_member'
  | 'civilian';

export type PayGrade =
  | 'E-1' | 'E-2' | 'E-3' | 'E-4' | 'E-5' | 'E-6' | 'E-7' | 'E-8' | 'E-9'
  | 'W-1' | 'W-2' | 'W-3' | 'W-4' | 'W-5'
  | 'O-1' | 'O-2' | 'O-3' | 'O-4' | 'O-5' | 'O-6' | 'O-7' | 'O-8' | 'O-9' | 'O-10';

export interface MilitaryProfile {
  status: MilitaryStatus;
  branch?: MilitaryBranch;
  payGrade?: PayGrade;
  yearsOfService?: number;
  dutyStation?: string;
  bahLocation?: string;
  isDeployed?: boolean;
  etsDate?: string; // ISO date string
  retirementDate?: string;
  vaDisabilityRating?: number; // 0-100
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
  createdAt: string;
  updatedAt: string;
  militaryProfile: MilitaryProfile;
  isPremium: boolean;
  premiumExpiresAt?: string;
  settings: UserSettings;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  currency: string;
  notifications: {
    billReminders: boolean;
    budgetAlerts: boolean;
    savingsGoals: boolean;
  };
  privacy: {
    localOnlyMode: boolean;
    biometricLock: boolean;
  };
  payPeriodDates: {
    firstPayday: number; // 1 or 15 typically
    secondPayday: number;
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
