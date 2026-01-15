/**
 * Reserve Store
 * Manages drill schedules, orders, and reserve/guard-specific data
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  DrillSchedule,
  DrillWeekend,
  DrillPeriod,
  DrillStatus,
  MilitaryOrders,
  OrdersStatus,
  DrillPayInput,
  DrillPayResult,
  ATPayInput,
  ATPayResult,
  OrdersCivilianComparison,
  getFiscalYear,
  STANDARD_ANNUAL_MUTAS,
  MUTACount,
} from '../types/reserve';
import { MilitaryBranch, PayGrade } from '../types/user';
import { generateId } from '../utils';
import { storage } from '../utils/storage';
import { BASE_PAY_TABLE_2024, BAS_RATES_2024 } from '../constants/militaryData/payTables';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get drill pay per period for a pay grade and YOS
 * Drill pay = 1/30 of monthly base pay per drill period
 */
function getDrillPayPerPeriod(payGrade: PayGrade, yearsOfService: number): number {
  const basePay = BASE_PAY_TABLE_2024[payGrade]?.[Math.min(yearsOfService, 40)] || 0;
  return basePay / 30;
}

/**
 * Get daily active duty pay rate
 */
function getDailyRate(payGrade: PayGrade, yearsOfService: number): number {
  const basePay = BASE_PAY_TABLE_2024[payGrade]?.[Math.min(yearsOfService, 40)] || 0;
  return basePay / 30;
}

// ============================================================================
// STORE INTERFACE
// ============================================================================

interface ReserveState {
  // Data
  currentSchedule: DrillSchedule | null;
  schedules: DrillSchedule[];
  orders: MilitaryOrders[];

  // Civilian job info for comparisons
  civilianJob: {
    employerName?: string;
    annualSalary?: number;
    hourlyRate?: number;
    hoursPerWeek?: number;
    hasUSERRAPolicy: boolean;
    differentialPayPolicy: boolean;
  } | null;

  // UI State
  selectedScheduleId: string | null;
  selectedOrdersId: string | null;
  isLoading: boolean;
  error: string | null;

  // Schedule Management
  createSchedule: (fiscalYear: number, branch: MilitaryBranch, unitName?: string) => string;
  setCurrentSchedule: (scheduleId: string) => void;
  updateSchedule: (id: string, updates: Partial<DrillSchedule>) => void;
  deleteSchedule: (id: string) => void;
  getSchedule: (id: string) => DrillSchedule | undefined;
  getScheduleByFY: (fy: number) => DrillSchedule | undefined;

  // Drill Weekend Management
  addDrillWeekend: (scheduleId: string, weekend: Omit<DrillWeekend, 'id' | 'periods'>) => string;
  updateDrillWeekend: (scheduleId: string, weekendId: string, updates: Partial<DrillWeekend>) => void;
  removeDrillWeekend: (scheduleId: string, weekendId: string) => void;
  getDrillWeekend: (scheduleId: string, weekendId: string) => DrillWeekend | undefined;

  // Drill Period Management
  updateDrillPeriod: (
    scheduleId: string,
    weekendId: string,
    periodId: string,
    status: DrillStatus,
    note?: string
  ) => void;
  markWeekendComplete: (scheduleId: string, weekendId: string) => void;
  markWeekendPaid: (scheduleId: string, weekendId: string, amount?: number) => void;

  // Orders Management
  addOrders: (orders: Omit<MilitaryOrders, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateOrders: (id: string, updates: Partial<MilitaryOrders>) => void;
  deleteOrders: (id: string) => void;
  getOrders: (id: string) => MilitaryOrders | undefined;
  getActiveOrders: () => MilitaryOrders | null;
  getOrdersHistory: () => MilitaryOrders[];

  // Civilian Job
  setCivilianJob: (job: ReserveState['civilianJob']) => void;

  // Pay Calculations
  calculateDrillPay: (input: DrillPayInput) => DrillPayResult;
  calculateATPay: (input: ATPayInput) => ATPayResult;
  calculateOrdersComparison: (ordersId: string) => OrdersCivilianComparison | null;

  // Queries
  getUpcomingDrills: (count?: number) => DrillWeekend[];
  getCompletedDrills: (scheduleId?: string) => DrillWeekend[];
  getUnpaidDrills: (scheduleId?: string) => DrillWeekend[];
  getMissedDrills: (scheduleId?: string) => DrillWeekend[];

  // Summary Calculations
  calculateYearSummary: (scheduleId?: string) => {
    totalMUTAs: number;
    completedMUTAs: number;
    remainingMUTAs: number;
    missedMUTAs: number;
    estimatedAnnualPay: number;
    atDaysCompleted: number;
    atDaysRemaining: number;
  };

  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  currentSchedule: null,
  schedules: [],
  orders: [],
  civilianJob: null,
  selectedScheduleId: null,
  selectedOrdersId: null,
  isLoading: false,
  error: null,
};

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useReserveStore = create<ReserveState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ========================================================================
      // SCHEDULE MANAGEMENT
      // ========================================================================

      createSchedule: (fiscalYear, branch, unitName) => {
        const id = generateId();
        const now = new Date().toISOString();

        const newSchedule: DrillSchedule = {
          id,
          fiscalYear,
          branch,
          unitName,
          drillWeekends: [],
          totalScheduledMUTAs: 0,
          totalCompletedMUTAs: 0,
          totalExcused: 0,
          totalUnexcused: 0,
          atDays: 15,
          atCompleted: false,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          schedules: [...state.schedules, newSchedule],
          currentSchedule: newSchedule,
          selectedScheduleId: id,
        }));

        return id;
      },

      setCurrentSchedule: (scheduleId) => {
        const schedule = get().schedules.find((s) => s.id === scheduleId);
        if (schedule) {
          set({ currentSchedule: schedule, selectedScheduleId: scheduleId });
        }
      },

      updateSchedule: (id, updates) => {
        set((state) => {
          const updatedSchedules = state.schedules.map((s) =>
            s.id === id
              ? { ...s, ...updates, updatedAt: new Date().toISOString() }
              : s
          );
          const updatedCurrent =
            state.currentSchedule?.id === id
              ? { ...state.currentSchedule, ...updates, updatedAt: new Date().toISOString() }
              : state.currentSchedule;

          return {
            schedules: updatedSchedules,
            currentSchedule: updatedCurrent,
          };
        });
      },

      deleteSchedule: (id) => {
        set((state) => ({
          schedules: state.schedules.filter((s) => s.id !== id),
          currentSchedule:
            state.currentSchedule?.id === id ? null : state.currentSchedule,
          selectedScheduleId:
            state.selectedScheduleId === id ? null : state.selectedScheduleId,
        }));
      },

      getSchedule: (id) => {
        return get().schedules.find((s) => s.id === id);
      },

      getScheduleByFY: (fy) => {
        return get().schedules.find((s) => s.fiscalYear === fy);
      },

      // ========================================================================
      // DRILL WEEKEND MANAGEMENT
      // ========================================================================

      addDrillWeekend: (scheduleId, weekend) => {
        const id = generateId();

        // Create drill periods based on MUTA count
        const periods: DrillPeriod[] = [];
        const startDate = new Date(weekend.startDate);

        for (let i = 0; i < weekend.mutaCount; i++) {
          const periodDate = new Date(startDate);
          if (i >= 2) {
            periodDate.setDate(periodDate.getDate() + 1); // Sunday periods
          }

          periods.push({
            id: generateId(),
            date: periodDate.toISOString().split('T')[0],
            periodNumber: (i % 4) + 1,
            status: 'scheduled',
          });
        }

        const newWeekend: DrillWeekend = {
          ...weekend,
          id,
          periods,
          isPaid: false,
        };

        set((state) => {
          const updatedSchedules = state.schedules.map((s) => {
            if (s.id === scheduleId) {
              return {
                ...s,
                drillWeekends: [...s.drillWeekends, newWeekend],
                totalScheduledMUTAs: s.totalScheduledMUTAs + weekend.mutaCount,
                updatedAt: new Date().toISOString(),
              };
            }
            return s;
          });

          const updatedCurrent =
            state.currentSchedule?.id === scheduleId
              ? {
                  ...state.currentSchedule,
                  drillWeekends: [...state.currentSchedule.drillWeekends, newWeekend],
                  totalScheduledMUTAs: state.currentSchedule.totalScheduledMUTAs + weekend.mutaCount,
                  updatedAt: new Date().toISOString(),
                }
              : state.currentSchedule;

          return {
            schedules: updatedSchedules,
            currentSchedule: updatedCurrent,
          };
        });

        return id;
      },

      updateDrillWeekend: (scheduleId, weekendId, updates) => {
        set((state) => {
          const updateWeekends = (weekends: DrillWeekend[]) =>
            weekends.map((w) => (w.id === weekendId ? { ...w, ...updates } : w));

          const updatedSchedules = state.schedules.map((s) => {
            if (s.id === scheduleId) {
              return {
                ...s,
                drillWeekends: updateWeekends(s.drillWeekends),
                updatedAt: new Date().toISOString(),
              };
            }
            return s;
          });

          const updatedCurrent =
            state.currentSchedule?.id === scheduleId
              ? {
                  ...state.currentSchedule,
                  drillWeekends: updateWeekends(state.currentSchedule.drillWeekends),
                  updatedAt: new Date().toISOString(),
                }
              : state.currentSchedule;

          return {
            schedules: updatedSchedules,
            currentSchedule: updatedCurrent,
          };
        });
      },

      removeDrillWeekend: (scheduleId, weekendId) => {
        const schedule = get().schedules.find((s) => s.id === scheduleId);
        const weekend = schedule?.drillWeekends.find((w) => w.id === weekendId);

        if (!weekend) return;

        set((state) => {
          const removeWeekend = (weekends: DrillWeekend[]) =>
            weekends.filter((w) => w.id !== weekendId);

          const updatedSchedules = state.schedules.map((s) => {
            if (s.id === scheduleId) {
              return {
                ...s,
                drillWeekends: removeWeekend(s.drillWeekends),
                totalScheduledMUTAs: s.totalScheduledMUTAs - weekend.mutaCount,
                updatedAt: new Date().toISOString(),
              };
            }
            return s;
          });

          const updatedCurrent =
            state.currentSchedule?.id === scheduleId
              ? {
                  ...state.currentSchedule,
                  drillWeekends: removeWeekend(state.currentSchedule.drillWeekends),
                  totalScheduledMUTAs: state.currentSchedule.totalScheduledMUTAs - weekend.mutaCount,
                  updatedAt: new Date().toISOString(),
                }
              : state.currentSchedule;

          return {
            schedules: updatedSchedules,
            currentSchedule: updatedCurrent,
          };
        });
      },

      getDrillWeekend: (scheduleId, weekendId) => {
        const schedule = get().schedules.find((s) => s.id === scheduleId);
        return schedule?.drillWeekends.find((w) => w.id === weekendId);
      },

      // ========================================================================
      // DRILL PERIOD MANAGEMENT
      // ========================================================================

      updateDrillPeriod: (scheduleId, weekendId, periodId, status, note) => {
        set((state) => {
          const updatePeriods = (weekends: DrillWeekend[]) =>
            weekends.map((w) => {
              if (w.id === weekendId) {
                return {
                  ...w,
                  periods: w.periods.map((p) =>
                    p.id === periodId ? { ...p, status, note } : p
                  ),
                };
              }
              return w;
            });

          const updatedSchedules = state.schedules.map((s) => {
            if (s.id === scheduleId) {
              return {
                ...s,
                drillWeekends: updatePeriods(s.drillWeekends),
                updatedAt: new Date().toISOString(),
              };
            }
            return s;
          });

          const updatedCurrent =
            state.currentSchedule?.id === scheduleId
              ? {
                  ...state.currentSchedule,
                  drillWeekends: updatePeriods(state.currentSchedule.drillWeekends),
                  updatedAt: new Date().toISOString(),
                }
              : state.currentSchedule;

          return {
            schedules: updatedSchedules,
            currentSchedule: updatedCurrent,
          };
        });
      },

      markWeekendComplete: (scheduleId, weekendId) => {
        const schedule = get().schedules.find((s) => s.id === scheduleId);
        const weekend = schedule?.drillWeekends.find((w) => w.id === weekendId);

        if (!weekend) return;

        // Mark all periods as completed
        const completedPeriods = weekend.periods.map((p) => ({
          ...p,
          status: 'completed' as DrillStatus,
        }));

        get().updateDrillWeekend(scheduleId, weekendId, {
          periods: completedPeriods,
        });

        // Update schedule totals
        get().updateSchedule(scheduleId, {
          totalCompletedMUTAs:
            (schedule?.totalCompletedMUTAs || 0) + weekend.mutaCount,
        });
      },

      markWeekendPaid: (scheduleId, weekendId, amount) => {
        get().updateDrillWeekend(scheduleId, weekendId, {
          isPaid: true,
          paidDate: new Date().toISOString(),
          actualPay: amount,
        });
      },

      // ========================================================================
      // ORDERS MANAGEMENT
      // ========================================================================

      addOrders: (orders) => {
        const id = generateId();
        const now = new Date().toISOString();

        const newOrders: MilitaryOrders = {
          ...orders,
          id,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          orders: [...state.orders, newOrders],
        }));

        return id;
      },

      updateOrders: (id, updates) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id
              ? { ...o, ...updates, updatedAt: new Date().toISOString() }
              : o
          ),
        }));
      },

      deleteOrders: (id) => {
        set((state) => ({
          orders: state.orders.filter((o) => o.id !== id),
          selectedOrdersId:
            state.selectedOrdersId === id ? null : state.selectedOrdersId,
        }));
      },

      getOrders: (id) => {
        return get().orders.find((o) => o.id === id);
      },

      getActiveOrders: () => {
        const now = new Date().toISOString();
        return (
          get().orders.find(
            (o) =>
              o.status === 'active' ||
              (o.status === 'approved' && o.startDate <= now && o.endDate >= now)
          ) || null
        );
      },

      getOrdersHistory: () => {
        return [...get().orders].sort(
          (a, b) =>
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        );
      },

      // ========================================================================
      // CIVILIAN JOB
      // ========================================================================

      setCivilianJob: (job) => {
        set({ civilianJob: job });
      },

      // ========================================================================
      // PAY CALCULATIONS
      // ========================================================================

      calculateDrillPay: (input) => {
        const { payGrade, yearsOfService, mutaCount, includeBAH, bahAmount, includeBAS } = input;

        const baseDrillPay = getDrillPayPerPeriod(payGrade, yearsOfService);
        const totalBasePay = baseDrillPay * mutaCount;

        // BAH for drill weekends (prorated)
        const bahIfApplicable = includeBAH && bahAmount ? (bahAmount / 30) * 2 : 0;

        // BAS not typically paid for drill unless on orders > 30 days
        const basIfApplicable = 0;

        const grossPay = totalBasePay + bahIfApplicable + basIfApplicable;

        // Estimate taxes (drill pay is taxable)
        const estimatedTaxRate = 0.22; // Rough estimate
        const estimatedTaxes = grossPay * estimatedTaxRate;
        const estimatedNetPay = grossPay - estimatedTaxes;

        // Annual projection based on 48 MUTAs standard
        const annualMultiplier = STANDARD_ANNUAL_MUTAS / mutaCount;
        const annualProjectedGross = grossPay * annualMultiplier;
        const annualProjectedNet = estimatedNetPay * annualMultiplier;

        const breakdown: { item: string; amount: number; note?: string }[] = [
          {
            item: `Base Drill Pay (${mutaCount} periods)`,
            amount: totalBasePay,
            note: `$${baseDrillPay.toFixed(2)} per period`,
          },
        ];

        if (bahIfApplicable > 0) {
          breakdown.push({
            item: 'BAH (prorated)',
            amount: bahIfApplicable,
          });
        }

        return {
          baseDrillPay,
          totalPeriods: mutaCount,
          totalBasePay,
          bahIfApplicable,
          basIfApplicable,
          grossPay,
          estimatedTaxes,
          estimatedNetPay,
          annualProjectedGross,
          annualProjectedNet,
          breakdown,
        };
      },

      calculateATPay: (input) => {
        const {
          payGrade,
          yearsOfService,
          days,
          includeBAH,
          bahAmount,
          includeBAS,
          includePerDiem,
          perDiemRate,
        } = input;

        const dailyBasePay = getDailyRate(payGrade, yearsOfService);
        const dailyBAH = includeBAH && bahAmount ? bahAmount / 30 : 0;
        const dailyBAS = includeBAS ? (BAS_RATES_2024.enlisted || 0) / 30 : 0;
        const dailyPerDiem = includePerDiem ? perDiemRate || 0 : 0;

        const totalBasePay = dailyBasePay * days;
        const totalBAH = dailyBAH * days;
        const totalBAS = dailyBAS * days;
        const totalPerDiem = dailyPerDiem * days;
        const grossPay = totalBasePay + totalBAH + totalBAS + totalPerDiem;

        // BAH, BAS, and per diem are tax-free
        const taxableAmount = totalBasePay;
        const taxFreeAmount = totalBAH + totalBAS + totalPerDiem;

        const estimatedTaxRate = 0.22;
        const estimatedTaxes = taxableAmount * estimatedTaxRate;
        const estimatedNetPay = grossPay - estimatedTaxes;

        const breakdown = [
          { item: 'Base Pay', amount: totalBasePay, taxable: true },
          { item: 'BAH', amount: totalBAH, taxable: false },
          { item: 'BAS', amount: totalBAS, taxable: false },
          { item: 'Per Diem', amount: totalPerDiem, taxable: false },
        ].filter((b) => b.amount > 0);

        return {
          dailyBasePay,
          dailyBAH,
          dailyBAS,
          dailyPerDiem,
          totalDays: days,
          totalBasePay,
          totalBAH,
          totalBAS,
          totalPerDiem,
          grossPay,
          taxableAmount,
          taxFreeAmount,
          estimatedTaxes,
          estimatedNetPay,
          breakdown,
        };
      },

      calculateOrdersComparison: (ordersId) => {
        const orders = get().getOrders(ordersId);
        const civilianJob = get().civilianJob;

        if (!orders || !civilianJob) return null;

        // Calculate civilian pay for the same period
        let civilianDailyRate = 0;
        if (civilianJob.annualSalary) {
          civilianDailyRate = civilianJob.annualSalary / 260; // ~260 working days
        } else if (civilianJob.hourlyRate && civilianJob.hoursPerWeek) {
          civilianDailyRate = (civilianJob.hourlyRate * civilianJob.hoursPerWeek) / 5;
        }

        const civilianTotalPay = civilianDailyRate * orders.totalDays;

        // Military totals
        const militaryBasePay = orders.basePay;
        const militaryAllowances = orders.bah + orders.bas + (orders.perDiem || 0);
        const militaryTaxFreeAmount = orders.bah + orders.bas;
        const militaryTotalPay = orders.totalMilitaryPay;

        // Calculate difference
        const payDifference = militaryTotalPay - civilianTotalPay;
        const percentDifference =
          civilianTotalPay > 0
            ? ((militaryTotalPay - civilianTotalPay) / civilianTotalPay) * 100
            : 0;

        // USERRA differential calculation
        const employerDifferentialEligible =
          civilianJob.differentialPayPolicy && civilianTotalPay > militaryTotalPay;
        const employerDifferentialAmount = employerDifferentialEligible
          ? civilianTotalPay - militaryTotalPay
          : undefined;

        // Generate recommendation
        let recommendation: OrdersCivilianComparison['recommendation'] = 'neutral';
        const notes: string[] = [];

        if (payDifference > 500) {
          recommendation = 'take_orders';
          notes.push('Military pay significantly exceeds civilian income for this period.');
        } else if (payDifference < -500) {
          if (employerDifferentialEligible) {
            recommendation = 'negotiate';
            notes.push('Civilian pay exceeds military, but employer differential may help.');
          } else {
            recommendation = 'decline_orders';
            notes.push('Consider financial impact - civilian income significantly higher.');
          }
        } else {
          recommendation = 'neutral';
          notes.push('Pay difference is minimal. Consider career benefits.');
        }

        notes.push(
          `Tax-free allowances of $${militaryTaxFreeAmount.toFixed(2)} provide additional value.`
        );

        return {
          civilianDailyRate,
          civilianTotalPay,
          militaryBasePay,
          militaryAllowances,
          militaryTaxFreeAmount,
          militaryTotalPay,
          payDifference,
          percentDifference,
          employerDifferentialEligible,
          employerDifferentialAmount,
          recommendation,
          notes,
        };
      },

      // ========================================================================
      // QUERIES
      // ========================================================================

      getUpcomingDrills: (count = 5) => {
        const schedule = get().currentSchedule;
        if (!schedule) return [];

        const now = new Date().toISOString().split('T')[0];

        return schedule.drillWeekends
          .filter((w) => w.startDate >= now)
          .sort((a, b) => a.startDate.localeCompare(b.startDate))
          .slice(0, count);
      },

      getCompletedDrills: (scheduleId) => {
        const schedule = scheduleId
          ? get().getSchedule(scheduleId)
          : get().currentSchedule;

        if (!schedule) return [];

        return schedule.drillWeekends.filter((w) =>
          w.periods.every((p) => p.status === 'completed')
        );
      },

      getUnpaidDrills: (scheduleId) => {
        const schedule = scheduleId
          ? get().getSchedule(scheduleId)
          : get().currentSchedule;

        if (!schedule) return [];

        return schedule.drillWeekends.filter(
          (w) =>
            !w.isPaid && w.periods.every((p) => p.status === 'completed')
        );
      },

      getMissedDrills: (scheduleId) => {
        const schedule = scheduleId
          ? get().getSchedule(scheduleId)
          : get().currentSchedule;

        if (!schedule) return [];

        return schedule.drillWeekends.filter((w) =>
          w.periods.some((p) => p.status === 'unexcused')
        );
      },

      // ========================================================================
      // SUMMARY CALCULATIONS
      // ========================================================================

      calculateYearSummary: (scheduleId) => {
        const schedule = scheduleId
          ? get().getSchedule(scheduleId)
          : get().currentSchedule;

        if (!schedule) {
          return {
            totalMUTAs: 0,
            completedMUTAs: 0,
            remainingMUTAs: 0,
            missedMUTAs: 0,
            estimatedAnnualPay: 0,
            atDaysCompleted: 0,
            atDaysRemaining: 15,
          };
        }

        let completedMUTAs = 0;
        let missedMUTAs = 0;

        for (const weekend of schedule.drillWeekends) {
          for (const period of weekend.periods) {
            if (period.status === 'completed') {
              completedMUTAs++;
            } else if (period.status === 'unexcused') {
              missedMUTAs++;
            }
          }
        }

        const remainingMUTAs = schedule.totalScheduledMUTAs - completedMUTAs - missedMUTAs;

        // Estimate annual pay (would need pay grade from user profile)
        const estimatedAnnualPay = 0; // Placeholder

        return {
          totalMUTAs: schedule.totalScheduledMUTAs,
          completedMUTAs,
          remainingMUTAs,
          missedMUTAs,
          estimatedAnnualPay,
          atDaysCompleted: schedule.atCompleted ? schedule.atDays : 0,
          atDaysRemaining: schedule.atCompleted ? 0 : schedule.atDays,
        };
      },

      // ========================================================================
      // UTILITY
      // ========================================================================

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'reserve-storage',
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        schedules: state.schedules,
        orders: state.orders,
        civilianJob: state.civilianJob,
        currentSchedule: state.currentSchedule,
      }),
    }
  )
);

// ============================================================================
// SELECTORS
// ============================================================================

export const selectCurrentSchedule = (state: ReserveState) => state.currentSchedule;
export const selectSchedules = (state: ReserveState) => state.schedules;
export const selectOrders = (state: ReserveState) => state.orders;
export const selectCivilianJob = (state: ReserveState) => state.civilianJob;
export const selectIsLoading = (state: ReserveState) => state.isLoading;
export const selectError = (state: ReserveState) => state.error;
