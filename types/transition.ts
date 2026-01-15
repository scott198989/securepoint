/**
 * Transition Types
 * Types for military separation, retirement, and transition planning
 */

import { PayGrade, MilitaryBranch } from './user';

// ============================================================================
// SEPARATION TYPES
// ============================================================================

/**
 * Type of military separation
 */
export type SeparationType =
  | 'ets'                    // End of Term of Service (normal end of contract)
  | 'retirement'             // 20+ years retirement
  | 'medical_retirement'     // Medical retirement
  | 'medical_separation'     // Medical separation (less than 20 years)
  | 'voluntary_separation'   // Voluntary early separation
  | 'involuntary_separation' // Involuntary separation
  | 'disability_retirement'; // Disability retirement

/**
 * Retirement system type
 */
export type RetirementSystem =
  | 'legacy_high3'           // High-3 (pre-2018)
  | 'brs'                    // Blended Retirement System
  | 'redux'                  // REDUX (rare)
  | 'final_pay';             // Final Pay (very rare, pre-1980)

/**
 * Separation status
 */
export type SeparationStatus =
  | 'planning'               // Early planning stage
  | 'terminal_leave'         // On terminal leave
  | 'separated'              // Officially separated
  | 'retired';               // Retired status

// ============================================================================
// TRANSITION INFO
// ============================================================================

/**
 * Main transition information
 */
export interface TransitionInfo {
  id: string;

  // Status
  separationType: SeparationType;
  status: SeparationStatus;
  retirementSystem?: RetirementSystem;

  // Key dates
  etsDate: string;                    // End of contract date
  terminalLeaveStartDate?: string;    // When terminal leave begins
  lastDayOfWork?: string;             // Last day actually working
  officialSeparationDate?: string;    // DD-214 separation date

  // Leave balance
  leaveBalance: number;               // Days of leave accrued
  sellLeaveOption: 'take' | 'sell' | 'mixed';
  sellLeaveDays?: number;             // Days to sell if mixed

  // Service details
  totalYearsOfService: number;
  totalMonthsOfService: number;
  activeYears: number;
  reserveYears?: number;

  // Financial planning
  estimatedFinalPay?: number;
  hasSeparationPay: boolean;
  separationPayAmount?: number;

  // VA Claims
  vaClaimsFiled: boolean;
  vaClaimsStatus?: VAClaimStatus;
  estimatedVARating?: number;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// VA DISABILITY TYPES
// ============================================================================

/**
 * VA claim status
 */
export type VAClaimStatus =
  | 'not_filed'
  | 'gathering_evidence'
  | 'submitted'
  | 'under_review'
  | 'decision_pending'
  | 'awarded'
  | 'denied'
  | 'appealing';

/**
 * Individual VA disability claim
 */
export interface VADisabilityClaim {
  id: string;
  condition: string;
  claimedRating: number;              // What you claimed (0-100)
  awardedRating?: number;             // What was awarded
  serviceConnected: boolean;
  status: VAClaimStatus;
  filedDate?: string;
  decisionDate?: string;
  notes?: string;
}

/**
 * VA disability benefits summary
 */
export interface VADisabilityBenefits {
  // Combined rating
  combinedRating: number;             // 0-100 (VA math)
  individualRatings: VADisabilityClaim[];

  // Monthly compensation
  monthlyCompensation: number;
  hasDependent: boolean;
  dependentCount: number;
  hasSpouse: boolean;
  spouseAidAndAttendance: boolean;

  // Special monthly compensation
  smcEligible: boolean;
  smcLevel?: string;
  smcAmount?: number;

  // Other benefits
  chapter35Eligible: boolean;         // Dependents education
  champvaEligible: boolean;           // Healthcare for dependents
  propertyTaxExemption: boolean;

  // Concurrent receipt
  crdpEligible: boolean;              // Concurrent Retirement & Disability Pay
  crscEligible: boolean;              // Combat-Related Special Compensation
  selectedOption?: 'crdp' | 'crsc';
}

// ============================================================================
// RETIREMENT TYPES
// ============================================================================

/**
 * Military retirement calculation inputs
 */
export interface RetirementInput {
  payGrade: PayGrade;
  yearsOfService: number;
  highThreeBasePay: number;           // Average of highest 36 months
  retirementSystem: RetirementSystem;

  // BRS specific
  tspBalance?: number;
  continuationPayReceived?: boolean;
  continuationPayAmount?: number;

  // Disability
  vaRating?: number;
  combatRelated?: boolean;
}

/**
 * Retirement calculation result
 */
export interface RetirementResult {
  // Base retirement
  multiplier: number;                 // Years * 2.5% (or 2% for BRS)
  grossMonthlyRetirement: number;

  // Adjustments
  vaWaiver?: number;                  // Amount waived for VA
  crdpAmount?: number;
  crscAmount?: number;

  // Final amounts
  netMonthlyRetirement: number;
  annualRetirement: number;

  // Survivor Benefit Plan
  sbpCost?: number;
  sbpCoverage?: number;

  // Tax info
  taxableAmount: number;
  taxFreeAmount: number;              // VA compensation is tax-free
}

// ============================================================================
// TSP TYPES
// ============================================================================

/**
 * TSP account summary
 */
export interface TSPSummary {
  // Balances
  traditionalBalance: number;
  rothBalance: number;
  totalBalance: number;

  // Contribution rates
  traditionalContributionPercent: number;
  rothContributionPercent: number;
  totalContributionPercent: number;

  // BRS matching
  brsMatchEarned: number;
  brsMatchVested: boolean;            // Vests at 2 years
  vestingPercent: number;

  // Funds allocation
  fundsAllocation: TSPFundAllocation[];

  // Loans
  hasLoan: boolean;
  loanBalance?: number;
  loanPaymentMonthly?: number;
}

/**
 * TSP fund allocation
 */
export interface TSPFundAllocation {
  fund: 'G' | 'F' | 'C' | 'S' | 'I' | 'L2025' | 'L2030' | 'L2035' | 'L2040' | 'L2045' | 'L2050' | 'L2055' | 'L2060' | 'L2065' | 'LIncome';
  percentage: number;
  balance: number;
}

/**
 * TSP withdrawal options
 */
export type TSPWithdrawalOption =
  | 'leave_in_place'                  // Keep in TSP
  | 'partial_withdrawal'              // Take some out
  | 'full_withdrawal'                 // Take it all
  | 'rollover_ira'                    // Roll to IRA
  | 'rollover_401k'                   // Roll to new employer 401k
  | 'annuity';                        // TSP annuity

// ============================================================================
// INCOME COMPARISON
// ============================================================================

/**
 * Military to civilian income comparison
 */
export interface IncomeComparison {
  // Current military
  militaryBasePay: number;
  militaryAllowances: number;         // BAH + BAS (tax-free)
  militarySpecialPays: number;
  militaryTotal: number;
  militaryTaxableEquivalent: number;  // Adjusted for tax-free allowances

  // Expected civilian
  civilianSalary: number;
  expectedBenefitsValue: number;      // Healthcare, 401k match, etc.
  civilianTotal: number;

  // Post-separation income
  retirementPay?: number;
  vaCompensation?: number;
  giMHABenefit?: number;              // GI Bill housing allowance
  postSeparationTotal: number;

  // Analysis
  incomeDifference: number;           // Civilian - Military
  breakEvenSalary: number;            // Minimum salary to match military
  recommendedMinimum: number;         // Salary to maintain lifestyle
}

/**
 * Benefits value comparison
 */
export interface BenefitsComparison {
  // Military benefits
  militaryHealthcare: number;         // TRICARE value
  militaryDental: number;
  militaryLifeInsurance: number;      // SGLI value
  militaryRetirement: number;         // Annual contribution value
  militaryLeave: number;              // 30 days value
  militaryTotal: number;

  // Typical civilian benefits
  civilianHealthcare: number;
  civilianDental: number;
  civilianLifeInsurance: number;
  civilian401kMatch: number;
  civilianPTO: number;
  civilianTotal: number;

  // Gap analysis
  benefitsGap: number;
}

// ============================================================================
// TRANSITION CHECKLIST
// ============================================================================

/**
 * Transition checklist category
 */
export interface TransitionChecklistCategory {
  id: string;
  name: string;
  description: string;
  timeline: string;                   // e.g., "12 months before"
  items: TransitionChecklistItem[];
}

/**
 * Individual checklist item
 */
export interface TransitionChecklistItem {
  id: string;
  title: string;
  description: string;
  deadline?: string;                  // Relative or absolute
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  completed: boolean;
  completedAt?: string;
  resources?: string[];               // Links or references
  notes?: string;
}

// ============================================================================
// STORE TYPES
// ============================================================================

/**
 * Transition store state
 */
export interface TransitionStoreState {
  // Transition info
  transitionInfo: TransitionInfo | null;

  // VA benefits
  vaDisability: VADisabilityBenefits | null;

  // TSP
  tspSummary: TSPSummary | null;

  // Calculations
  retirementResult: RetirementResult | null;
  incomeComparison: IncomeComparison | null;

  // Checklist
  checklistItems: TransitionChecklistItem[];

  // UI
  isLoading: boolean;
  error: string | null;
}

/**
 * Transition store actions
 */
export interface TransitionStoreActions {
  // Transition info
  setTransitionInfo: (info: Partial<TransitionInfo>) => void;
  updateSeparationType: (type: SeparationType) => void;
  updateDates: (dates: Partial<Pick<TransitionInfo, 'etsDate' | 'terminalLeaveStartDate' | 'lastDayOfWork'>>) => void;

  // VA disability
  addVAClaim: (claim: Omit<VADisabilityClaim, 'id'>) => string;
  updateVAClaim: (id: string, updates: Partial<VADisabilityClaim>) => void;
  removeVAClaim: (id: string) => void;
  calculateCombinedRating: () => number;
  calculateVACompensation: () => number;

  // TSP
  setTSPSummary: (summary: Partial<TSPSummary>) => void;
  updateFundsAllocation: (allocation: TSPFundAllocation[]) => void;

  // Calculations
  calculateRetirement: (input: RetirementInput) => RetirementResult;
  calculateIncomeComparison: (civilianSalary: number) => IncomeComparison;
  calculateTerminalLeave: () => { days: number; value: number };

  // Checklist
  loadDefaultChecklist: () => void;
  toggleChecklistItem: (itemId: string) => void;
  addChecklistItem: (item: Omit<TransitionChecklistItem, 'id' | 'completed'>) => void;
  removeChecklistItem: (itemId: string) => void;

  // Queries
  getDaysUntilETS: () => number;
  getDaysUntilTerminalLeave: () => number;
  getTransitionProgress: () => number;
  getChecklistProgress: () => { completed: number; total: number; percent: number };

  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Transition summary for dashboard
 */
export interface TransitionSummary {
  separationType: SeparationType;
  daysUntilETS: number;
  daysUntilTerminalLeave?: number;
  estimatedRetirementPay?: number;
  estimatedVACompensation?: number;
  checklistProgress: number;
  nextMilestone?: {
    name: string;
    daysUntil: number;
  };
}

/**
 * Terminal leave calculation
 */
export interface TerminalLeaveCalc {
  leaveBalance: number;
  terminalLeaveStartDate: string;
  lastDayOfWork: string;
  officialSeparationDate: string;
  leaveSellbackDays: number;
  leaveSellbackValue: number;
  effectiveSeparationDate: string;
}

/**
 * Separation pay calculation
 */
export interface SeparationPayCalc {
  eligible: boolean;
  yearsOfService: number;
  basePay: number;
  multiplier: number;
  grossAmount: number;
  federalTaxWithholding: number;
  stateTaxWithholding: number;
  netAmount: number;
  paymentType: 'lump_sum' | 'installments';
}
