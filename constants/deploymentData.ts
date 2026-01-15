/**
 * Deployment Data Constants
 * Combat zones, pay rates, and expense adjustment profiles
 */

import { CombatZone, DeploymentExpenseAdjustment } from '../types/deployment';

// ============================================================================
// COMBAT ZONES & HAZARDOUS AREAS
// ============================================================================

/**
 * Currently designated combat zones and hazardous duty areas
 * Note: These designations can change - users should verify with their finance office
 */
export const COMBAT_ZONES: CombatZone[] = [
  // Middle East
  {
    id: 'afghanistan',
    name: 'Afghanistan',
    region: 'Middle East/Central Asia',
    countries: ['AF'],
    hfpEligible: true,
    idpEligible: true,
    czteEligible: true,
    effectiveDate: '2001-09-19',
  },
  {
    id: 'arabian_peninsula',
    name: 'Arabian Peninsula Areas',
    region: 'Middle East',
    countries: ['BH', 'IQ', 'KW', 'OM', 'QA', 'SA', 'AE', 'YE'],
    hfpEligible: true,
    idpEligible: true,
    czteEligible: true,
    effectiveDate: '1991-01-17',
  },
  {
    id: 'syria',
    name: 'Syria',
    region: 'Middle East',
    countries: ['SY'],
    hfpEligible: true,
    idpEligible: true,
    czteEligible: true,
    effectiveDate: '2015-01-01',
  },
  {
    id: 'jordan',
    name: 'Jordan',
    region: 'Middle East',
    countries: ['JO'],
    hfpEligible: true,
    idpEligible: true,
    czteEligible: true,
    effectiveDate: '2003-03-19',
  },

  // Africa
  {
    id: 'somalia',
    name: 'Somalia',
    region: 'Africa',
    countries: ['SO'],
    hfpEligible: true,
    idpEligible: true,
    czteEligible: true,
    effectiveDate: '2002-01-01',
  },
  {
    id: 'libya',
    name: 'Libya',
    region: 'Africa',
    countries: ['LY'],
    hfpEligible: true,
    idpEligible: true,
    czteEligible: true,
    effectiveDate: '2011-03-19',
  },
  {
    id: 'niger',
    name: 'Niger',
    region: 'Africa',
    countries: ['NE'],
    hfpEligible: true,
    idpEligible: true,
    czteEligible: false,
    effectiveDate: '2018-01-01',
  },
  {
    id: 'djibouti',
    name: 'Djibouti',
    region: 'Africa',
    countries: ['DJ'],
    hfpEligible: true,
    idpEligible: true,
    czteEligible: false,
    hardshipRate: 100,
    effectiveDate: '2002-01-01',
  },

  // Other regions
  {
    id: 'philippines_south',
    name: 'Southern Philippines',
    region: 'Asia Pacific',
    countries: ['PH'],
    hfpEligible: true,
    idpEligible: true,
    czteEligible: false,
    effectiveDate: '2002-01-01',
  },
];

/**
 * Get combat zone by ID
 */
export function getCombatZoneById(id: string): CombatZone | undefined {
  return COMBAT_ZONES.find((zone) => zone.id === id);
}

/**
 * Get combat zones by region
 */
export function getCombatZonesByRegion(region: string): CombatZone[] {
  return COMBAT_ZONES.filter((zone) => zone.region === region);
}

// ============================================================================
// DEPLOYMENT PAY RATES (2024)
// ============================================================================

export const DEPLOYMENT_PAY_RATES = {
  // Hostile Fire Pay / Imminent Danger Pay
  hostileFirePay: 225,
  imminentDangerPay: 225, // Same amount, only one is paid

  // Family Separation Allowance
  familySeparationAllowance: 250,
  fsaRequiredDays: 30, // Must be separated 30+ days

  // Hardship Duty Pay - Location (HDP-L)
  hardshipDutyPay: {
    tier1: 50,
    tier2: 100,
    tier3: 150,
  },

  // Savings Deposit Program
  savingsDepositProgram: {
    maxDeposit: 10000,
    interestRate: 0.10, // 10% annual
    minDeploymentDays: 30,
    eligibleAreas: ['combat_zone', 'hazardous_duty'],
  },

  // Per Diem rates (continental US average, actual varies by location)
  perDiem: {
    conus: 157,        // Continental US
    oconus: 200,       // Outside CONUS average
    maxLodging: 107,   // CONUS average
    mie: 59,           // Meals & Incidental Expenses
  },
};

// ============================================================================
// COMBAT ZONE TAX EXCLUSION
// ============================================================================

export const CZTE_INFO = {
  // Enlisted and Warrant Officers: All pay is tax-free
  enlistedExclusion: 'unlimited',

  // Officer cap (changes annually with E-9 pay)
  // 2024 enlisted cap based on highest E-9 pay + HFP/IDP
  officerMonthlyCap2024: 10472.70, // E-9 over 26 years + HFP

  // Tax-free items in combat zone
  taxFreeItems: [
    'Base pay (up to cap for officers)',
    'Hostile Fire Pay / Imminent Danger Pay',
    'Hardship Duty Pay',
    'Hazardous Duty Pay',
    'Bonus payments (re-enlistment, etc.)',
    'Accrued leave payments',
  ],

  // Always tax-free (not affected by CZTE)
  alwaysTaxFree: [
    'BAH (Basic Allowance for Housing)',
    'BAS (Basic Allowance for Subsistence)',
    'OHA (Overseas Housing Allowance)',
    'COLA (Cost of Living Allowance)',
  ],

  // Additional benefits
  additionalBenefits: [
    'Extended tax filing deadline',
    'Forgiveness of tax deadline penalties',
    'IRA contribution deadline extension',
    'Student loan interest exclusion',
  ],
};

// ============================================================================
// EXPENSE ADJUSTMENT PROFILES
// ============================================================================

/**
 * Default expense adjustments during deployment
 * These are suggestions - users can customize
 */
export const DEFAULT_EXPENSE_ADJUSTMENTS: Omit<DeploymentExpenseAdjustment, 'normalBudget' | 'deploymentBudget'>[] = [
  // Eliminate - typically zero during deployment
  {
    categoryId: 'dining_out',
    categoryName: 'Dining Out',
    adjustmentType: 'eliminate',
    reason: 'Meals provided on deployment',
  },
  {
    categoryId: 'entertainment',
    categoryName: 'Entertainment',
    adjustmentType: 'eliminate',
    reason: 'Limited entertainment options available',
  },
  {
    categoryId: 'streaming',
    categoryName: 'Streaming Services',
    adjustmentType: 'reduce',
    reason: 'Consider pausing some subscriptions',
  },
  {
    categoryId: 'gym',
    categoryName: 'Gym Membership',
    adjustmentType: 'eliminate',
    reason: 'Base gym facilities available',
  },
  {
    categoryId: 'personal_care',
    categoryName: 'Haircuts/Personal Care',
    adjustmentType: 'eliminate',
    reason: 'Base services typically free',
  },
  {
    categoryId: 'fuel',
    categoryName: 'Gas/Fuel',
    adjustmentType: 'eliminate',
    reason: 'Vehicle not in use during deployment',
  },
  {
    categoryId: 'car_wash',
    categoryName: 'Car Wash',
    adjustmentType: 'eliminate',
    reason: 'Vehicle stored during deployment',
  },

  // Reduce - lower but not eliminated
  {
    categoryId: 'groceries',
    categoryName: 'Groceries',
    adjustmentType: 'reduce',
    reason: 'Family-only groceries (if applicable)',
  },
  {
    categoryId: 'clothing',
    categoryName: 'Clothing',
    adjustmentType: 'reduce',
    reason: 'Minimal civilian clothing needs',
  },
  {
    categoryId: 'phone',
    categoryName: 'Phone',
    adjustmentType: 'reduce',
    reason: 'Consider international plan or WiFi calling',
  },

  // No change - essential expenses continue
  {
    categoryId: 'rent',
    categoryName: 'Rent/Mortgage',
    adjustmentType: 'no_change',
    reason: 'Housing expenses continue',
  },
  {
    categoryId: 'utilities',
    categoryName: 'Utilities',
    adjustmentType: 'reduce',
    reason: 'May be lower with fewer occupants',
  },
  {
    categoryId: 'car_insurance',
    categoryName: 'Car Insurance',
    adjustmentType: 'reduce',
    reason: 'Contact insurer for deployment discount',
  },
  {
    categoryId: 'car_payment',
    categoryName: 'Car Payment',
    adjustmentType: 'no_change',
    reason: 'Payment continues during deployment',
  },
  {
    categoryId: 'health_insurance',
    categoryName: 'Health Insurance',
    adjustmentType: 'no_change',
    reason: 'TRICARE continues',
  },
  {
    categoryId: 'life_insurance',
    categoryName: 'Life Insurance (SGLI)',
    adjustmentType: 'no_change',
    reason: 'Essential protection continues',
  },
  {
    categoryId: 'child_care',
    categoryName: 'Child Care',
    adjustmentType: 'no_change',
    reason: 'May need to continue for family',
  },

  // Increase - deployment-specific expenses
  {
    categoryId: 'shipping',
    categoryName: 'Care Packages/Shipping',
    adjustmentType: 'increase',
    reason: 'Sending/receiving care packages',
  },
  {
    categoryId: 'communication',
    categoryName: 'Communication (Calls/Video)',
    adjustmentType: 'increase',
    reason: 'International calling or data plans',
  },
];

// ============================================================================
// SAVINGS MILESTONES
// ============================================================================

/**
 * Default savings milestones for deployment
 */
export const DEFAULT_SAVINGS_MILESTONES = [
  {
    name: 'First Month Complete',
    targetAmount: 0, // Calculated based on monthly projection
    multiplier: 1,
  },
  {
    name: 'Emergency Fund Topped Up',
    targetAmount: 0, // User-defined emergency fund target
    multiplier: null,
  },
  {
    name: 'Quarter Complete',
    targetAmount: 0,
    multiplier: 3,
  },
  {
    name: 'Halfway There',
    targetAmount: 0,
    multiplier: null, // 50% of total goal
  },
  {
    name: '75% Complete',
    targetAmount: 0,
    multiplier: null,
  },
  {
    name: 'Deployment Goal Achieved',
    targetAmount: 0, // User-defined goal
    multiplier: null,
  },
];

// ============================================================================
// PRE-DEPLOYMENT CHECKLIST
// ============================================================================

export const PRE_DEPLOYMENT_CHECKLIST = [
  {
    category: 'Financial',
    items: [
      {
        id: 'power_of_attorney',
        title: 'Set up Power of Attorney',
        description: 'Authorize someone to handle financial matters',
        priority: 'high',
      },
      {
        id: 'allotments',
        title: 'Set up allotments',
        description: 'Automatic transfers to savings or family',
        priority: 'high',
      },
      {
        id: 'bills_autopay',
        title: 'Set up autopay for bills',
        description: 'Ensure bills are paid automatically',
        priority: 'high',
      },
      {
        id: 'suspend_subscriptions',
        title: 'Pause unnecessary subscriptions',
        description: 'Streaming, gym memberships, etc.',
        priority: 'medium',
      },
      {
        id: 'car_insurance',
        title: 'Contact car insurance',
        description: 'Ask about deployment storage discount',
        priority: 'medium',
      },
      {
        id: 'tsp_increase',
        title: 'Consider increasing TSP',
        description: 'Tax-free contributions in combat zone',
        priority: 'medium',
      },
      {
        id: 'sdp_enrollment',
        title: 'Enroll in Savings Deposit Program',
        description: 'Earn 10% on up to $10,000',
        priority: 'medium',
      },
      {
        id: 'update_beneficiaries',
        title: 'Update beneficiaries',
        description: 'SGLI, TSP, bank accounts',
        priority: 'high',
      },
    ],
  },
  {
    category: 'Legal',
    items: [
      {
        id: 'will',
        title: 'Create or update will',
        description: 'JAG office can assist',
        priority: 'high',
      },
      {
        id: 'emergency_contacts',
        title: 'Update emergency contacts',
        description: 'DD Form 93 and unit records',
        priority: 'high',
      },
    ],
  },
  {
    category: 'Family',
    items: [
      {
        id: 'family_care_plan',
        title: 'Complete Family Care Plan',
        description: 'Required for single parents/dual military',
        priority: 'high',
      },
      {
        id: 'family_budget',
        title: 'Create family budget',
        description: 'Set monthly allowance and expectations',
        priority: 'high',
      },
      {
        id: 'emergency_fund',
        title: 'Ensure emergency fund access',
        description: 'Family should have access to emergency funds',
        priority: 'high',
      },
    ],
  },
];

// ============================================================================
// DEPLOYMENT DURATION ESTIMATES
// ============================================================================

export const TYPICAL_DEPLOYMENT_DURATIONS = {
  army: {
    combat: { min: 9, max: 12, typical: 9 },
    rotation: { min: 9, max: 12, typical: 9 },
    training: { min: 1, max: 3, typical: 1 },
  },
  navy: {
    carrier: { min: 6, max: 10, typical: 7 },
    submarine: { min: 3, max: 6, typical: 3 },
    surface: { min: 6, max: 9, typical: 7 },
  },
  air_force: {
    combat: { min: 4, max: 6, typical: 4 },
    rotation: { min: 4, max: 6, typical: 6 },
  },
  marine_corps: {
    combat: { min: 6, max: 9, typical: 7 },
    meu: { min: 6, max: 7, typical: 6 },
  },
  coast_guard: {
    cutter: { min: 2, max: 4, typical: 3 },
    patrol: { min: 1, max: 2, typical: 2 },
  },
  space_force: {
    deployment: { min: 4, max: 6, typical: 4 },
  },
};

// ============================================================================
// CONNECTIVITY TIPS
// ============================================================================

export const CONNECTIVITY_TIPS = {
  limited: [
    'Download offline content before leaving (Netflix, Spotify, podcasts)',
    'Set up WiFi calling if available at your location',
    'Schedule video calls during high-bandwidth times',
    'Use text-based communication when possible',
  ],
  minimal: [
    'Use satellite WiFi hotspots when available',
    'Send emails with small attachments only',
    'Use messaging apps that work with low bandwidth',
    'Set expectations with family about communication frequency',
  ],
  none: [
    'Use satellite phone for emergencies',
    'Rely on MWR phone/internet facilities',
    'Set up regular mail communication',
    'Pre-record video messages when you have access',
  ],
};
