/**
 * Transition Data Constants
 * VA compensation rates, retirement calculations, separation pay, checklists
 */

import { TransitionChecklistCategory } from '../types/transition';

// ============================================================================
// VA COMPENSATION RATES (2024)
// ============================================================================

/**
 * VA disability compensation rates by rating percentage
 * Rates vary by dependent status
 */
export const VA_COMPENSATION_RATES_2024 = {
  // Veteran alone (no dependents)
  single: {
    10: 171.23,
    20: 338.49,
    30: 524.31,
    40: 755.28,
    50: 1075.16,
    60: 1361.88,
    70: 1716.28,
    80: 1995.01,
    90: 2241.91,
    100: 3737.85,
  },
  // Veteran with spouse only
  withSpouse: {
    30: 586.31,
    40: 838.28,
    50: 1179.16,
    60: 1486.88,
    70: 1862.28,
    80: 2161.01,
    90: 2428.91,
    100: 3946.25,
  },
  // Veteran with spouse and one child
  withSpouseAndChild: {
    30: 633.31,
    40: 899.28,
    50: 1254.16,
    60: 1575.88,
    70: 1966.28,
    80: 2280.01,
    90: 2562.91,
    100: 4096.64,
  },
  // Additional amounts
  additionalChild: {
    30: 29,
    40: 39,
    50: 48,
    60: 58,
    70: 68,
    80: 77,
    90: 87,
    100: 97.24,
  },
  additionalChildSchool: { // 18-23 in school
    30: 94,
    40: 125,
    50: 156,
    60: 188,
    70: 219,
    80: 250,
    90: 281,
    100: 313.64,
  },
  spouseAidAttendance: 186.59, // Additional for spouse A&A
};

/**
 * VA Combined Rating Calculator
 * Uses VA "fuzzy math" - not simple addition
 */
export function calculateCombinedVARating(ratings: number[]): number {
  if (ratings.length === 0) return 0;
  if (ratings.length === 1) return ratings[0];

  // Sort ratings descending
  const sortedRatings = [...ratings].sort((a, b) => b - a);

  // Start with 100% (full efficiency)
  let combinedEfficiency = 100;

  for (const rating of sortedRatings) {
    // Each rating reduces the remaining efficiency
    combinedEfficiency = combinedEfficiency - (combinedEfficiency * rating / 100);
  }

  // The combined rating is what's been "lost"
  const combinedRating = 100 - combinedEfficiency;

  // Round to nearest 10
  return Math.round(combinedRating / 10) * 10;
}

/**
 * Get VA compensation based on rating and dependents
 */
export function getVACompensation(
  rating: number,
  hasSpouse: boolean,
  childCount: number,
  schoolAgeChildren: number = 0,
  spouseAA: boolean = false
): number {
  if (rating < 10) return 0;
  if (rating < 30) {
    // Below 30%, no dependent increases
    return VA_COMPENSATION_RATES_2024.single[rating as keyof typeof VA_COMPENSATION_RATES_2024.single] || 0;
  }

  let base = 0;

  if (hasSpouse && childCount > 0) {
    base = VA_COMPENSATION_RATES_2024.withSpouseAndChild[rating as keyof typeof VA_COMPENSATION_RATES_2024.withSpouseAndChild] || 0;
    // Add for additional children (first one included)
    if (childCount > 1) {
      const perChild = VA_COMPENSATION_RATES_2024.additionalChild[rating as keyof typeof VA_COMPENSATION_RATES_2024.additionalChild] || 0;
      base += perChild * (childCount - 1);
    }
  } else if (hasSpouse) {
    base = VA_COMPENSATION_RATES_2024.withSpouse[rating as keyof typeof VA_COMPENSATION_RATES_2024.withSpouse] || 0;
  } else {
    base = VA_COMPENSATION_RATES_2024.single[rating as keyof typeof VA_COMPENSATION_RATES_2024.single] || 0;
  }

  // Add for school-age children
  if (schoolAgeChildren > 0) {
    const perSchoolChild = VA_COMPENSATION_RATES_2024.additionalChildSchool[rating as keyof typeof VA_COMPENSATION_RATES_2024.additionalChildSchool] || 0;
    base += perSchoolChild * schoolAgeChildren;
  }

  // Add spouse aid and attendance
  if (spouseAA && rating >= 30) {
    base += VA_COMPENSATION_RATES_2024.spouseAidAttendance;
  }

  return base;
}

// ============================================================================
// RETIREMENT CALCULATIONS
// ============================================================================

/**
 * Retirement multipliers by system
 */
export const RETIREMENT_MULTIPLIERS = {
  legacy_high3: 0.025,    // 2.5% per year
  brs: 0.02,              // 2.0% per year
  redux: 0.02,            // 2.0% (with REDUX adjustment)
  final_pay: 0.025,       // 2.5% per year (final pay, not high-3)
};

/**
 * Calculate military retirement pay
 */
export function calculateRetirementPay(
  yearsOfService: number,
  highThreeBasePay: number,
  system: 'legacy_high3' | 'brs' | 'redux' | 'final_pay'
): number {
  const multiplier = RETIREMENT_MULTIPLIERS[system];
  const percentage = Math.min(yearsOfService * multiplier, 0.75); // Cap at 75%
  return highThreeBasePay * percentage;
}

/**
 * Survivor Benefit Plan costs
 */
export const SBP_RATES = {
  costPercentage: 0.065,    // 6.5% of retirement pay
  coverageOptions: [0.25, 0.50, 0.75, 1.0], // 25%, 50%, 75%, 100%
  spousePercentage: 0.55,   // Spouse receives 55% of elected amount
};

// ============================================================================
// SEPARATION PAY
// ============================================================================

/**
 * Involuntary separation pay calculation
 * Only available for involuntary separation with 6+ years
 */
export function calculateSeparationPay(
  yearsOfService: number,
  basePay: number,
  isFullSeparation: boolean = true
): { eligible: boolean; grossAmount: number; netEstimate: number } {
  // Must have 6+ years for full separation pay
  if (yearsOfService < 6) {
    return { eligible: false, grossAmount: 0, netEstimate: 0 };
  }

  // Full separation pay: 10% of annual base pay × years of service
  // Half separation pay: 5% of annual base pay × years of service
  const multiplier = isFullSeparation ? 0.10 : 0.05;
  const annualBasePay = basePay * 12;
  const grossAmount = annualBasePay * multiplier * yearsOfService;

  // Separation pay is taxable - estimate 22% federal + state
  const estimatedTaxRate = 0.25;
  const netEstimate = grossAmount * (1 - estimatedTaxRate);

  return {
    eligible: true,
    grossAmount,
    netEstimate,
  };
}

// ============================================================================
// LEAVE SELLBACK
// ============================================================================

/**
 * Calculate terminal leave and sellback value
 */
export function calculateLeaveSellback(
  leaveBalance: number,
  dailyBasePay: number,
  daysToSell: number
): { sellbackValue: number; terminalLeaveDays: number } {
  // Can sell up to 60 days of leave
  const maxSellDays = Math.min(daysToSell, 60, leaveBalance);
  const sellbackValue = maxSellDays * dailyBasePay;
  const terminalLeaveDays = leaveBalance - maxSellDays;

  return {
    sellbackValue,
    terminalLeaveDays,
  };
}

// ============================================================================
// INCOME COMPARISON HELPERS
// ============================================================================

/**
 * Calculate tax-equivalent salary
 * Military allowances (BAH, BAS) are tax-free, so civilian salary needs adjustment
 */
export function calculateTaxEquivalentSalary(
  basePay: number,
  bah: number,
  bas: number,
  taxRate: number = 0.22
): number {
  // Tax-free allowances need to be "grossed up" for comparison
  const taxFreeValue = (bah + bas) / (1 - taxRate);
  return basePay + taxFreeValue;
}

/**
 * Typical benefits values for comparison
 */
export const BENEFITS_VALUES_2024 = {
  // Military
  tricareValue: 6000,       // Annual value of TRICARE
  tricareDentalValue: 500,  // Annual dental value
  sgliValue: 300,           // SGLI annual cost equivalent
  militaryLeaveValue: 0,    // Calculated based on pay

  // Civilian averages
  healthInsuranceCost: 7500,  // Average employee + family premium
  dentalCost: 600,
  lifeInsuranceCost: 400,
  average401kMatch: 0.03,     // 3% average match
  averagePTODays: 15,
};

// ============================================================================
// GI BILL HOUSING ALLOWANCE
// ============================================================================

/**
 * GI Bill Monthly Housing Allowance
 * Equal to E-5 with dependents BAH rate for school's ZIP code
 * Only for students attending more than 50% of classes in-person
 */
export const GI_BILL_MHA_INFO = {
  minimumRate: 988.65,        // Minimum MHA (2024)
  onlineOnlyRate: 988.65,     // Online-only students get half rate
  eligibilityMonths: 36,      // Full benefits months
  bookStipend: 1000,          // Annual book stipend
};

// ============================================================================
// TRANSITION CHECKLIST
// ============================================================================

export const TRANSITION_CHECKLIST: TransitionChecklistCategory[] = [
  {
    id: '12_months',
    name: '12 Months Before',
    description: 'Early planning and preparation',
    timeline: '12 months before ETS',
    items: [
      {
        id: 'tap_registration',
        title: 'Register for TAP/TAPS',
        description: 'Transition Assistance Program is mandatory. Register early for best dates.',
        priority: 'critical',
        category: '12_months',
        completed: false,
      },
      {
        id: 'retirement_counseling',
        title: 'Schedule retirement/separation counseling',
        description: 'Meet with your installation\'s transition office.',
        priority: 'high',
        category: '12_months',
        completed: false,
      },
      {
        id: 'review_benefits',
        title: 'Review all benefits eligibility',
        description: 'Understand what you\'ll lose and gain after separation.',
        priority: 'high',
        category: '12_months',
        completed: false,
      },
      {
        id: 'start_resume',
        title: 'Start building civilian resume',
        description: 'Translate military experience to civilian terms.',
        priority: 'medium',
        category: '12_months',
        completed: false,
      },
      {
        id: 'education_plan',
        title: 'Plan for education/certifications',
        description: 'Research GI Bill, TA, and credential programs.',
        priority: 'medium',
        category: '12_months',
        completed: false,
      },
    ],
  },
  {
    id: '6_months',
    name: '6 Months Before',
    description: 'Active preparation phase',
    timeline: '6 months before ETS',
    items: [
      {
        id: 'va_claim',
        title: 'File VA disability claim (BDD)',
        description: 'Benefits Delivery at Discharge - file 180-90 days before separation.',
        priority: 'critical',
        category: '6_months',
        completed: false,
      },
      {
        id: 'medical_records',
        title: 'Gather medical records',
        description: 'Get copies of all service treatment records for VA claim.',
        priority: 'critical',
        category: '6_months',
        completed: false,
      },
      {
        id: 'job_search',
        title: 'Begin active job search',
        description: 'Apply to jobs, network, attend job fairs.',
        priority: 'high',
        category: '6_months',
        completed: false,
      },
      {
        id: 'tsp_decision',
        title: 'Decide TSP withdrawal strategy',
        description: 'Leave in place, rollover, or withdraw.',
        priority: 'high',
        category: '6_months',
        completed: false,
      },
      {
        id: 'housing_plan',
        title: 'Plan post-separation housing',
        description: 'Where will you live? Start researching.',
        priority: 'high',
        category: '6_months',
        completed: false,
      },
      {
        id: 'sgli_convert',
        title: 'Research SGLI conversion options',
        description: 'Convert to VGLI or get civilian life insurance.',
        priority: 'medium',
        category: '6_months',
        completed: false,
      },
    ],
  },
  {
    id: '3_months',
    name: '3 Months Before',
    description: 'Final preparations',
    timeline: '3 months before ETS',
    items: [
      {
        id: 'terminal_leave',
        title: 'Submit terminal leave request',
        description: 'Calculate leave balance and plan terminal leave.',
        priority: 'critical',
        category: '3_months',
        completed: false,
      },
      {
        id: 'final_physical',
        title: 'Complete separation physical',
        description: 'Document all medical conditions for VA.',
        priority: 'critical',
        category: '3_months',
        completed: false,
      },
      {
        id: 'clear_installation',
        title: 'Begin clearing installation',
        description: 'Start clearing finance, housing, unit, etc.',
        priority: 'high',
        category: '3_months',
        completed: false,
      },
      {
        id: 'healthcare_transition',
        title: 'Plan healthcare transition',
        description: 'Enroll in VA healthcare or secure civilian coverage.',
        priority: 'high',
        category: '3_months',
        completed: false,
      },
      {
        id: 'update_documents',
        title: 'Update legal documents',
        description: 'Will, POA, beneficiaries on all accounts.',
        priority: 'medium',
        category: '3_months',
        completed: false,
      },
    ],
  },
  {
    id: '1_month',
    name: '1 Month Before',
    description: 'Final actions',
    timeline: '1 month before ETS',
    items: [
      {
        id: 'dd214_review',
        title: 'Review draft DD-214',
        description: 'Ensure all information is correct before signing.',
        priority: 'critical',
        category: '1_month',
        completed: false,
      },
      {
        id: 'final_out',
        title: 'Complete final out-processing',
        description: 'All clearing complete, turn in gear.',
        priority: 'critical',
        category: '1_month',
        completed: false,
      },
      {
        id: 'id_card',
        title: 'Get new ID card (if applicable)',
        description: 'Retiree or dependent ID card.',
        priority: 'high',
        category: '1_month',
        completed: false,
      },
      {
        id: 'direct_deposit',
        title: 'Update direct deposit',
        description: 'Ensure retirement/VA payments go to correct account.',
        priority: 'high',
        category: '1_month',
        completed: false,
      },
      {
        id: 'copy_records',
        title: 'Get copies of all records',
        description: 'Personnel, medical, training records.',
        priority: 'medium',
        category: '1_month',
        completed: false,
      },
    ],
  },
  {
    id: 'post_separation',
    name: 'After Separation',
    description: 'Post-separation tasks',
    timeline: 'After ETS',
    items: [
      {
        id: 'va_healthcare_enroll',
        title: 'Enroll in VA healthcare',
        description: 'Register at local VA facility.',
        priority: 'high',
        category: 'post_separation',
        completed: false,
      },
      {
        id: 'unemployment',
        title: 'File for unemployment (if needed)',
        description: 'UCX - Unemployment Compensation for Ex-servicemembers.',
        priority: 'medium',
        category: 'post_separation',
        completed: false,
      },
      {
        id: 'gi_bill_apply',
        title: 'Apply for GI Bill (if using)',
        description: 'Apply for COE and submit to school.',
        priority: 'medium',
        category: 'post_separation',
        completed: false,
      },
      {
        id: 'voter_registration',
        title: 'Update voter registration',
        description: 'Register at new address.',
        priority: 'low',
        category: 'post_separation',
        completed: false,
      },
      {
        id: 'drivers_license',
        title: 'Update driver\'s license',
        description: 'Get civilian license in your state.',
        priority: 'low',
        category: 'post_separation',
        completed: false,
      },
    ],
  },
];

/**
 * Get checklist items by timeline
 */
export function getChecklistByTimeline(monthsBeforeETS: number): TransitionChecklistCategory[] {
  if (monthsBeforeETS >= 12) {
    return TRANSITION_CHECKLIST.filter(c => c.id === '12_months');
  }
  if (monthsBeforeETS >= 6) {
    return TRANSITION_CHECKLIST.filter(c => ['12_months', '6_months'].includes(c.id));
  }
  if (monthsBeforeETS >= 3) {
    return TRANSITION_CHECKLIST.filter(c => ['12_months', '6_months', '3_months'].includes(c.id));
  }
  if (monthsBeforeETS >= 1) {
    return TRANSITION_CHECKLIST.filter(c => c.id !== 'post_separation');
  }
  return TRANSITION_CHECKLIST;
}

// ============================================================================
// CRDP vs CRSC COMPARISON
// ============================================================================

/**
 * Concurrent Retirement & Disability Pay (CRDP)
 * For retirees with 50%+ VA rating
 */
export function calculateCRDP(
  retirementPay: number,
  vaRating: number
): { eligible: boolean; amount: number; description: string } {
  if (vaRating < 50) {
    return {
      eligible: false,
      amount: 0,
      description: 'CRDP requires 50%+ VA rating',
    };
  }

  // CRDP phases out VA offset over 10 years (2004-2014)
  // Now fully phased in - no VA offset for 50%+ rating
  return {
    eligible: true,
    amount: retirementPay, // Full retirement pay (no VA offset)
    description: 'Full retirement pay with no VA offset',
  };
}

/**
 * Combat-Related Special Compensation (CRSC)
 * For combat-related disabilities
 */
export function calculateCRSC(
  retirementPay: number,
  vaCompensation: number,
  combatRelatedRating: number
): { eligible: boolean; amount: number; description: string } {
  if (combatRelatedRating < 10) {
    return {
      eligible: false,
      amount: 0,
      description: 'CRSC requires combat-related disability',
    };
  }

  // CRSC pays the lesser of:
  // 1. Full VA compensation for combat-related disabilities
  // 2. Longevity portion of retirement pay
  const crscAmount = Math.min(vaCompensation, retirementPay);

  return {
    eligible: true,
    amount: crscAmount,
    description: 'Tax-free CRSC payment',
  };
}
