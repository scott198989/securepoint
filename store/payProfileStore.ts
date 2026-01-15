// Pay Profile store using Zustand

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  EnhancedPayProfile,
  SpecialPayQualification,
  SpecialPayType,
  DutyStatus,
  MilitaryComponent,
  HousingType,
  TaxFilingStatus,
  ProfileCompleteness,
  DEFAULT_PAY_PROFILE,
  PAY_SETUP_WIZARD_STEPS,
} from '../types';
import { generateId } from '../utils';
import { storage } from '../utils/storage';

interface PayProfileState {
  payProfile: EnhancedPayProfile | null;
  isLoading: boolean;
  error: string | null;
  currentWizardStep: number;

  // Actions
  initializeProfile: () => void;
  setPayProfile: (profile: EnhancedPayProfile) => void;
  updatePayProfile: (updates: Partial<EnhancedPayProfile>) => void;
  resetPayProfile: () => void;

  // Special Pay Management
  addSpecialPay: (qualification: Omit<SpecialPayQualification, 'payType'> & { payType: SpecialPayType }) => void;
  updateSpecialPay: (payType: SpecialPayType, updates: Partial<SpecialPayQualification>) => void;
  removeSpecialPay: (payType: SpecialPayType) => void;
  toggleSpecialPay: (payType: SpecialPayType, isActive: boolean) => void;

  // Wizard Navigation
  setWizardStep: (step: number) => void;
  nextWizardStep: () => void;
  prevWizardStep: () => void;

  // Validation
  validateProfileCompleteness: () => ProfileCompleteness;
  isStepComplete: (stepId: string) => boolean;

  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const usePayProfileStore = create<PayProfileState>()(
  persist(
    (set, get) => ({
      payProfile: null,
      isLoading: false,
      error: null,
      currentWizardStep: 0,

      initializeProfile: () => {
        const existing = get().payProfile;
        if (existing) return;

        const newProfile: EnhancedPayProfile = {
          id: generateId(),
          payGrade: 'E-1',
          yearsOfService: 0,
          branch: 'army',
          dutyStatus: 'active_duty',
          component: 'active',
          dutyStationZip: '',
          housingType: 'off_base_bah',
          hasDependents: false,
          dependentCount: 0,
          maritalStatus: 'single',
          filingStatus: 'single',
          stateOfResidence: '',
          tspTraditionalPercent: 5,
          tspRothPercent: 0,
          sgliCoverage: 500000,
          tricareDental: false,
          specialPayQualifications: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isComplete: false,
        };

        set({ payProfile: newProfile });
      },

      setPayProfile: (profile) =>
        set({
          payProfile: {
            ...profile,
            updatedAt: new Date().toISOString(),
          },
        }),

      updatePayProfile: (updates) => {
        const { payProfile } = get();
        if (!payProfile) {
          get().initializeProfile();
          return get().updatePayProfile(updates);
        }

        set({
          payProfile: {
            ...payProfile,
            ...updates,
            updatedAt: new Date().toISOString(),
          },
        });
      },

      resetPayProfile: () => {
        set({
          payProfile: null,
          currentWizardStep: 0,
        });
      },

      // Special Pay Management
      addSpecialPay: (qualification) => {
        const { payProfile } = get();
        if (!payProfile) return;

        const existingIndex = payProfile.specialPayQualifications.findIndex(
          (q) => q.payType === qualification.payType
        );

        if (existingIndex >= 0) {
          // Update existing
          const updated = [...payProfile.specialPayQualifications];
          updated[existingIndex] = { ...updated[existingIndex], ...qualification };
          set({
            payProfile: {
              ...payProfile,
              specialPayQualifications: updated,
              updatedAt: new Date().toISOString(),
            },
          });
        } else {
          // Add new
          set({
            payProfile: {
              ...payProfile,
              specialPayQualifications: [
                ...payProfile.specialPayQualifications,
                qualification,
              ],
              updatedAt: new Date().toISOString(),
            },
          });
        }
      },

      updateSpecialPay: (payType, updates) => {
        const { payProfile } = get();
        if (!payProfile) return;

        const updated = payProfile.specialPayQualifications.map((q) =>
          q.payType === payType ? { ...q, ...updates } : q
        );

        set({
          payProfile: {
            ...payProfile,
            specialPayQualifications: updated,
            updatedAt: new Date().toISOString(),
          },
        });
      },

      removeSpecialPay: (payType) => {
        const { payProfile } = get();
        if (!payProfile) return;

        set({
          payProfile: {
            ...payProfile,
            specialPayQualifications: payProfile.specialPayQualifications.filter(
              (q) => q.payType !== payType
            ),
            updatedAt: new Date().toISOString(),
          },
        });
      },

      toggleSpecialPay: (payType, isActive) => {
        get().updateSpecialPay(payType, { isActive });
      },

      // Wizard Navigation
      setWizardStep: (step) => {
        const maxStep = PAY_SETUP_WIZARD_STEPS.length - 1;
        set({ currentWizardStep: Math.max(0, Math.min(step, maxStep)) });
      },

      nextWizardStep: () => {
        const { currentWizardStep } = get();
        const maxStep = PAY_SETUP_WIZARD_STEPS.length - 1;
        if (currentWizardStep < maxStep) {
          set({ currentWizardStep: currentWizardStep + 1 });
        }
      },

      prevWizardStep: () => {
        const { currentWizardStep } = get();
        if (currentWizardStep > 0) {
          set({ currentWizardStep: currentWizardStep - 1 });
        }
      },

      // Validation
      validateProfileCompleteness: () => {
        const { payProfile } = get();

        if (!payProfile) {
          return {
            isComplete: false,
            completedSteps: [],
            missingSteps: PAY_SETUP_WIZARD_STEPS.filter((s) => !s.isOptional).map((s) => s.id),
            percentComplete: 0,
          };
        }

        const completedSteps: string[] = [];
        const missingSteps: string[] = [];

        // Check each required step
        for (const step of PAY_SETUP_WIZARD_STEPS) {
          if (step.isOptional) {
            completedSteps.push(step.id);
            continue;
          }

          const isComplete = get().isStepComplete(step.id);
          if (isComplete) {
            completedSteps.push(step.id);
          } else {
            missingSteps.push(step.id);
          }
        }

        const requiredSteps = PAY_SETUP_WIZARD_STEPS.filter((s) => !s.isOptional);
        const completedRequired = completedSteps.filter((s) =>
          requiredSteps.some((r) => r.id === s)
        );
        const percentComplete = Math.round(
          (completedRequired.length / requiredSteps.length) * 100
        );

        const isComplete = missingSteps.length === 0;

        // Update profile if completeness changed
        if (payProfile.isComplete !== isComplete) {
          set({
            payProfile: {
              ...payProfile,
              isComplete,
              updatedAt: new Date().toISOString(),
            },
          });
        }

        return {
          isComplete,
          completedSteps,
          missingSteps,
          percentComplete,
        };
      },

      isStepComplete: (stepId) => {
        const { payProfile } = get();
        if (!payProfile) return false;

        switch (stepId) {
          case 'service':
            return !!(
              payProfile.branch &&
              payProfile.payGrade &&
              payProfile.yearsOfService >= 0
            );
          case 'status':
            return !!(payProfile.dutyStatus && payProfile.component);
          case 'location':
            return !!(payProfile.dutyStationZip && payProfile.housingType);
          case 'family':
            return payProfile.maritalStatus !== undefined;
          case 'tax':
            return !!(payProfile.filingStatus && payProfile.stateOfResidence);
          case 'deductions':
            return true; // Optional step
          case 'special_pays':
            return true; // Optional step
          default:
            return false;
        }
      },

      // Utility
      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'securepoint-pay-profile',
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        payProfile: state.payProfile,
        currentWizardStep: state.currentWizardStep,
      }),
    }
  )
);

// Selectors
export const selectPayProfile = (state: PayProfileState) => state.payProfile;
export const selectIsProfileComplete = (state: PayProfileState) =>
  state.payProfile?.isComplete ?? false;
export const selectSpecialPays = (state: PayProfileState) =>
  state.payProfile?.specialPayQualifications ?? [];
export const selectActiveSpecialPays = (state: PayProfileState) =>
  state.payProfile?.specialPayQualifications.filter((q) => q.isActive) ?? [];
