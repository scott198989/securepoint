/**
 * LES (Leave and Earnings Statement) Store
 * Manages LES entries, comparisons, and analysis
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  LESEntry,
  LESEntitlement,
  LESDeduction,
  LESAllotment,
  LESComparison,
  LESChange,
  LESTrend,
  PayPeriodType,
  EntitlementType,
  DeductionType,
  LESValidationResult,
} from '../types/les';
import { generateId } from '../utils';
import { storage } from '../utils/storage';
import { getChangeExplanation } from '../constants/lesDescriptions';

// ============================================================================
// STORE INTERFACE
// ============================================================================

interface LESState {
  // Data
  entries: LESEntry[];
  comparisons: LESComparison[];

  // UI State
  currentEntryId: string | null;
  selectedEntriesForCompare: [string, string] | null;
  isLoading: boolean;
  error: string | null;

  // Filters
  filterYear: number | null;
  filterMonth: number | null;

  // Entry Management
  addEntry: (entry: Omit<LESEntry, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateEntry: (id: string, updates: Partial<LESEntry>) => void;
  deleteEntry: (id: string) => void;
  getEntry: (id: string) => LESEntry | undefined;

  // Entitlement/Deduction/Allotment Management
  addEntitlement: (entryId: string, entitlement: Omit<LESEntitlement, 'id'>) => void;
  updateEntitlement: (entryId: string, entitlementId: string, updates: Partial<LESEntitlement>) => void;
  removeEntitlement: (entryId: string, entitlementId: string) => void;

  addDeduction: (entryId: string, deduction: Omit<LESDeduction, 'id'>) => void;
  updateDeduction: (entryId: string, deductionId: string, updates: Partial<LESDeduction>) => void;
  removeDeduction: (entryId: string, deductionId: string) => void;

  addAllotment: (entryId: string, allotment: Omit<LESAllotment, 'id'>) => void;
  updateAllotment: (entryId: string, allotmentId: string, updates: Partial<LESAllotment>) => void;
  removeAllotment: (entryId: string, allotmentId: string) => void;

  // Recalculate totals after changes
  recalculateTotals: (entryId: string) => void;

  // Comparison
  compareEntries: (previousId: string, currentId: string) => LESComparison | null;
  getLatestComparison: () => LESComparison | null;
  deleteComparison: (id: string) => void;

  // Queries
  getEntriesByYear: (year: number) => LESEntry[];
  getEntriesByMonth: (year: number, month: number) => LESEntry[];
  getLatestEntry: () => LESEntry | null;
  getEntryByPeriod: (year: number, month: number, type: PayPeriodType) => LESEntry | null;
  getPreviousEntry: (entryId: string) => LESEntry | null;

  // Analysis
  calculateTrend: (metric: 'gross_pay' | 'net_pay' | 'total_deductions', months: number) => LESTrend | null;
  validateEntry: (entryId: string) => LESValidationResult | null;

  // UI State Management
  setCurrentEntry: (id: string | null) => void;
  setCompareEntries: (ids: [string, string] | null) => void;
  setFilter: (year: number | null, month: number | null) => void;
  clearFilters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Persistence
  reset: () => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateEntryTotals(entry: LESEntry): LESEntry['totals'] {
  const grossPay = entry.entitlements.reduce((sum, e) => sum + e.amount, 0);
  const totalDeductions = entry.deductions.reduce((sum, d) => sum + d.amount, 0);
  const totalAllotments = entry.allotments.reduce((sum, a) => sum + a.amount, 0);
  const netPay = grossPay - totalDeductions - totalAllotments;

  // Calculate YTD if we have YTD data
  const ytdGross = entry.entitlements.reduce((sum, e) => sum + (e.ytdAmount || 0), 0) || undefined;
  const ytdDeductions = entry.deductions.reduce((sum, d) => sum + (d.ytdAmount || 0), 0) || undefined;
  const ytdNet = ytdGross && ytdDeductions ? ytdGross - ytdDeductions : undefined;

  return {
    grossPay: Math.round(grossPay * 100) / 100,
    totalDeductions: Math.round(totalDeductions * 100) / 100,
    totalAllotments: Math.round(totalAllotments * 100) / 100,
    netPay: Math.round(netPay * 100) / 100,
    ytdGross,
    ytdDeductions,
    ytdNet,
  };
}

function detectChanges(previous: LESEntry, current: LESEntry): LESChange[] {
  const changes: LESChange[] = [];

  // Helper to find item changes
  const findItemChanges = <T extends { type: string; amount: number; description: string }>(
    prevItems: T[],
    currItems: T[],
    category: 'entitlement' | 'deduction' | 'allotment'
  ) => {
    // Check for removed or changed items
    for (const prevItem of prevItems) {
      const currItem = currItems.find((c) => c.type === prevItem.type);

      if (!currItem) {
        changes.push({
          category,
          type: prevItem.type,
          description: prevItem.description,
          changeType: 'removed',
          previousAmount: prevItem.amount,
          currentAmount: 0,
          difference: -prevItem.amount,
          percentChange: -100,
          possibleReason: getChangeExplanation(
            prevItem.type as EntitlementType | DeductionType,
            'removed'
          ),
        });
      } else if (currItem.amount !== prevItem.amount) {
        const difference = currItem.amount - prevItem.amount;
        const percentChange = prevItem.amount !== 0
          ? (difference / prevItem.amount) * 100
          : 100;

        changes.push({
          category,
          type: prevItem.type,
          description: prevItem.description,
          changeType: difference > 0 ? 'increased' : 'decreased',
          previousAmount: prevItem.amount,
          currentAmount: currItem.amount,
          difference,
          percentChange: Math.round(percentChange * 100) / 100,
          possibleReason: getChangeExplanation(
            prevItem.type as EntitlementType | DeductionType,
            difference > 0 ? 'increased' : 'decreased'
          ),
        });
      }
    }

    // Check for added items
    for (const currItem of currItems) {
      const prevItem = prevItems.find((p) => p.type === currItem.type);

      if (!prevItem) {
        changes.push({
          category,
          type: currItem.type,
          description: currItem.description,
          changeType: 'added',
          previousAmount: 0,
          currentAmount: currItem.amount,
          difference: currItem.amount,
          percentChange: 100,
          possibleReason: getChangeExplanation(
            currItem.type as EntitlementType | DeductionType,
            'added'
          ),
        });
      }
    }
  };

  findItemChanges(previous.entitlements, current.entitlements, 'entitlement');
  findItemChanges(previous.deductions, current.deductions, 'deduction');
  findItemChanges(previous.allotments, current.allotments, 'allotment');

  return changes;
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useLESStore = create<LESState>()(
  persist(
    (set, get) => ({
      // Initial State
      entries: [],
      comparisons: [],
      currentEntryId: null,
      selectedEntriesForCompare: null,
      isLoading: false,
      error: null,
      filterYear: null,
      filterMonth: null,

      // Entry Management
      addEntry: (entryData) => {
        const id = generateId();
        const now = new Date().toISOString();

        const newEntry: LESEntry = {
          ...entryData,
          id,
          createdAt: now,
          updatedAt: now,
          totals: calculateEntryTotals(entryData as LESEntry),
        };

        set((state) => ({
          entries: [...state.entries, newEntry].sort((a, b) => {
            // Sort by pay period date descending
            const dateA = new Date(a.payPeriod.payDate);
            const dateB = new Date(b.payPeriod.payDate);
            return dateB.getTime() - dateA.getTime();
          }),
        }));

        return id;
      },

      updateEntry: (id, updates) => {
        set((state) => ({
          entries: state.entries.map((entry) => {
            if (entry.id !== id) return entry;

            const updated = {
              ...entry,
              ...updates,
              updatedAt: new Date().toISOString(),
            };

            // Recalculate totals if items changed
            if (updates.entitlements || updates.deductions || updates.allotments) {
              updated.totals = calculateEntryTotals(updated);
            }

            return updated;
          }),
        }));
      },

      deleteEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
          comparisons: state.comparisons.filter(
            (c) => c.previousEntry.id !== id && c.currentEntry.id !== id
          ),
          currentEntryId: state.currentEntryId === id ? null : state.currentEntryId,
        }));
      },

      getEntry: (id) => {
        return get().entries.find((e) => e.id === id);
      },

      // Entitlement Management
      addEntitlement: (entryId, entitlement) => {
        const entry = get().getEntry(entryId);
        if (!entry) return;

        const newEntitlement: LESEntitlement = {
          ...entitlement,
          id: generateId(),
        };

        get().updateEntry(entryId, {
          entitlements: [...entry.entitlements, newEntitlement],
        });
      },

      updateEntitlement: (entryId, entitlementId, updates) => {
        const entry = get().getEntry(entryId);
        if (!entry) return;

        get().updateEntry(entryId, {
          entitlements: entry.entitlements.map((e) =>
            e.id === entitlementId ? { ...e, ...updates } : e
          ),
        });
      },

      removeEntitlement: (entryId, entitlementId) => {
        const entry = get().getEntry(entryId);
        if (!entry) return;

        get().updateEntry(entryId, {
          entitlements: entry.entitlements.filter((e) => e.id !== entitlementId),
        });
      },

      // Deduction Management
      addDeduction: (entryId, deduction) => {
        const entry = get().getEntry(entryId);
        if (!entry) return;

        const newDeduction: LESDeduction = {
          ...deduction,
          id: generateId(),
        };

        get().updateEntry(entryId, {
          deductions: [...entry.deductions, newDeduction],
        });
      },

      updateDeduction: (entryId, deductionId, updates) => {
        const entry = get().getEntry(entryId);
        if (!entry) return;

        get().updateEntry(entryId, {
          deductions: entry.deductions.map((d) =>
            d.id === deductionId ? { ...d, ...updates } : d
          ),
        });
      },

      removeDeduction: (entryId, deductionId) => {
        const entry = get().getEntry(entryId);
        if (!entry) return;

        get().updateEntry(entryId, {
          deductions: entry.deductions.filter((d) => d.id !== deductionId),
        });
      },

      // Allotment Management
      addAllotment: (entryId, allotment) => {
        const entry = get().getEntry(entryId);
        if (!entry) return;

        const newAllotment: LESAllotment = {
          ...allotment,
          id: generateId(),
        };

        get().updateEntry(entryId, {
          allotments: [...entry.allotments, newAllotment],
        });
      },

      updateAllotment: (entryId, allotmentId, updates) => {
        const entry = get().getEntry(entryId);
        if (!entry) return;

        get().updateEntry(entryId, {
          allotments: entry.allotments.map((a) =>
            a.id === allotmentId ? { ...a, ...updates } : a
          ),
        });
      },

      removeAllotment: (entryId, allotmentId) => {
        const entry = get().getEntry(entryId);
        if (!entry) return;

        get().updateEntry(entryId, {
          allotments: entry.allotments.filter((a) => a.id !== allotmentId),
        });
      },

      // Recalculate Totals
      recalculateTotals: (entryId) => {
        const entry = get().getEntry(entryId);
        if (!entry) return;

        get().updateEntry(entryId, {
          totals: calculateEntryTotals(entry),
        });
      },

      // Comparison
      compareEntries: (previousId, currentId) => {
        const previous = get().getEntry(previousId);
        const current = get().getEntry(currentId);

        if (!previous || !current) return null;

        const changes = detectChanges(previous, current);

        const netPayDifference = current.totals.netPay - previous.totals.netPay;
        const netPayPercentChange = previous.totals.netPay !== 0
          ? (netPayDifference / previous.totals.netPay) * 100
          : 0;

        const significantChanges = changes.filter(
          (c) => Math.abs(c.difference) >= 50 || Math.abs(c.percentChange) >= 5
        );

        const comparison: LESComparison = {
          id: generateId(),
          previousEntry: previous,
          currentEntry: current,
          changes,
          summary: {
            totalChanges: changes.length,
            netPayDifference: Math.round(netPayDifference * 100) / 100,
            netPayPercentChange: Math.round(netPayPercentChange * 100) / 100,
            significantChanges,
          },
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          comparisons: [comparison, ...state.comparisons],
        }));

        return comparison;
      },

      getLatestComparison: () => {
        const { comparisons } = get();
        return comparisons.length > 0 ? comparisons[0] : null;
      },

      deleteComparison: (id) => {
        set((state) => ({
          comparisons: state.comparisons.filter((c) => c.id !== id),
        }));
      },

      // Queries
      getEntriesByYear: (year) => {
        return get().entries.filter((e) => e.payPeriod.year === year);
      },

      getEntriesByMonth: (year, month) => {
        return get().entries.filter(
          (e) => e.payPeriod.year === year && e.payPeriod.month === month
        );
      },

      getLatestEntry: () => {
        const { entries } = get();
        return entries.length > 0 ? entries[0] : null;
      },

      getEntryByPeriod: (year, month, type) => {
        return (
          get().entries.find(
            (e) =>
              e.payPeriod.year === year &&
              e.payPeriod.month === month &&
              e.payPeriod.type === type
          ) || null
        );
      },

      getPreviousEntry: (entryId) => {
        const entries = get().entries;
        const currentIndex = entries.findIndex((e) => e.id === entryId);

        if (currentIndex === -1 || currentIndex === entries.length - 1) {
          return null;
        }

        return entries[currentIndex + 1];
      },

      // Analysis
      calculateTrend: (metric, months) => {
        const entries = get().entries.slice(0, months * 2); // Account for 2 entries per month

        if (entries.length < 2) return null;

        const dataPoints: Array<{ period: string; value: number }> = [];

        // Group by month and average
        const monthlyData = new Map<string, number[]>();

        for (const entry of entries) {
          const period = `${entry.payPeriod.year}-${String(entry.payPeriod.month).padStart(2, '0')}`;
          let value: number;

          switch (metric) {
            case 'gross_pay':
              value = entry.totals.grossPay;
              break;
            case 'net_pay':
              value = entry.totals.netPay;
              break;
            case 'total_deductions':
              value = entry.totals.totalDeductions;
              break;
            default:
              value = entry.totals.netPay;
          }

          if (!monthlyData.has(period)) {
            monthlyData.set(period, []);
          }
          monthlyData.get(period)!.push(value);
        }

        // Calculate monthly averages
        for (const [period, values] of monthlyData) {
          const avg = values.reduce((a, b) => a + b, 0) / values.length;
          dataPoints.push({ period, value: Math.round(avg * 100) / 100 });
        }

        // Sort by period
        dataPoints.sort((a, b) => a.period.localeCompare(b.period));

        // Analyze trend
        const values = dataPoints.map((d) => d.value);
        const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);

        // Simple trend detection
        let trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
        const variance = values.reduce((sum, v) => sum + Math.pow(v - avgValue, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        const coefficientOfVariation = stdDev / avgValue;

        if (coefficientOfVariation > 0.1) {
          trend = 'volatile';
        } else if (values.length >= 2) {
          const firstHalf = values.slice(0, Math.floor(values.length / 2));
          const secondHalf = values.slice(Math.floor(values.length / 2));
          const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
          const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

          if (secondAvg > firstAvg * 1.02) {
            trend = 'increasing';
          } else if (secondAvg < firstAvg * 0.98) {
            trend = 'decreasing';
          } else {
            trend = 'stable';
          }
        } else {
          trend = 'stable';
        }

        return {
          metric,
          dataPoints,
          trend,
          averageValue: Math.round(avgValue * 100) / 100,
          minValue: Math.round(minValue * 100) / 100,
          maxValue: Math.round(maxValue * 100) / 100,
        };
      },

      validateEntry: (entryId) => {
        const entry = get().getEntry(entryId);
        if (!entry) return null;

        const calculatedGross = entry.entitlements.reduce((sum, e) => sum + e.amount, 0);
        const calculatedDeductions = entry.deductions.reduce((sum, d) => sum + d.amount, 0);
        const calculatedAllotments = entry.allotments.reduce((sum, a) => sum + a.amount, 0);
        const calculatedNet = calculatedGross - calculatedDeductions - calculatedAllotments;

        const variance = entry.totals.netPay - calculatedNet;
        const variancePercent = calculatedNet !== 0 ? (variance / calculatedNet) * 100 : 0;

        const warnings: string[] = [];
        const errors: string[] = [];

        // Check for common issues
        if (Math.abs(variance) > 1) {
          warnings.push(`Net pay calculation has variance of $${variance.toFixed(2)}`);
        }

        if (entry.entitlements.length === 0) {
          errors.push('No entitlements entered');
        }

        if (!entry.entitlements.find((e) => e.type === 'base_pay')) {
          warnings.push('No base pay found - is this intentional?');
        }

        const hasFederalTax = entry.deductions.find((d) => d.type === 'federal_tax');
        const hasFICA = entry.deductions.find(
          (d) => d.type === 'fica_social_security' || d.type === 'fica_medicare'
        );

        if (!hasFederalTax) {
          warnings.push('No federal tax withholding - check if in combat zone or W-4');
        }

        if (!hasFICA) {
          warnings.push('No FICA taxes - this is unusual for military pay');
        }

        return {
          isValid: errors.length === 0,
          calculatedGross: Math.round(calculatedGross * 100) / 100,
          calculatedDeductions: Math.round(calculatedDeductions * 100) / 100,
          calculatedNet: Math.round(calculatedNet * 100) / 100,
          actualNet: entry.totals.netPay,
          variance: Math.round(variance * 100) / 100,
          variancePercent: Math.round(variancePercent * 100) / 100,
          warnings,
          errors,
        };
      },

      // UI State Management
      setCurrentEntry: (id) => set({ currentEntryId: id }),

      setCompareEntries: (ids) => set({ selectedEntriesForCompare: ids }),

      setFilter: (year, month) => set({ filterYear: year, filterMonth: month }),

      clearFilters: () => set({ filterYear: null, filterMonth: null }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      // Reset
      reset: () =>
        set({
          entries: [],
          comparisons: [],
          currentEntryId: null,
          selectedEntriesForCompare: null,
          isLoading: false,
          error: null,
          filterYear: null,
          filterMonth: null,
        }),
    }),
    {
      name: 'securepoint-les',
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        entries: state.entries,
        comparisons: state.comparisons,
      }),
    }
  )
);

// ============================================================================
// SELECTORS
// ============================================================================

export const selectLESEntries = (state: LESState) => state.entries;
export const selectCurrentEntry = (state: LESState) =>
  state.currentEntryId ? state.entries.find((e) => e.id === state.currentEntryId) : null;
export const selectFilteredEntries = (state: LESState) => {
  let filtered = state.entries;

  if (state.filterYear) {
    filtered = filtered.filter((e) => e.payPeriod.year === state.filterYear);
  }

  if (state.filterMonth) {
    filtered = filtered.filter((e) => e.payPeriod.month === state.filterMonth);
  }

  return filtered;
};
export const selectComparisons = (state: LESState) => state.comparisons;
export const selectEntryCount = (state: LESState) => state.entries.length;
export const selectYears = (state: LESState) => {
  const years = new Set(state.entries.map((e) => e.payPeriod.year));
  return Array.from(years).sort((a, b) => b - a);
};
