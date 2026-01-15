/**
 * Deployment Types
 * Types for tracking deployment status, pay adjustments, and family finances
 */

// ============================================================================
// DEPLOYMENT STATUS TYPES
// ============================================================================

/**
 * Current phase of deployment
 */
export type DeploymentPhase =
  | 'pre_deployment'      // 30-90 days before departure
  | 'deployment'          // Currently deployed
  | 'redeployment'        // Coming home (usually 30 days)
  | 'post_deployment'     // First 90 days home
  | 'not_deployed';       // Normal status

/**
 * Type of military deployment/operation
 */
export type DeploymentType =
  | 'combat'              // Combat zone deployment
  | 'contingency'         // Contingency operation
  | 'peacekeeping'        // Peacekeeping mission
  | 'humanitarian'        // Humanitarian mission
  | 'training'            // Extended training deployment
  | 'tdy'                 // Temporary Duty
  | 'sea_duty'            // Navy/Coast Guard sea deployment
  | 'other';

/**
 * Combat Zone Tax Exclusion status
 */
export type CZTEStatus =
  | 'full'                // Full CZTE (enlisted, WO)
  | 'capped'              // Officer cap applies
  | 'none';               // Not in combat zone

// ============================================================================
// DEPLOYMENT LOCATION TYPES
// ============================================================================

/**
 * Designated combat/hostile fire zones
 */
export interface CombatZone {
  id: string;
  name: string;
  region: string;
  countries: string[];
  hfpEligible: boolean;           // Hostile Fire Pay eligible
  idpEligible: boolean;           // Imminent Danger Pay eligible
  czteEligible: boolean;          // Combat Zone Tax Exclusion eligible
  hardshipRate?: number;          // HDP-L rate if applicable
  effectiveDate: string;          // When zone was designated
  endDate?: string;               // If zone designation ended
}

/**
 * Deployment location information
 */
export interface DeploymentLocation {
  combatZoneId?: string;
  countryCode: string;
  locationName: string;
  baseOrCamp?: string;
  isHazardous: boolean;
  isRemote: boolean;
  connectivityLevel: 'good' | 'limited' | 'minimal' | 'none';
}

// ============================================================================
// DEPLOYMENT INFO
// ============================================================================

/**
 * Main deployment information
 */
export interface DeploymentInfo {
  id: string;

  // Status
  isActive: boolean;
  phase: DeploymentPhase;
  type: DeploymentType;

  // Dates
  notificationDate?: string;      // When notified of deployment
  departureDate: string;          // When leaving
  expectedReturnDate: string;     // Expected return
  actualReturnDate?: string;      // Actual return (when complete)

  // Location
  location: DeploymentLocation;
  combatZone?: CombatZone;

  // Pay adjustments
  payAdjustments: DeploymentPayAdjustments;

  // Family
  familyBudgetEnabled: boolean;
  familyContactInfo?: FamilyContact;

  // Savings
  savingsGoalAmount?: number;     // Target savings during deployment

  // Metadata
  orderNumber?: string;
  unitName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Family contact for deployment
 */
export interface FamilyContact {
  name: string;
  relationship: string;
  phone?: string;
  email?: string;
  hasPowerOfAttorney: boolean;
  canAccessAccounts: boolean;
}

// ============================================================================
// PAY ADJUSTMENTS
// ============================================================================

/**
 * Pay adjustments during deployment
 */
export interface DeploymentPayAdjustments {
  // Combat/Hazard pays
  hostileFirePay: boolean;        // $225/month
  imminentDangerPay: boolean;     // $225/month (same as HFP, not both)
  hardshipDutyPay: boolean;       // $50-$150/month
  hardshipDutyRate?: number;

  // Separation pay
  familySeparationAllowance: boolean;  // $250/month after 30 days

  // Tax benefits
  combatZoneTaxExclusion: boolean;
  czteStatus: CZTEStatus;

  // Allowances
  bahContinuation: boolean;       // BAH continues during deployment
  oha?: number;                   // Overseas Housing Allowance if applicable
  colaRate?: number;              // COLA rate if applicable
  perDiemRate?: number;           // Per diem if on TDY

  // Save the Date save pay
  savingsDepositProgram: boolean; // SDP - up to $10k at 10% interest
  sdpAmount?: number;

  // Calculated totals
  additionalMonthlyPay: number;
  estimatedTaxSavings: number;
}

// ============================================================================
// DEPLOYMENT BUDGET
// ============================================================================

/**
 * Expense category adjustments during deployment
 */
export interface DeploymentExpenseAdjustment {
  categoryId: string;
  categoryName: string;
  normalBudget: number;
  deploymentBudget: number;
  adjustmentType: 'reduce' | 'eliminate' | 'increase' | 'no_change';
  reason?: string;
}

/**
 * Budget profiles for deployment
 */
export interface DeploymentBudget {
  id: string;
  deploymentId: string;

  // Pre-deployment snapshot
  normalMonthlyExpenses: number;
  normalMonthlySavings: number;

  // Deployment adjustments
  expenseAdjustments: DeploymentExpenseAdjustment[];
  deploymentMonthlyExpenses: number;

  // Family budget (if separate)
  familyBudget?: {
    monthlyAllowance: number;
    categories: {
      categoryId: string;
      budgetAmount: number;
    }[];
    emergencyFundTarget: number;
  };

  // Projected savings
  projectedMonthlySavings: number;
  projectedTotalSavings: number;  // Over deployment duration

  // Savings allocation
  savingsAllocation?: {
    emergencyFund: number;
    debtPayoff: number;
    investments: number;
    savingsGoals: number;
    tsp: number;
  };

  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// DEPLOYMENT SAVINGS TRACKER
// ============================================================================

/**
 * Track savings progress during deployment
 */
export interface DeploymentSavingsTracker {
  deploymentId: string;

  // Goals
  savingsGoal: number;

  // Progress
  currentSavings: number;
  progressPercent: number;

  // Monthly tracking
  monthlySnapshots: DeploymentSavingsSnapshot[];

  // Milestones
  milestones: SavingsMilestone[];

  // Projections
  projectedEndTotal: number;
  onTrack: boolean;
  daysRemaining: number;
}

/**
 * Monthly savings snapshot
 */
export interface DeploymentSavingsSnapshot {
  month: string;                  // YYYY-MM format
  startBalance: number;
  endBalance: number;
  militaryIncome: number;
  deploymentBonusPay: number;     // HFP, FSA, etc.
  taxSavings: number;
  totalExpenses: number;
  netSavings: number;
  cumulativeSavings: number;
}

/**
 * Savings milestone
 */
export interface SavingsMilestone {
  id: string;
  name: string;
  targetAmount: number;
  achievedAt?: string;
  isAchieved: boolean;
}

// ============================================================================
// DEPLOYMENT COUNTDOWN
// ============================================================================

/**
 * Countdown information
 */
export interface DeploymentCountdown {
  deploymentId: string;

  // Current phase
  phase: DeploymentPhase;

  // Days counts
  totalDays: number;              // Total deployment length
  daysComplete: number;
  daysRemaining: number;
  percentComplete: number;

  // Key dates
  departureDate: string;
  midtourDate?: string;
  expectedReturnDate: string;

  // Milestones
  upcomingMilestones: CountdownMilestone[];

  // Stats
  monthsDeployed: number;
  weekendsRemaining: number;
}

/**
 * Countdown milestone
 */
export interface CountdownMilestone {
  id: string;
  name: string;
  date: string;
  daysUntil: number;
  type: 'personal' | 'military' | 'holiday' | 'financial';
  icon?: string;
}

// ============================================================================
// OFFLINE SYNC
// ============================================================================

/**
 * Offline transaction queue for deployment
 */
export interface OfflineQueueItem {
  id: string;
  type: 'transaction' | 'budget_update' | 'goal_update';
  data: Record<string, unknown>;
  createdAt: string;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
  lastAttempt?: string;
  error?: string;
}

/**
 * Offline sync state
 */
export interface OfflineSyncState {
  isOnline: boolean;
  lastSyncAt?: string;
  pendingItems: number;
  failedItems: number;
  queue: OfflineQueueItem[];
}

// ============================================================================
// STORE TYPES
// ============================================================================

/**
 * Deployment store state
 */
export interface DeploymentStoreState {
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
}

/**
 * Deployment store actions
 */
export interface DeploymentStoreActions {
  // Deployment lifecycle
  startDeployment: (info: Omit<DeploymentInfo, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateDeployment: (id: string, updates: Partial<DeploymentInfo>) => void;
  endDeployment: (id: string, actualReturnDate: string) => void;

  // Phase management
  updatePhase: (phase: DeploymentPhase) => void;

  // Budget
  createDeploymentBudget: (normalExpenses: number, normalSavings: number) => void;
  updateExpenseAdjustment: (categoryId: string, deploymentBudget: number) => void;
  setFamilyBudget: (monthlyAllowance: number) => void;

  // Savings
  updateSavingsGoal: (amount: number) => void;
  recordSavingsSnapshot: (snapshot: Omit<DeploymentSavingsSnapshot, 'cumulativeSavings'>) => void;
  checkMilestone: (milestoneId: string) => void;

  // Pay adjustments
  updatePayAdjustments: (adjustments: Partial<DeploymentPayAdjustments>) => void;
  calculateAdditionalPay: () => number;
  calculateTaxSavings: (monthlyTaxable: number) => number;

  // Countdown
  getCountdown: () => DeploymentCountdown | null;
  addCountdownMilestone: (milestone: Omit<CountdownMilestone, 'daysUntil'>) => void;

  // Offline sync
  addToOfflineQueue: (item: Omit<OfflineQueueItem, 'id' | 'createdAt' | 'syncStatus' | 'retryCount'>) => void;
  processOfflineQueue: () => Promise<void>;
  setOnlineStatus: (isOnline: boolean) => void;

  // Queries
  isDeployed: () => boolean;
  getDeploymentDuration: () => number;
  getProjectedSavings: () => number;

  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Deployment summary for dashboard
 */
export interface DeploymentSummary {
  isDeployed: boolean;
  phase: DeploymentPhase;
  daysRemaining: number;
  percentComplete: number;
  additionalMonthlyPay: number;
  projectedSavings: number;
  savingsProgress: number;
  nextMilestone?: CountdownMilestone;
}

/**
 * Deployment notification
 */
export interface DeploymentAlert {
  id: string;
  type: 'pay_missing' | 'savings_milestone' | 'bill_reminder' | 'countdown' | 'sync_needed';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  isRead: boolean;
  actionUrl?: string;
}
