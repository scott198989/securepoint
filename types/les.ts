/**
 * Leave and Earnings Statement (LES) Types
 * Comprehensive type definitions for military pay statements
 */

import { PayGrade, MilitaryBranch } from './user';

// ============================================================================
// LES LINE ITEM CATEGORIES
// ============================================================================

/**
 * Entitlement types that appear on an LES
 * These are the "pay" items - money coming in
 */
export type EntitlementType =
  // Base Pay
  | 'base_pay'
  | 'base_pay_accrued'

  // Allowances
  | 'bah' // Basic Allowance for Housing
  | 'bah_diff' // BAH Differential
  | 'bah_partial' // Partial BAH (barracks)
  | 'bas' // Basic Allowance for Subsistence
  | 'oha' // Overseas Housing Allowance
  | 'cola' // Cost of Living Allowance
  | 'fsa' // Family Separation Allowance
  | 'clothing_allowance'
  | 'dislocation_allowance' // DLA
  | 'temporary_lodging_expense' // TLE
  | 'move_in_housing_allowance' // MIHA

  // Special/Incentive Pay
  | 'hostile_fire_pay' // HFP
  | 'imminent_danger_pay' // IDP
  | 'hardship_duty_pay_location' // HDP-L
  | 'hardship_duty_pay_mission' // HDP-M
  | 'assignment_incentive_pay' // AIP
  | 'special_duty_assignment_pay' // SDAP
  | 'career_sea_pay'
  | 'career_sea_pay_premium'
  | 'submarine_duty_pay'
  | 'flight_pay'
  | 'flight_deck_pay'
  | 'demolition_pay'
  | 'parachute_duty_pay' // Jump pay
  | 'diving_duty_pay'
  | 'foreign_language_proficiency_pay' // FLPP
  | 'hazardous_duty_incentive_pay'

  // Bonuses
  | 'enlistment_bonus'
  | 'reenlistment_bonus'
  | 'selective_reenlistment_bonus' // SRB
  | 'retention_bonus'
  | 'critical_skills_retention_bonus'
  | 'special_pay_bonus'

  // Combat Zone
  | 'combat_zone_tax_exclusion' // Not actual pay but affects taxes

  // Miscellaneous
  | 'per_diem'
  | 'travel_pay'
  | 'advance_pay'
  | 'leave_sold' // Selling back leave
  | 'back_pay' // Retroactive pay
  | 'other_entitlement';

/**
 * Deduction types that appear on an LES
 * These are taken from your pay
 */
export type DeductionType =
  // Taxes
  | 'federal_tax'
  | 'state_tax'
  | 'local_tax'
  | 'fica_social_security'
  | 'fica_medicare'

  // Insurance
  | 'sgli' // Servicemembers Group Life Insurance
  | 'sgli_family' // Family SGLI
  | 'tricare_dental'
  | 'tricare_vision'
  | 'fsgli' // Family SGLI

  // Retirement
  | 'tsp_traditional' // Thrift Savings Plan traditional
  | 'tsp_roth' // TSP Roth
  | 'tsp_loan_repayment'
  | 'sbp' // Survivor Benefit Plan

  // Debt/Recovery
  | 'advance_pay_debt'
  | 'dpp' // Defense Finance debt
  | 'overpayment_recovery'
  | 'government_debt'
  | 'uniform_initial_issue'

  // Voluntary
  | 'aer_donation' // Army Emergency Relief
  | 'afaf_donation' // Air Force Assistance Fund
  | 'navy_relief_donation'
  | 'cfc_donation' // Combined Federal Campaign
  | 'savings_bond'

  // Miscellaneous
  | 'meal_deduction' // For those on meal plan
  | 'garnishment' // Court-ordered
  | 'child_support'
  | 'alimony'
  | 'car_payment' // Car allotment
  | 'other_deduction';

/**
 * Allotment types - voluntary recurring payments
 */
export type AllotmentType =
  | 'savings' // To bank account
  | 'car_payment'
  | 'insurance_premium'
  | 'loan_payment'
  | 'child_support_voluntary'
  | 'spousal_support'
  | 'rent_payment'
  | 'charity'
  | 'other_allotment';

// ============================================================================
// LES LINE ITEM STRUCTURES
// ============================================================================

/**
 * Individual entitlement line item
 */
export interface LESEntitlement {
  id: string;
  type: EntitlementType;
  description: string; // As shown on LES
  amount: number; // Current period amount
  ytdAmount?: number; // Year-to-date amount
  isTaxable: boolean;
  isTaxFree?: boolean; // For combat zone exclusions
  startDate?: string; // When this entitlement started
  endDate?: string; // When it will end (if known)
  note?: string; // User note
}

/**
 * Individual deduction line item
 */
export interface LESDeduction {
  id: string;
  type: DeductionType;
  description: string;
  amount: number; // Current period amount
  ytdAmount?: number;
  isMandatory: boolean; // vs voluntary
  isPreTax?: boolean; // For TSP traditional, etc.
  startDate?: string;
  endDate?: string;
  note?: string;
}

/**
 * Individual allotment line item
 */
export interface LESAllotment {
  id: string;
  type: AllotmentType;
  description: string;
  amount: number;
  recipientName?: string; // Who receives it
  accountLast4?: string; // Last 4 of account
  startDate?: string;
  endDate?: string;
  note?: string;
}

// ============================================================================
// LEAVE TRACKING
// ============================================================================

/**
 * Leave type categories
 */
export type LeaveType =
  | 'annual' // Regular leave (2.5 days/month)
  | 'sick'
  | 'emergency'
  | 'convalescent'
  | 'terminal' // Before ETS/retirement
  | 'ptdy' // Permissive TDY
  | 'special' // Adoption, paternity, etc.
  | 'house_hunting'; // PCS-related

/**
 * Leave balance information from LES
 */
export interface LeaveBalance {
  type: LeaveType;
  earned: number; // Days earned this fiscal year
  used: number; // Days used this fiscal year
  balance: number; // Current balance
  lostIfNotUsed: number; // Use or lose (over 60/90 days)
  eosBalance?: number; // End of service projected balance
  sellBackEligible?: number; // Days eligible to sell
}

// ============================================================================
// COMPLETE LES ENTRY
// ============================================================================

/**
 * Pay period type
 */
export type PayPeriodType = 'mid_month' | 'end_month';

/**
 * Complete LES entry for a single pay period
 */
export interface LESEntry {
  id: string;

  // Period Information
  payPeriod: {
    type: PayPeriodType;
    startDate: string; // ISO date
    endDate: string;
    payDate: string; // Actual pay date (1st or 15th)
    month: number; // 1-12
    year: number;
  };

  // Service Member Info (snapshot at time of LES)
  serviceMember: {
    name?: string;
    payGrade: PayGrade;
    yearsOfService: number;
    branch: MilitaryBranch;
    dutyStation?: string;
    basd?: string; // Basic Active Service Date
  };

  // Pay Items
  entitlements: LESEntitlement[];
  deductions: LESDeduction[];
  allotments: LESAllotment[];

  // Leave Information
  leave: LeaveBalance[];

  // Summary Totals
  totals: {
    grossPay: number; // All entitlements
    totalDeductions: number;
    totalAllotments: number;
    netPay: number; // What you actually get
    ytdGross?: number;
    ytdDeductions?: number;
    ytdNet?: number;
  };

  // Metadata
  entryMethod: 'manual' | 'ocr' | 'import';
  source?: string; // 'myPay', 'paper', etc.
  createdAt: string;
  updatedAt: string;
  notes?: string;

  // Validation
  isVerified: boolean; // User confirmed accuracy
  calculatedNetPay?: number; // Our calculation to compare
  variance?: number; // Difference between actual and calculated
}

// ============================================================================
// LES COMPARISON & ANALYSIS
// ============================================================================

/**
 * Change tracking between two LES periods
 */
export interface LESChange {
  category: 'entitlement' | 'deduction' | 'allotment' | 'leave';
  type: string; // The specific type that changed
  description: string;
  changeType: 'added' | 'removed' | 'increased' | 'decreased';
  previousAmount: number;
  currentAmount: number;
  difference: number;
  percentChange: number;
  possibleReason?: string; // Auto-generated explanation
}

/**
 * Comparison between two LES entries
 */
export interface LESComparison {
  id: string;
  previousEntry: LESEntry;
  currentEntry: LESEntry;
  changes: LESChange[];
  summary: {
    totalChanges: number;
    netPayDifference: number;
    netPayPercentChange: number;
    significantChanges: LESChange[]; // Changes over $50 or 5%
  };
  createdAt: string;
}

/**
 * LES trend analysis over multiple periods
 */
export interface LESTrend {
  metric: 'gross_pay' | 'net_pay' | 'total_deductions' | 'specific_item';
  specificItemType?: EntitlementType | DeductionType;
  dataPoints: Array<{
    period: string; // "2024-01", "2024-02", etc.
    value: number;
  }>;
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  averageValue: number;
  minValue: number;
  maxValue: number;
}

// ============================================================================
// LES STORE STATE
// ============================================================================

/**
 * State for LES store
 */
export interface LESStoreState {
  // Data
  entries: LESEntry[];
  comparisons: LESComparison[];

  // UI State
  currentEntryId: string | null;
  selectedEntriesForCompare: [string, string] | null;
  isLoading: boolean;
  error: string | null;

  // Filters
  filterYear?: number;
  filterMonth?: number;
}

/**
 * Actions for LES store
 */
export interface LESStoreActions {
  // Entry Management
  addEntry: (entry: Omit<LESEntry, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateEntry: (id: string, updates: Partial<LESEntry>) => void;
  deleteEntry: (id: string) => void;
  getEntry: (id: string) => LESEntry | undefined;

  // Comparison
  compareEntries: (previousId: string, currentId: string) => LESComparison;
  getLatestComparison: () => LESComparison | null;

  // Queries
  getEntriesByYear: (year: number) => LESEntry[];
  getLatestEntry: () => LESEntry | null;
  getEntryByPeriod: (year: number, month: number, type: PayPeriodType) => LESEntry | null;

  // Analysis
  calculateTrend: (metric: string, months: number) => LESTrend | null;

  // UI State
  setCurrentEntry: (id: string | null) => void;
  setCompareEntries: (ids: [string, string] | null) => void;
  setFilter: (year?: number, month?: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Persistence
  reset: () => void;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Common LES line items for quick entry
 */
export interface CommonLESItem {
  type: EntitlementType | DeductionType;
  label: string;
  category: 'entitlement' | 'deduction';
  isTaxable?: boolean;
  isMandatory?: boolean;
  description: string;
}

/**
 * LES validation result
 */
export interface LESValidationResult {
  isValid: boolean;
  calculatedGross: number;
  calculatedDeductions: number;
  calculatedNet: number;
  actualNet: number;
  variance: number;
  variancePercent: number;
  warnings: string[];
  errors: string[];
}

/**
 * Export format for LES data
 */
export type LESExportFormat = 'json' | 'csv' | 'pdf';
