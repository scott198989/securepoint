/**
 * Guard/Reserve Types
 * Types for drill schedules, orders, and reserve-specific calculations
 */

import { PayGrade, MilitaryBranch } from './user';

// ============================================================================
// DRILL TYPES
// ============================================================================

/**
 * MUTA (Multiple Unit Training Assembly) count
 * Standard drill weekend = MUTA 4 (4 drill periods)
 */
export type MUTACount = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/**
 * Drill status for a specific day/period
 */
export type DrillStatus =
  | 'scheduled'      // Upcoming drill
  | 'completed'      // Attended
  | 'excused'        // Excused absence
  | 'unexcused'      // Unexcused absence (U-day)
  | 'rescheduled'    // Moved to different date
  | 'cancelled';     // Cancelled by unit

/**
 * Type of training event
 */
export type TrainingEventType =
  | 'regular_drill'     // Standard IDT (Inactive Duty Training)
  | 'additional_drill'  // AFTP/RMP (Additional Flying Training Period / Readiness Management Period)
  | 'annual_training'   // AT (typically 15 days)
  | 'active_duty'       // ADOS/ADT orders
  | 'school'            // Military school/training
  | 'mobilization'      // Deployment
  | 'funeral_honors'    // Funeral detail
  | 'other';

/**
 * Single drill period
 */
export interface DrillPeriod {
  id: string;
  date: string; // ISO date
  periodNumber: number; // 1-4 for standard weekend (Sat AM, Sat PM, Sun AM, Sun PM)
  status: DrillStatus;
  note?: string;
}

/**
 * A drill weekend or training event
 */
export interface DrillWeekend {
  id: string;
  eventType: TrainingEventType;
  title: string; // e.g., "November Drill", "Annual Training"
  startDate: string; // ISO date
  endDate: string;
  mutaCount: MUTACount;
  periods: DrillPeriod[];
  location?: string;
  notes?: string;
  // Pay info
  estimatedPay?: number;
  actualPay?: number;
  isPaid: boolean;
  paidDate?: string;
}

/**
 * Annual drill schedule
 */
export interface DrillSchedule {
  id: string;
  fiscalYear: number; // FY starts Oct 1
  branch: MilitaryBranch;
  unitName?: string;
  drillWeekends: DrillWeekend[];
  // Summary
  totalScheduledMUTAs: number;
  totalCompletedMUTAs: number;
  totalExcused: number;
  totalUnexcused: number;
  // Annual Training
  atDays: number;
  atCompleted: boolean;
  atStartDate?: string;
  atEndDate?: string;
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// ORDERS TYPES
// ============================================================================

/**
 * Type of military orders
 */
export type OrdersType =
  | 'idt'           // Inactive Duty Training (regular drill)
  | 'at'            // Annual Training
  | 'adt'           // Active Duty Training
  | 'ados'          // Active Duty Operational Support
  | 'ado'           // Active Duty Other
  | 'mobilization'  // Title 10 mobilization
  | 'title_32'      // Title 32 (state orders)
  | 'ftngd'         // Full-Time National Guard Duty
  | 'agr'           // Active Guard Reserve
  | 'other';

/**
 * Orders status
 */
export type OrdersStatus =
  | 'pending'       // Awaiting approval
  | 'approved'      // Approved, not started
  | 'active'        // Currently on orders
  | 'completed'     // Finished
  | 'cancelled'     // Cancelled
  | 'amended';      // Modified

/**
 * Military orders document
 */
export interface MilitaryOrders {
  id: string;
  ordersNumber?: string; // Official orders number
  ordersType: OrdersType;
  status: OrdersStatus;

  // Dates
  startDate: string;
  endDate: string;
  reportDate?: string;

  // Duration
  totalDays: number;

  // Location
  dutyLocation: string;
  homeOfRecord?: string;

  // Pay & Allowances
  payGrade: PayGrade;
  basePay: number;
  bah: number;
  bas: number;
  perDiem?: number;
  travelPay?: number;
  specialPays: Array<{
    type: string;
    amount: number;
  }>;

  // Totals
  totalMilitaryPay: number;
  estimatedTaxes: number;
  estimatedNetPay: number;

  // Comparison with civilian
  civilianComparison?: OrdersCivilianComparison;

  // Metadata
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Comparison between military orders pay and civilian pay
 */
export interface OrdersCivilianComparison {
  // Civilian income during same period
  civilianDailyRate: number;
  civilianTotalPay: number;
  civilianBenefitsValue?: number; // Health insurance, PTO, etc.

  // Military totals
  militaryBasePay: number;
  militaryAllowances: number;
  militaryTaxFreeAmount: number;
  militaryTotalPay: number;

  // Net comparison
  payDifference: number; // Positive = military pays more
  percentDifference: number;

  // USERRA considerations
  employerDifferentialEligible: boolean;
  employerDifferentialAmount?: number;

  // Analysis
  recommendation: 'take_orders' | 'decline_orders' | 'negotiate' | 'neutral';
  notes: string[];
}

// ============================================================================
// DRILL PAY CALCULATION
// ============================================================================

/**
 * Drill pay calculation input
 */
export interface DrillPayInput {
  payGrade: PayGrade;
  yearsOfService: number;
  mutaCount: MUTACount;
  includeBAH?: boolean;
  bahAmount?: number;
  includeBAS?: boolean;
}

/**
 * Drill pay calculation result
 */
export interface DrillPayResult {
  // Per period
  baseDrillPay: number; // 1/30 of monthly base pay

  // For this drill
  totalPeriods: number;
  totalBasePay: number;
  bahIfApplicable: number;
  basIfApplicable: number;
  grossPay: number;

  // Estimates
  estimatedTaxes: number;
  estimatedNetPay: number;

  // Annual projection (48 MUTAs standard)
  annualProjectedGross: number;
  annualProjectedNet: number;

  // Breakdown
  breakdown: {
    item: string;
    amount: number;
    note?: string;
  }[];
}

/**
 * Annual Training pay calculation input
 */
export interface ATPayInput {
  payGrade: PayGrade;
  yearsOfService: number;
  days: number; // Typically 15
  location?: string; // For BAH rate
  includeBAH?: boolean;
  bahAmount?: number;
  includeBAS?: boolean;
  includePerDiem?: boolean;
  perDiemRate?: number;
}

/**
 * Annual Training pay calculation result
 */
export interface ATPayResult {
  // Daily rates
  dailyBasePay: number;
  dailyBAH: number;
  dailyBAS: number;
  dailyPerDiem: number;

  // Totals
  totalDays: number;
  totalBasePay: number;
  totalBAH: number;
  totalBAS: number;
  totalPerDiem: number;
  grossPay: number;

  // Tax estimates
  taxableAmount: number;
  taxFreeAmount: number;
  estimatedTaxes: number;
  estimatedNetPay: number;

  // Breakdown
  breakdown: {
    item: string;
    amount: number;
    taxable: boolean;
  }[];
}

// ============================================================================
// STORE TYPES
// ============================================================================

/**
 * Reserve store state
 */
export interface ReserveStoreState {
  // Current schedule
  currentSchedule: DrillSchedule | null;

  // Orders history
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

  // UI state
  isLoading: boolean;
  error: string | null;
}

/**
 * Reserve store actions
 */
export interface ReserveStoreActions {
  // Schedule management
  setSchedule: (schedule: DrillSchedule) => void;
  createNewSchedule: (fiscalYear: number, branch: MilitaryBranch) => string;
  addDrillWeekend: (weekend: Omit<DrillWeekend, 'id'>) => void;
  updateDrillWeekend: (id: string, updates: Partial<DrillWeekend>) => void;
  removeDrillWeekend: (id: string) => void;
  updateDrillPeriod: (weekendId: string, periodId: string, status: DrillStatus) => void;

  // Orders management
  addOrders: (orders: Omit<MilitaryOrders, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateOrders: (id: string, updates: Partial<MilitaryOrders>) => void;
  deleteOrders: (id: string) => void;
  getOrders: (id: string) => MilitaryOrders | undefined;

  // Civilian job
  setCivilianJob: (job: ReserveStoreState['civilianJob']) => void;

  // Queries
  getUpcomingDrills: (count?: number) => DrillWeekend[];
  getCompletedDrills: (fiscalYear?: number) => DrillWeekend[];
  getActiveOrders: () => MilitaryOrders | null;

  // Calculations
  calculateYearlyDrillSummary: () => {
    totalMUTAs: number;
    completedMUTAs: number;
    remainingMUTAs: number;
    estimatedAnnualPay: number;
  };

  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Fiscal year info
 */
export interface FiscalYear {
  fy: number;
  startDate: string; // Oct 1 of previous calendar year
  endDate: string;   // Sep 30 of FY year
}

/**
 * Get fiscal year from date
 */
export function getFiscalYear(date: Date = new Date()): FiscalYear {
  const month = date.getMonth();
  const year = date.getFullYear();

  // FY starts Oct 1
  const fy = month >= 9 ? year + 1 : year;

  return {
    fy,
    startDate: `${fy - 1}-10-01`,
    endDate: `${fy}-09-30`,
  };
}

/**
 * Standard drill weekends per year (12 weekends x 4 MUTAs = 48)
 */
export const STANDARD_ANNUAL_MUTAS = 48;

/**
 * Standard Annual Training days
 */
export const STANDARD_AT_DAYS = 15;
