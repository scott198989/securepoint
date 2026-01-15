/**
 * Transition Store
 * State management for military separation, retirement, and transition planning
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  TransitionInfo,
  SeparationType,
  SeparationStatus,
  RetirementSystem,
  VADisabilityBenefits,
  VADisabilityClaim,
  VAClaimStatus,
  TSPSummary,
  TSPFundAllocation,
  RetirementInput,
  RetirementResult,
  IncomeComparison,
  TransitionChecklistItem,
  TransitionSummary,
  TerminalLeaveCalc,
  SeparationPayCalc,
} from '../types/transition';
import { PayGrade } from '../types/user';
import {
  calculateCombinedVARating,
  getVACompensation,
  calculateRetirementPay,
  calculateSeparationPay,
  calculateLeaveSellback,
  calculateCRDP,
  calculateCRSC,
  TRANSITION_CHECKLIST,
  RETIREMENT_MULTIPLIERS,
} from '../constants/transitionData';

// ============================================================================
// STATE INTERFACE
// ============================================================================

interface TransitionState {
  // Core transition info
  transitionInfo: TransitionInfo | null;

  // VA benefits
  vaDisability: VADisabilityBenefits | null;

  // TSP
  tspSummary: TSPSummary | null;

  // Calculated results
  retirementResult: RetirementResult | null;
  incomeComparison: IncomeComparison | null;

  // Checklist
  checklistItems: TransitionChecklistItem[];

  // UI state
  isLoading: boolean;
  error: string | null;
}

interface TransitionActions {
  // Transition info management
  initializeTransition: (separationType: SeparationType, etsDate: string) => void;
  setTransitionInfo: (info: Partial<TransitionInfo>) => void;
  updateSeparationType: (type: SeparationType) => void;
  updateRetirementSystem: (system: RetirementSystem) => void;
  updateDates: (dates: Partial<Pick<TransitionInfo, 'etsDate' | 'terminalLeaveStartDate' | 'lastDayOfWork' | 'officialSeparationDate'>>) => void;
  updateLeaveBalance: (balance: number, sellOption: 'take' | 'sell' | 'mixed', sellDays?: number) => void;
  updateServiceYears: (active: number, reserve?: number) => void;

  // VA disability
  initializeVADisability: () => void;
  addVAClaim: (claim: Omit<VADisabilityClaim, 'id'>) => string;
  updateVAClaim: (id: string, updates: Partial<VADisabilityClaim>) => void;
  removeVAClaim: (id: string) => void;
  setVADependents: (hasSpouse: boolean, dependentCount: number) => void;
  calculateCombinedRating: () => number;
  calculateVACompensation: () => number;
  updateConcurrentReceipt: (option: 'crdp' | 'crsc') => void;

  // TSP
  setTSPSummary: (summary: Partial<TSPSummary>) => void;
  updateFundsAllocation: (allocation: TSPFundAllocation[]) => void;
  updateContributionRates: (traditional: number, roth: number) => void;

  // Calculations
  calculateRetirement: (input: RetirementInput) => RetirementResult;
  calculateIncomeComparison: (civilianSalary: number, basePay: number, allowances: number) => IncomeComparison;
  calculateTerminalLeave: (basePay: number) => TerminalLeaveCalc | null;
  calculateSeparationPayEstimate: (basePay: number, payGrade: PayGrade) => SeparationPayCalc | null;

  // Checklist
  loadDefaultChecklist: (etsDate: string) => void;
  toggleChecklistItem: (itemId: string) => void;
  addChecklistItem: (item: Omit<TransitionChecklistItem, 'id' | 'completed'>) => void;
  updateChecklistItem: (itemId: string, updates: Partial<TransitionChecklistItem>) => void;
  removeChecklistItem: (itemId: string) => void;

  // Queries
  getDaysUntilETS: () => number;
  getDaysUntilTerminalLeave: () => number;
  getTransitionProgress: () => number;
  getChecklistProgress: () => { completed: number; total: number; percent: number };
  getTransitionSummary: () => TransitionSummary | null;
  getUpcomingMilestones: () => { name: string; daysUntil: number; date: string }[];

  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: TransitionState = {
  transitionInfo: null,
  vaDisability: null,
  tspSummary: null,
  retirementResult: null,
  incomeComparison: null,
  checklistItems: [],
  isLoading: false,
  error: null,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const calculateDaysBetween = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const addDays = (date: string, days: number): string => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().split('T')[0];
};

// ============================================================================
// STORE
// ============================================================================

export const useTransitionStore = create<TransitionState & TransitionActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ========================================
      // TRANSITION INFO MANAGEMENT
      // ========================================

      initializeTransition: (separationType, etsDate) => {
        const now = new Date().toISOString();
        const info: TransitionInfo = {
          id: generateId(),
          separationType,
          status: 'planning',
          etsDate,
          leaveBalance: 0,
          sellLeaveOption: 'take',
          totalYearsOfService: 0,
          totalMonthsOfService: 0,
          activeYears: 0,
          hasSeparationPay: false,
          vaClaimsFiled: false,
          createdAt: now,
          updatedAt: now,
        };

        set({ transitionInfo: info });

        // Also load default checklist
        get().loadDefaultChecklist(etsDate);
      },

      setTransitionInfo: (info) => {
        set((state) => ({
          transitionInfo: state.transitionInfo
            ? {
                ...state.transitionInfo,
                ...info,
                updatedAt: new Date().toISOString(),
              }
            : null,
        }));
      },

      updateSeparationType: (type) => {
        get().setTransitionInfo({ separationType: type });
      },

      updateRetirementSystem: (system) => {
        get().setTransitionInfo({ retirementSystem: system });
      },

      updateDates: (dates) => {
        get().setTransitionInfo(dates);
      },

      updateLeaveBalance: (balance, sellOption, sellDays) => {
        get().setTransitionInfo({
          leaveBalance: balance,
          sellLeaveOption: sellOption,
          sellLeaveDays: sellDays,
        });
      },

      updateServiceYears: (active, reserve) => {
        const totalYears = active + (reserve || 0);
        const totalMonths = totalYears * 12;
        get().setTransitionInfo({
          activeYears: active,
          reserveYears: reserve,
          totalYearsOfService: totalYears,
          totalMonthsOfService: totalMonths,
        });
      },

      // ========================================
      // VA DISABILITY
      // ========================================

      initializeVADisability: () => {
        const vaDisability: VADisabilityBenefits = {
          combinedRating: 0,
          individualRatings: [],
          monthlyCompensation: 0,
          hasDependent: false,
          dependentCount: 0,
          hasSpouse: false,
          spouseAidAndAttendance: false,
          smcEligible: false,
          chapter35Eligible: false,
          champvaEligible: false,
          propertyTaxExemption: false,
          crdpEligible: false,
          crscEligible: false,
        };
        set({ vaDisability });
      },

      addVAClaim: (claim) => {
        const id = generateId();
        const newClaim: VADisabilityClaim = {
          ...claim,
          id,
        };

        set((state) => {
          if (!state.vaDisability) {
            get().initializeVADisability();
          }
          return {
            vaDisability: state.vaDisability
              ? {
                  ...state.vaDisability,
                  individualRatings: [...state.vaDisability.individualRatings, newClaim],
                }
              : null,
          };
        });

        // Recalculate combined rating
        get().calculateCombinedRating();

        return id;
      },

      updateVAClaim: (id, updates) => {
        set((state) => ({
          vaDisability: state.vaDisability
            ? {
                ...state.vaDisability,
                individualRatings: state.vaDisability.individualRatings.map((claim) =>
                  claim.id === id ? { ...claim, ...updates } : claim
                ),
              }
            : null,
        }));

        // Recalculate combined rating
        get().calculateCombinedRating();
      },

      removeVAClaim: (id) => {
        set((state) => ({
          vaDisability: state.vaDisability
            ? {
                ...state.vaDisability,
                individualRatings: state.vaDisability.individualRatings.filter(
                  (claim) => claim.id !== id
                ),
              }
            : null,
        }));

        // Recalculate combined rating
        get().calculateCombinedRating();
      },

      setVADependents: (hasSpouse, dependentCount) => {
        set((state) => ({
          vaDisability: state.vaDisability
            ? {
                ...state.vaDisability,
                hasSpouse,
                dependentCount,
                hasDependent: hasSpouse || dependentCount > 0,
              }
            : null,
        }));

        // Recalculate compensation with new dependent info
        get().calculateVACompensation();
      },

      calculateCombinedRating: () => {
        const { vaDisability } = get();
        if (!vaDisability) return 0;

        const ratings = vaDisability.individualRatings
          .filter((claim) => claim.awardedRating !== undefined)
          .map((claim) => claim.awardedRating!);

        if (ratings.length === 0) return 0;

        const combinedRating = calculateCombinedVARating(ratings);

        set((state) => ({
          vaDisability: state.vaDisability
            ? {
                ...state.vaDisability,
                combinedRating,
                chapter35Eligible: combinedRating >= 100,
                champvaEligible: combinedRating >= 100,
                propertyTaxExemption: combinedRating >= 100,
              }
            : null,
        }));

        // Recalculate compensation
        get().calculateVACompensation();

        return combinedRating;
      },

      calculateVACompensation: () => {
        const { vaDisability, transitionInfo } = get();
        if (!vaDisability) return 0;

        const monthlyCompensation = getVACompensation(
          vaDisability.combinedRating,
          vaDisability.hasSpouse,
          vaDisability.dependentCount
        );

        // Check CRDP/CRSC eligibility (requires retirement and 50%+ rating)
        const isRetiring =
          transitionInfo?.separationType === 'retirement' ||
          transitionInfo?.separationType === 'medical_retirement' ||
          transitionInfo?.separationType === 'disability_retirement';

        const crdpEligible = isRetiring && vaDisability.combinedRating >= 50;
        const crscEligible = isRetiring; // Combat-related requires application

        set((state) => ({
          vaDisability: state.vaDisability
            ? {
                ...state.vaDisability,
                monthlyCompensation,
                crdpEligible,
                crscEligible,
              }
            : null,
        }));

        return monthlyCompensation;
      },

      updateConcurrentReceipt: (option) => {
        set((state) => ({
          vaDisability: state.vaDisability
            ? {
                ...state.vaDisability,
                selectedOption: option,
              }
            : null,
        }));
      },

      // ========================================
      // TSP
      // ========================================

      setTSPSummary: (summary) => {
        set((state) => ({
          tspSummary: state.tspSummary
            ? { ...state.tspSummary, ...summary }
            : {
                traditionalBalance: 0,
                rothBalance: 0,
                totalBalance: 0,
                traditionalContributionPercent: 0,
                rothContributionPercent: 0,
                totalContributionPercent: 0,
                brsMatchEarned: 0,
                brsMatchVested: false,
                vestingPercent: 0,
                fundsAllocation: [],
                hasLoan: false,
                ...summary,
              },
        }));
      },

      updateFundsAllocation: (allocation) => {
        set((state) => ({
          tspSummary: state.tspSummary
            ? { ...state.tspSummary, fundsAllocation: allocation }
            : null,
        }));
      },

      updateContributionRates: (traditional, roth) => {
        set((state) => ({
          tspSummary: state.tspSummary
            ? {
                ...state.tspSummary,
                traditionalContributionPercent: traditional,
                rothContributionPercent: roth,
                totalContributionPercent: traditional + roth,
              }
            : null,
        }));
      },

      // ========================================
      // CALCULATIONS
      // ========================================

      calculateRetirement: (input) => {
        const { retirementSystem, yearsOfService, highThreeBasePay, vaRating, combatRelated } = input;

        // Calculate base retirement (returns just the monthly amount)
        const grossMonthlyRetirement = calculateRetirementPay(
          yearsOfService,
          highThreeBasePay,
          retirementSystem
        );

        // Calculate multiplier
        const multiplierRate = RETIREMENT_MULTIPLIERS[retirementSystem];
        const multiplier = Math.min(yearsOfService * multiplierRate * 100, 75); // As percentage, capped at 75%

        // Calculate VA waiver and concurrent receipt if applicable
        let vaWaiver = 0;
        let crdpAmount = 0;
        let crscAmount = 0;
        let taxFreeAmount = 0;

        if (vaRating && vaRating > 0) {
          const vaComp = getVACompensation(vaRating, false, 0);

          if (vaRating >= 50) {
            // CRDP - full retirement + full VA
            const crdpResult = calculateCRDP(grossMonthlyRetirement, vaRating);
            crdpAmount = crdpResult.eligible ? crdpResult.amount : 0;
          } else {
            // VA waiver - must give up part of retirement for VA
            vaWaiver = Math.min(vaComp, grossMonthlyRetirement);
          }

          if (combatRelated) {
            // CRSC calculation
            const crscResult = calculateCRSC(grossMonthlyRetirement, vaComp, vaRating);
            crscAmount = crscResult.eligible ? crscResult.amount : 0;
          }

          taxFreeAmount = vaComp; // VA is always tax-free
        }

        const netMonthlyRetirement =
          grossMonthlyRetirement - vaWaiver + Math.max(crdpAmount, crscAmount);

        const retirementResult: RetirementResult = {
          multiplier,
          grossMonthlyRetirement,
          vaWaiver,
          crdpAmount,
          crscAmount,
          netMonthlyRetirement,
          annualRetirement: netMonthlyRetirement * 12,
          taxableAmount: grossMonthlyRetirement - vaWaiver,
          taxFreeAmount,
        };

        set({ retirementResult });

        return retirementResult;
      },

      calculateIncomeComparison: (civilianSalary, basePay, allowances) => {
        const { transitionInfo, retirementResult, vaDisability } = get();

        // Military totals
        const militaryBasePay = basePay;
        const militaryAllowances = allowances;
        const militaryTotal = militaryBasePay + militaryAllowances;

        // Tax-adjusted equivalent (allowances are tax-free)
        const taxRate = 0.22; // Assume 22% effective rate
        const militaryTaxableEquivalent =
          militaryBasePay + militaryAllowances / (1 - taxRate);

        // Expected civilian
        const expectedBenefitsValue = civilianSalary * 0.3; // ~30% of salary in benefits
        const civilianTotal = civilianSalary + expectedBenefitsValue;

        // Post-separation income
        const retirementPay = retirementResult?.netMonthlyRetirement || 0;
        const vaCompensation = vaDisability?.monthlyCompensation || 0;
        const postSeparationTotal = retirementPay + vaCompensation;

        // Analysis
        const incomeDifference = civilianSalary - militaryTaxableEquivalent * 12;
        const breakEvenSalary = militaryTaxableEquivalent * 12;
        const recommendedMinimum = breakEvenSalary * 1.1; // 10% buffer

        const comparison: IncomeComparison = {
          militaryBasePay,
          militaryAllowances,
          militarySpecialPays: 0,
          militaryTotal,
          militaryTaxableEquivalent,
          civilianSalary,
          expectedBenefitsValue,
          civilianTotal,
          retirementPay: retirementPay * 12,
          vaCompensation: vaCompensation * 12,
          postSeparationTotal: postSeparationTotal * 12,
          incomeDifference,
          breakEvenSalary,
          recommendedMinimum,
        };

        set({ incomeComparison: comparison });

        return comparison;
      },

      calculateTerminalLeave: (basePay) => {
        const { transitionInfo } = get();
        if (!transitionInfo) return null;

        const { leaveBalance, etsDate, sellLeaveOption, sellLeaveDays } = transitionInfo;

        // Calculate sellback days
        const sellbackDays = sellLeaveOption === 'sell' ? leaveBalance : (sellLeaveDays || 0);

        // Calculate daily base pay
        const dailyBasePay = basePay / 30;

        // Calculate sellback value
        const sellback = calculateLeaveSellback(leaveBalance, dailyBasePay, sellbackDays);

        // Get terminal leave days from the result
        const terminalLeaveDays = sellback.terminalLeaveDays;

        // Calculate dates
        const ets = new Date(etsDate);
        const terminalLeaveStart = new Date(ets);
        terminalLeaveStart.setDate(terminalLeaveStart.getDate() - terminalLeaveDays);

        const calc: TerminalLeaveCalc = {
          leaveBalance,
          terminalLeaveStartDate: terminalLeaveStart.toISOString().split('T')[0],
          lastDayOfWork: addDays(terminalLeaveStart.toISOString().split('T')[0], -1),
          officialSeparationDate: etsDate,
          leaveSellbackDays: sellbackDays,
          leaveSellbackValue: sellback.sellbackValue,
          effectiveSeparationDate: terminalLeaveStart.toISOString().split('T')[0],
        };

        // Update transition info with calculated dates
        get().updateDates({
          terminalLeaveStartDate: calc.terminalLeaveStartDate,
          lastDayOfWork: calc.lastDayOfWork,
          officialSeparationDate: calc.officialSeparationDate,
        });

        return calc;
      },

      calculateSeparationPayEstimate: (basePay, payGrade) => {
        const { transitionInfo } = get();
        if (!transitionInfo) return null;

        const { activeYears, separationType } = transitionInfo;

        // Only eligible for certain separation types
        const eligibleTypes: SeparationType[] = [
          'voluntary_separation',
          'involuntary_separation',
        ];

        if (!eligibleTypes.includes(separationType)) {
          return {
            eligible: false,
            yearsOfService: activeYears,
            basePay,
            multiplier: 0,
            grossAmount: 0,
            federalTaxWithholding: 0,
            stateTaxWithholding: 0,
            netAmount: 0,
            paymentType: 'lump_sum' as const,
          };
        }

        // Calculate separation pay
        const result = calculateSeparationPay(activeYears, basePay, true);

        // Convert to SeparationPayCalc format
        const taxRate = 0.25;
        return {
          eligible: result.eligible,
          yearsOfService: activeYears,
          basePay,
          multiplier: 0.10, // 10% for full separation
          grossAmount: result.grossAmount,
          federalTaxWithholding: result.grossAmount * 0.22,
          stateTaxWithholding: result.grossAmount * 0.03,
          netAmount: result.netEstimate,
          paymentType: 'lump_sum' as const,
        };
      },

      // ========================================
      // CHECKLIST
      // ========================================

      loadDefaultChecklist: (etsDate) => {
        const items: TransitionChecklistItem[] = [];

        TRANSITION_CHECKLIST.forEach((category) => {
          category.items.forEach((item) => {
            items.push({
              id: generateId(),
              title: item.title,
              description: item.description,
              priority: item.priority,
              category: category.id,
              completed: false,
              resources: item.resources,
            });
          });
        });

        set({ checklistItems: items });
      },

      toggleChecklistItem: (itemId) => {
        set((state) => ({
          checklistItems: state.checklistItems.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  completed: !item.completed,
                  completedAt: !item.completed ? new Date().toISOString() : undefined,
                }
              : item
          ),
        }));
      },

      addChecklistItem: (item) => {
        const newItem: TransitionChecklistItem = {
          ...item,
          id: generateId(),
          completed: false,
        };

        set((state) => ({
          checklistItems: [...state.checklistItems, newItem],
        }));
      },

      updateChecklistItem: (itemId, updates) => {
        set((state) => ({
          checklistItems: state.checklistItems.map((item) =>
            item.id === itemId ? { ...item, ...updates } : item
          ),
        }));
      },

      removeChecklistItem: (itemId) => {
        set((state) => ({
          checklistItems: state.checklistItems.filter((item) => item.id !== itemId),
        }));
      },

      // ========================================
      // QUERIES
      // ========================================

      getDaysUntilETS: () => {
        const { transitionInfo } = get();
        if (!transitionInfo) return 0;

        const today = new Date().toISOString().split('T')[0];
        return calculateDaysBetween(today, transitionInfo.etsDate);
      },

      getDaysUntilTerminalLeave: () => {
        const { transitionInfo } = get();
        if (!transitionInfo?.terminalLeaveStartDate) return 0;

        const today = new Date().toISOString().split('T')[0];
        return calculateDaysBetween(today, transitionInfo.terminalLeaveStartDate);
      },

      getTransitionProgress: () => {
        const { transitionInfo } = get();
        if (!transitionInfo) return 0;

        // Based on typical 12-month transition timeline
        const daysUntil = get().getDaysUntilETS();
        const totalDays = 365;
        const daysComplete = totalDays - daysUntil;

        return Math.min(100, Math.max(0, (daysComplete / totalDays) * 100));
      },

      getChecklistProgress: () => {
        const { checklistItems } = get();
        const total = checklistItems.length;
        const completed = checklistItems.filter((item) => item.completed).length;

        return {
          completed,
          total,
          percent: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
      },

      getTransitionSummary: () => {
        const { transitionInfo, retirementResult, vaDisability, checklistItems } = get();
        if (!transitionInfo) return null;

        const daysUntilETS = get().getDaysUntilETS();
        const daysUntilTerminalLeave = get().getDaysUntilTerminalLeave();
        const checklistProgress = get().getChecklistProgress();
        const milestones = get().getUpcomingMilestones();

        return {
          separationType: transitionInfo.separationType,
          daysUntilETS,
          daysUntilTerminalLeave: daysUntilTerminalLeave || undefined,
          estimatedRetirementPay: retirementResult?.netMonthlyRetirement,
          estimatedVACompensation: vaDisability?.monthlyCompensation,
          checklistProgress: checklistProgress.percent,
          nextMilestone: milestones[0]
            ? { name: milestones[0].name, daysUntil: milestones[0].daysUntil }
            : undefined,
        };
      },

      getUpcomingMilestones: () => {
        const { transitionInfo } = get();
        if (!transitionInfo) return [];

        const today = new Date();
        const milestones: { name: string; daysUntil: number; date: string }[] = [];

        // Terminal leave start
        if (transitionInfo.terminalLeaveStartDate) {
          const days = calculateDaysBetween(
            today.toISOString().split('T')[0],
            transitionInfo.terminalLeaveStartDate
          );
          if (days > 0) {
            milestones.push({
              name: 'Terminal Leave Begins',
              daysUntil: days,
              date: transitionInfo.terminalLeaveStartDate,
            });
          }
        }

        // Last day of work
        if (transitionInfo.lastDayOfWork) {
          const days = calculateDaysBetween(
            today.toISOString().split('T')[0],
            transitionInfo.lastDayOfWork
          );
          if (days > 0) {
            milestones.push({
              name: 'Last Day of Work',
              daysUntil: days,
              date: transitionInfo.lastDayOfWork,
            });
          }
        }

        // ETS date
        const etsDays = calculateDaysBetween(
          today.toISOString().split('T')[0],
          transitionInfo.etsDate
        );
        if (etsDays > 0) {
          milestones.push({
            name: 'Separation Date',
            daysUntil: etsDays,
            date: transitionInfo.etsDate,
          });
        }

        // Sort by days until
        return milestones.sort((a, b) => a.daysUntil - b.daysUntil);
      },

      // ========================================
      // UTILITY
      // ========================================

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      reset: () => set(initialState),
    }),
    {
      name: 'transition-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        transitionInfo: state.transitionInfo,
        vaDisability: state.vaDisability,
        tspSummary: state.tspSummary,
        retirementResult: state.retirementResult,
        incomeComparison: state.incomeComparison,
        checklistItems: state.checklistItems,
      }),
    }
  )
);

// ============================================================================
// SELECTORS
// ============================================================================

export const selectTransitionInfo = (state: TransitionState & TransitionActions) =>
  state.transitionInfo;

export const selectVADisability = (state: TransitionState & TransitionActions) =>
  state.vaDisability;

export const selectTSPSummary = (state: TransitionState & TransitionActions) =>
  state.tspSummary;

export const selectRetirementResult = (state: TransitionState & TransitionActions) =>
  state.retirementResult;

export const selectIncomeComparison = (state: TransitionState & TransitionActions) =>
  state.incomeComparison;

export const selectChecklistItems = (state: TransitionState & TransitionActions) =>
  state.checklistItems;

export const selectChecklistByCategory = (category: string) => (state: TransitionState & TransitionActions) =>
  state.checklistItems.filter((item) => item.category === category);

export const selectCriticalItems = (state: TransitionState & TransitionActions) =>
  state.checklistItems.filter((item) => item.priority === 'critical' && !item.completed);

export const selectIsRetiring = (state: TransitionState & TransitionActions) => {
  const separationType = state.transitionInfo?.separationType;
  return (
    separationType === 'retirement' ||
    separationType === 'medical_retirement' ||
    separationType === 'disability_retirement'
  );
};
