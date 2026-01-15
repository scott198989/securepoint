/**
 * Deployment Store
 * Manages deployment status, pay adjustments, and savings tracking
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  DeploymentInfo,
  DeploymentPhase,
  DeploymentType,
  DeploymentLocation,
  DeploymentPayAdjustments,
  DeploymentBudget,
  DeploymentExpenseAdjustment,
  DeploymentSavingsTracker,
  DeploymentSavingsSnapshot,
  SavingsMilestone,
  DeploymentCountdown,
  CountdownMilestone,
  OfflineQueueItem,
  OfflineSyncState,
  DeploymentSummary,
  CZTEStatus,
} from '../types/deployment';
import { storage } from '../utils/storage';
import { DEPLOYMENT_PAY_RATES, DEFAULT_EXPENSE_ADJUSTMENTS } from '../constants/deploymentData';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Calculate days between two dates
 */
function daysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate additional monthly pay from deployment
 */
function calculateAdditionalMonthlyPay(adjustments: DeploymentPayAdjustments): number {
  let total = 0;

  if (adjustments.hostileFirePay || adjustments.imminentDangerPay) {
    total += DEPLOYMENT_PAY_RATES.hostileFirePay;
  }

  if (adjustments.familySeparationAllowance) {
    total += DEPLOYMENT_PAY_RATES.familySeparationAllowance;
  }

  if (adjustments.hardshipDutyPay && adjustments.hardshipDutyRate) {
    total += adjustments.hardshipDutyRate;
  }

  return total;
}

/**
 * Calculate estimated tax savings from CZTE
 */
function calculateTaxSavings(
  monthlyTaxableIncome: number,
  czteStatus: CZTEStatus,
  estimatedTaxRate: number = 0.22
): number {
  if (czteStatus === 'none') return 0;

  let taxableExcluded = monthlyTaxableIncome;

  if (czteStatus === 'capped') {
    // Officer cap applies
    taxableExcluded = Math.min(monthlyTaxableIncome, DEPLOYMENT_PAY_RATES.hostileFirePay * 47);
  }

  return taxableExcluded * estimatedTaxRate;
}

/**
 * Determine deployment phase based on dates
 */
function determinePhase(
  departureDate: string,
  expectedReturnDate: string,
  actualReturnDate?: string
): DeploymentPhase {
  const now = new Date();
  const departure = new Date(departureDate);
  const expectedReturn = new Date(expectedReturnDate);

  if (actualReturnDate) {
    const actual = new Date(actualReturnDate);
    const daysSinceReturn = daysBetween(actualReturnDate, now.toISOString());
    if (daysSinceReturn <= 90) {
      return 'post_deployment';
    }
    return 'not_deployed';
  }

  const daysUntilDeparture = daysBetween(now.toISOString(), departureDate);
  const daysUntilReturn = daysBetween(now.toISOString(), expectedReturnDate);

  if (now < departure) {
    if (daysUntilDeparture <= 90) {
      return 'pre_deployment';
    }
    return 'not_deployed';
  }

  if (daysUntilReturn <= 30) {
    return 'redeployment';
  }

  return 'deployment';
}

// ============================================================================
// STORE INTERFACE
// ============================================================================

interface DeploymentState {
  // Current deployment
  activeDeployment: DeploymentInfo | null;

  // Budget
  deploymentBudget: DeploymentBudget | null;

  // Savings tracking
  savingsTracker: DeploymentSavingsTracker | null;

  // History
  deploymentHistory: DeploymentInfo[];

  // Offline
  offlineSync: OfflineSyncState;

  // UI
  isLoading: boolean;
  error: string | null;

  // Deployment lifecycle
  startDeployment: (
    type: DeploymentType,
    departureDate: string,
    expectedReturnDate: string,
    location: DeploymentLocation
  ) => string;
  updateDeployment: (updates: Partial<DeploymentInfo>) => void;
  endDeployment: (actualReturnDate: string) => void;
  cancelDeployment: () => void;

  // Phase management
  updatePhase: (phase: DeploymentPhase) => void;
  refreshPhase: () => void;

  // Pay adjustments
  updatePayAdjustments: (adjustments: Partial<DeploymentPayAdjustments>) => void;
  enableCombatZoneBenefits: () => void;
  disableCombatZoneBenefits: () => void;

  // Budget management
  createDeploymentBudget: (normalMonthlyExpenses: number, normalMonthlySavings: number) => void;
  updateExpenseAdjustment: (categoryId: string, deploymentBudget: number) => void;
  setFamilyBudget: (monthlyAllowance: number, emergencyTarget: number) => void;
  setSavingsAllocation: (allocation: DeploymentBudget['savingsAllocation']) => void;

  // Savings tracking
  initializeSavingsTracker: (savingsGoal: number) => void;
  updateSavingsGoal: (amount: number) => void;
  recordSavingsSnapshot: (snapshot: Omit<DeploymentSavingsSnapshot, 'cumulativeSavings'>) => void;
  addSavingsMilestone: (name: string, targetAmount: number) => void;
  checkMilestones: () => void;

  // Countdown
  getCountdown: () => DeploymentCountdown | null;
  addCountdownMilestone: (name: string, date: string, type: CountdownMilestone['type']) => void;
  removeCountdownMilestone: (id: string) => void;

  // Offline sync
  addToOfflineQueue: (type: OfflineQueueItem['type'], data: Record<string, unknown>) => void;
  processOfflineQueue: () => Promise<void>;
  setOnlineStatus: (isOnline: boolean) => void;
  clearSyncedItems: () => void;

  // Queries
  isDeployed: () => boolean;
  getDeploymentDuration: () => number;
  getDaysRemaining: () => number;
  getProjectedSavings: () => number;
  getDeploymentSummary: () => DeploymentSummary | null;
  getAdditionalMonthlyPay: () => number;
  getEstimatedTaxSavings: (monthlyTaxable: number) => number;

  // History
  getDeploymentHistory: () => DeploymentInfo[];
  getDeploymentById: (id: string) => DeploymentInfo | undefined;

  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const defaultPayAdjustments: DeploymentPayAdjustments = {
  hostileFirePay: false,
  imminentDangerPay: false,
  hardshipDutyPay: false,
  familySeparationAllowance: false,
  combatZoneTaxExclusion: false,
  czteStatus: 'none',
  bahContinuation: true,
  savingsDepositProgram: false,
  additionalMonthlyPay: 0,
  estimatedTaxSavings: 0,
};

const defaultOfflineSync: OfflineSyncState = {
  isOnline: true,
  pendingItems: 0,
  failedItems: 0,
  queue: [],
};

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useDeploymentStore = create<DeploymentState>()(
  persist(
    (set, get) => ({
      // Initial state
      activeDeployment: null,
      deploymentBudget: null,
      savingsTracker: null,
      deploymentHistory: [],
      offlineSync: defaultOfflineSync,
      isLoading: false,
      error: null,

      // ========================================================================
      // DEPLOYMENT LIFECYCLE
      // ========================================================================

      startDeployment: (type, departureDate, expectedReturnDate, location) => {
        const id = generateId();
        const now = getTimestamp();

        const phase = determinePhase(departureDate, expectedReturnDate);

        const deployment: DeploymentInfo = {
          id,
          isActive: true,
          phase,
          type,
          departureDate,
          expectedReturnDate,
          location,
          payAdjustments: { ...defaultPayAdjustments },
          familyBudgetEnabled: false,
          createdAt: now,
          updatedAt: now,
        };

        // Auto-enable benefits if in combat zone
        if (location.isHazardous) {
          deployment.payAdjustments.hostileFirePay = true;
          deployment.payAdjustments.combatZoneTaxExclusion = true;
          deployment.payAdjustments.czteStatus = 'full';
        }

        // Recalculate additional pay
        deployment.payAdjustments.additionalMonthlyPay = calculateAdditionalMonthlyPay(
          deployment.payAdjustments
        );

        set({ activeDeployment: deployment, error: null });
        return id;
      },

      updateDeployment: (updates) => {
        const { activeDeployment } = get();
        if (!activeDeployment) return;

        const updatedDeployment = {
          ...activeDeployment,
          ...updates,
          updatedAt: getTimestamp(),
        };

        // Recalculate phase if dates changed
        if (updates.departureDate || updates.expectedReturnDate) {
          updatedDeployment.phase = determinePhase(
            updatedDeployment.departureDate,
            updatedDeployment.expectedReturnDate,
            updatedDeployment.actualReturnDate
          );
        }

        set({ activeDeployment: updatedDeployment });
      },

      endDeployment: (actualReturnDate) => {
        const { activeDeployment, deploymentHistory } = get();
        if (!activeDeployment) return;

        const completedDeployment: DeploymentInfo = {
          ...activeDeployment,
          isActive: false,
          actualReturnDate,
          phase: 'post_deployment',
          updatedAt: getTimestamp(),
        };

        set({
          activeDeployment: null,
          deploymentBudget: null,
          savingsTracker: null,
          deploymentHistory: [...deploymentHistory, completedDeployment],
        });
      },

      cancelDeployment: () => {
        set({
          activeDeployment: null,
          deploymentBudget: null,
          savingsTracker: null,
        });
      },

      // ========================================================================
      // PHASE MANAGEMENT
      // ========================================================================

      updatePhase: (phase) => {
        const { activeDeployment } = get();
        if (!activeDeployment) return;

        set({
          activeDeployment: {
            ...activeDeployment,
            phase,
            updatedAt: getTimestamp(),
          },
        });
      },

      refreshPhase: () => {
        const { activeDeployment } = get();
        if (!activeDeployment) return;

        const newPhase = determinePhase(
          activeDeployment.departureDate,
          activeDeployment.expectedReturnDate,
          activeDeployment.actualReturnDate
        );

        if (newPhase !== activeDeployment.phase) {
          set({
            activeDeployment: {
              ...activeDeployment,
              phase: newPhase,
              updatedAt: getTimestamp(),
            },
          });
        }
      },

      // ========================================================================
      // PAY ADJUSTMENTS
      // ========================================================================

      updatePayAdjustments: (adjustments) => {
        const { activeDeployment } = get();
        if (!activeDeployment) return;

        const updatedAdjustments = {
          ...activeDeployment.payAdjustments,
          ...adjustments,
        };

        // Recalculate totals
        updatedAdjustments.additionalMonthlyPay = calculateAdditionalMonthlyPay(updatedAdjustments);

        set({
          activeDeployment: {
            ...activeDeployment,
            payAdjustments: updatedAdjustments,
            updatedAt: getTimestamp(),
          },
        });
      },

      enableCombatZoneBenefits: () => {
        get().updatePayAdjustments({
          hostileFirePay: true,
          combatZoneTaxExclusion: true,
          czteStatus: 'full',
        });
      },

      disableCombatZoneBenefits: () => {
        get().updatePayAdjustments({
          hostileFirePay: false,
          imminentDangerPay: false,
          combatZoneTaxExclusion: false,
          czteStatus: 'none',
        });
      },

      // ========================================================================
      // BUDGET MANAGEMENT
      // ========================================================================

      createDeploymentBudget: (normalMonthlyExpenses, normalMonthlySavings) => {
        const { activeDeployment } = get();
        if (!activeDeployment) return;

        const now = getTimestamp();

        // Create default expense adjustments
        const expenseAdjustments: DeploymentExpenseAdjustment[] = DEFAULT_EXPENSE_ADJUSTMENTS.map(
          (adj) => ({
            ...adj,
            normalBudget: 0, // User will need to set these
            deploymentBudget: 0,
          })
        );

        const budget: DeploymentBudget = {
          id: generateId(),
          deploymentId: activeDeployment.id,
          normalMonthlyExpenses,
          normalMonthlySavings,
          expenseAdjustments,
          deploymentMonthlyExpenses: normalMonthlyExpenses * 0.5, // Default 50% reduction
          projectedMonthlySavings: 0,
          projectedTotalSavings: 0,
          createdAt: now,
          updatedAt: now,
        };

        // Calculate projected savings
        const deploymentMonths = Math.ceil(get().getDeploymentDuration() / 30);
        const additionalPay = activeDeployment.payAdjustments.additionalMonthlyPay;
        budget.projectedMonthlySavings =
          normalMonthlySavings + (normalMonthlyExpenses - budget.deploymentMonthlyExpenses) + additionalPay;
        budget.projectedTotalSavings = budget.projectedMonthlySavings * deploymentMonths;

        set({ deploymentBudget: budget });
      },

      updateExpenseAdjustment: (categoryId, deploymentBudget) => {
        const { deploymentBudget: budget } = get();
        if (!budget) return;

        const updatedAdjustments = budget.expenseAdjustments.map((adj) =>
          adj.categoryId === categoryId ? { ...adj, deploymentBudget } : adj
        );

        // Recalculate totals
        const deploymentMonthlyExpenses = updatedAdjustments.reduce(
          (sum, adj) => sum + adj.deploymentBudget,
          0
        );

        const deploymentMonths = Math.ceil(get().getDeploymentDuration() / 30);
        const additionalPay = get().activeDeployment?.payAdjustments.additionalMonthlyPay || 0;
        const projectedMonthlySavings =
          budget.normalMonthlySavings +
          (budget.normalMonthlyExpenses - deploymentMonthlyExpenses) +
          additionalPay;

        set({
          deploymentBudget: {
            ...budget,
            expenseAdjustments: updatedAdjustments,
            deploymentMonthlyExpenses,
            projectedMonthlySavings,
            projectedTotalSavings: projectedMonthlySavings * deploymentMonths,
            updatedAt: getTimestamp(),
          },
        });
      },

      setFamilyBudget: (monthlyAllowance, emergencyTarget) => {
        const { deploymentBudget, activeDeployment } = get();
        if (!deploymentBudget || !activeDeployment) return;

        set({
          deploymentBudget: {
            ...deploymentBudget,
            familyBudget: {
              monthlyAllowance,
              categories: [],
              emergencyFundTarget: emergencyTarget,
            },
            updatedAt: getTimestamp(),
          },
          activeDeployment: {
            ...activeDeployment,
            familyBudgetEnabled: true,
            updatedAt: getTimestamp(),
          },
        });
      },

      setSavingsAllocation: (allocation) => {
        const { deploymentBudget } = get();
        if (!deploymentBudget) return;

        set({
          deploymentBudget: {
            ...deploymentBudget,
            savingsAllocation: allocation,
            updatedAt: getTimestamp(),
          },
        });
      },

      // ========================================================================
      // SAVINGS TRACKING
      // ========================================================================

      initializeSavingsTracker: (savingsGoal) => {
        const { activeDeployment } = get();
        if (!activeDeployment) return;

        const tracker: DeploymentSavingsTracker = {
          deploymentId: activeDeployment.id,
          savingsGoal,
          currentSavings: 0,
          progressPercent: 0,
          monthlySnapshots: [],
          milestones: [
            {
              id: generateId(),
              name: 'Deployment Goal',
              targetAmount: savingsGoal,
              isAchieved: false,
            },
          ],
          projectedEndTotal: 0,
          onTrack: true,
          daysRemaining: get().getDaysRemaining(),
        };

        set({ savingsTracker: tracker });
      },

      updateSavingsGoal: (amount) => {
        const { savingsTracker } = get();
        if (!savingsTracker) return;

        // Update the main goal milestone
        const milestones = savingsTracker.milestones.map((m) =>
          m.name === 'Deployment Goal' ? { ...m, targetAmount: amount } : m
        );

        set({
          savingsTracker: {
            ...savingsTracker,
            savingsGoal: amount,
            milestones,
            progressPercent: (savingsTracker.currentSavings / amount) * 100,
          },
        });
      },

      recordSavingsSnapshot: (snapshot) => {
        const { savingsTracker } = get();
        if (!savingsTracker) return;

        // Calculate cumulative
        const previousTotal =
          savingsTracker.monthlySnapshots.length > 0
            ? savingsTracker.monthlySnapshots[savingsTracker.monthlySnapshots.length - 1].cumulativeSavings
            : 0;

        const fullSnapshot: DeploymentSavingsSnapshot = {
          ...snapshot,
          cumulativeSavings: previousTotal + snapshot.netSavings,
        };

        const monthlySnapshots = [...savingsTracker.monthlySnapshots, fullSnapshot];
        const currentSavings = fullSnapshot.cumulativeSavings;
        const progressPercent = (currentSavings / savingsTracker.savingsGoal) * 100;

        // Check if on track
        const monthsElapsed = monthlySnapshots.length;
        const totalMonths = Math.ceil(get().getDeploymentDuration() / 30);
        const expectedProgress = (monthsElapsed / totalMonths) * savingsTracker.savingsGoal;
        const onTrack = currentSavings >= expectedProgress * 0.9; // 90% of expected is "on track"

        set({
          savingsTracker: {
            ...savingsTracker,
            monthlySnapshots,
            currentSavings,
            progressPercent,
            onTrack,
            daysRemaining: get().getDaysRemaining(),
          },
        });

        // Check milestones
        get().checkMilestones();
      },

      addSavingsMilestone: (name, targetAmount) => {
        const { savingsTracker } = get();
        if (!savingsTracker) return;

        const milestone: SavingsMilestone = {
          id: generateId(),
          name,
          targetAmount,
          isAchieved: savingsTracker.currentSavings >= targetAmount,
          achievedAt: savingsTracker.currentSavings >= targetAmount ? getTimestamp() : undefined,
        };

        set({
          savingsTracker: {
            ...savingsTracker,
            milestones: [...savingsTracker.milestones, milestone],
          },
        });
      },

      checkMilestones: () => {
        const { savingsTracker } = get();
        if (!savingsTracker) return;

        const now = getTimestamp();
        let updated = false;

        const milestones = savingsTracker.milestones.map((m) => {
          if (!m.isAchieved && savingsTracker.currentSavings >= m.targetAmount) {
            updated = true;
            return { ...m, isAchieved: true, achievedAt: now };
          }
          return m;
        });

        if (updated) {
          set({
            savingsTracker: {
              ...savingsTracker,
              milestones,
            },
          });
        }
      },

      // ========================================================================
      // COUNTDOWN
      // ========================================================================

      getCountdown: () => {
        const { activeDeployment } = get();
        if (!activeDeployment) return null;

        const now = new Date();
        const departure = new Date(activeDeployment.departureDate);
        const expectedReturn = new Date(activeDeployment.expectedReturnDate);

        const totalDays = daysBetween(activeDeployment.departureDate, activeDeployment.expectedReturnDate);
        const daysComplete = now >= departure ? daysBetween(activeDeployment.departureDate, now.toISOString()) : 0;
        const daysRemaining = Math.max(0, daysBetween(now.toISOString(), activeDeployment.expectedReturnDate));
        const percentComplete = Math.min(100, (daysComplete / totalDays) * 100);

        // Calculate midtour date (halfway point)
        const midtourMs = departure.getTime() + (expectedReturn.getTime() - departure.getTime()) / 2;
        const midtourDate = new Date(midtourMs).toISOString().split('T')[0];

        return {
          deploymentId: activeDeployment.id,
          phase: activeDeployment.phase,
          totalDays,
          daysComplete,
          daysRemaining,
          percentComplete,
          departureDate: activeDeployment.departureDate,
          midtourDate,
          expectedReturnDate: activeDeployment.expectedReturnDate,
          upcomingMilestones: [],
          monthsDeployed: Math.floor(daysComplete / 30),
          weekendsRemaining: Math.floor(daysRemaining / 7),
        };
      },

      addCountdownMilestone: (name, date, type) => {
        // Milestone storage would be added to activeDeployment
        // For now, this is a placeholder
        console.log('Adding countdown milestone:', name, date, type);
      },

      removeCountdownMilestone: (id) => {
        console.log('Removing countdown milestone:', id);
      },

      // ========================================================================
      // OFFLINE SYNC
      // ========================================================================

      addToOfflineQueue: (type, data) => {
        const { offlineSync } = get();

        const item: OfflineQueueItem = {
          id: generateId(),
          type,
          data,
          createdAt: getTimestamp(),
          syncStatus: 'pending',
          retryCount: 0,
        };

        set({
          offlineSync: {
            ...offlineSync,
            queue: [...offlineSync.queue, item],
            pendingItems: offlineSync.pendingItems + 1,
          },
        });
      },

      processOfflineQueue: async () => {
        const { offlineSync } = get();
        if (offlineSync.queue.length === 0 || !offlineSync.isOnline) return;

        // Process each item
        const processedQueue = offlineSync.queue.map((item) => {
          if (item.syncStatus === 'pending') {
            // In a real app, this would sync to backend
            return { ...item, syncStatus: 'synced' as const, lastAttempt: getTimestamp() };
          }
          return item;
        });

        const syncedCount = processedQueue.filter((i) => i.syncStatus === 'synced').length;
        const failedCount = processedQueue.filter((i) => i.syncStatus === 'failed').length;

        set({
          offlineSync: {
            ...offlineSync,
            queue: processedQueue,
            lastSyncAt: getTimestamp(),
            pendingItems: processedQueue.filter((i) => i.syncStatus === 'pending').length,
            failedItems: failedCount,
          },
        });
      },

      setOnlineStatus: (isOnline) => {
        const { offlineSync } = get();
        set({
          offlineSync: {
            ...offlineSync,
            isOnline,
          },
        });

        // Auto-process queue when coming online
        if (isOnline) {
          get().processOfflineQueue();
        }
      },

      clearSyncedItems: () => {
        const { offlineSync } = get();
        set({
          offlineSync: {
            ...offlineSync,
            queue: offlineSync.queue.filter((i) => i.syncStatus !== 'synced'),
          },
        });
      },

      // ========================================================================
      // QUERIES
      // ========================================================================

      isDeployed: () => {
        const { activeDeployment } = get();
        return activeDeployment?.isActive === true && activeDeployment?.phase === 'deployment';
      },

      getDeploymentDuration: () => {
        const { activeDeployment } = get();
        if (!activeDeployment) return 0;

        return daysBetween(activeDeployment.departureDate, activeDeployment.expectedReturnDate);
      },

      getDaysRemaining: () => {
        const { activeDeployment } = get();
        if (!activeDeployment) return 0;

        const now = new Date().toISOString();
        return Math.max(0, daysBetween(now, activeDeployment.expectedReturnDate));
      },

      getProjectedSavings: () => {
        const { deploymentBudget } = get();
        return deploymentBudget?.projectedTotalSavings || 0;
      },

      getDeploymentSummary: () => {
        const { activeDeployment, savingsTracker } = get();
        if (!activeDeployment) return null;

        const countdown = get().getCountdown();

        return {
          isDeployed: get().isDeployed(),
          phase: activeDeployment.phase,
          daysRemaining: countdown?.daysRemaining || 0,
          percentComplete: countdown?.percentComplete || 0,
          additionalMonthlyPay: activeDeployment.payAdjustments.additionalMonthlyPay,
          projectedSavings: get().getProjectedSavings(),
          savingsProgress: savingsTracker?.progressPercent || 0,
        };
      },

      getAdditionalMonthlyPay: () => {
        const { activeDeployment } = get();
        return activeDeployment?.payAdjustments.additionalMonthlyPay || 0;
      },

      getEstimatedTaxSavings: (monthlyTaxable) => {
        const { activeDeployment } = get();
        if (!activeDeployment) return 0;

        return calculateTaxSavings(
          monthlyTaxable,
          activeDeployment.payAdjustments.czteStatus
        );
      },

      // ========================================================================
      // HISTORY
      // ========================================================================

      getDeploymentHistory: () => {
        return get().deploymentHistory;
      },

      getDeploymentById: (id) => {
        const { activeDeployment, deploymentHistory } = get();
        if (activeDeployment?.id === id) return activeDeployment;
        return deploymentHistory.find((d) => d.id === id);
      },

      // ========================================================================
      // UTILITY
      // ========================================================================

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      reset: () =>
        set({
          activeDeployment: null,
          deploymentBudget: null,
          savingsTracker: null,
          deploymentHistory: [],
          offlineSync: defaultOfflineSync,
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: 'securepoint-deployment',
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        activeDeployment: state.activeDeployment,
        deploymentBudget: state.deploymentBudget,
        savingsTracker: state.savingsTracker,
        deploymentHistory: state.deploymentHistory,
        offlineSync: state.offlineSync,
      }),
    }
  )
);
