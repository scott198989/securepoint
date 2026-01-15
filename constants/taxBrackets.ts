/**
 * Tax Brackets and Rates
 * Federal and state tax information for military pay calculations
 */

// ============================================================================
// FEDERAL TAX BRACKETS
// ============================================================================

export interface TaxBracket {
  min: number; // Minimum income for this bracket
  max: number; // Maximum income for this bracket (Infinity for top bracket)
  rate: number; // Tax rate as decimal (0.22 = 22%)
  baseTax: number; // Cumulative tax from lower brackets
}

export interface FederalTaxYear {
  year: number;
  single: TaxBracket[];
  marriedFilingJointly: TaxBracket[];
  marriedFilingSeparately: TaxBracket[];
  headOfHousehold: TaxBracket[];
  standardDeduction: {
    single: number;
    marriedFilingJointly: number;
    marriedFilingSeparately: number;
    headOfHousehold: number;
  };
}

/**
 * 2024 Federal Tax Brackets
 * Source: IRS Revenue Procedure 2023-34
 */
export const FEDERAL_TAX_2024: FederalTaxYear = {
  year: 2024,
  single: [
    { min: 0, max: 11600, rate: 0.10, baseTax: 0 },
    { min: 11600, max: 47150, rate: 0.12, baseTax: 1160 },
    { min: 47150, max: 100525, rate: 0.22, baseTax: 5426 },
    { min: 100525, max: 191950, rate: 0.24, baseTax: 17168.50 },
    { min: 191950, max: 243725, rate: 0.32, baseTax: 39110.50 },
    { min: 243725, max: 609350, rate: 0.35, baseTax: 55678.50 },
    { min: 609350, max: Infinity, rate: 0.37, baseTax: 183647.25 }
  ],
  marriedFilingJointly: [
    { min: 0, max: 23200, rate: 0.10, baseTax: 0 },
    { min: 23200, max: 94300, rate: 0.12, baseTax: 2320 },
    { min: 94300, max: 201050, rate: 0.22, baseTax: 10852 },
    { min: 201050, max: 383900, rate: 0.24, baseTax: 34337 },
    { min: 383900, max: 487450, rate: 0.32, baseTax: 78221 },
    { min: 487450, max: 731200, rate: 0.35, baseTax: 111357 },
    { min: 731200, max: Infinity, rate: 0.37, baseTax: 196669.50 }
  ],
  marriedFilingSeparately: [
    { min: 0, max: 11600, rate: 0.10, baseTax: 0 },
    { min: 11600, max: 47150, rate: 0.12, baseTax: 1160 },
    { min: 47150, max: 100525, rate: 0.22, baseTax: 5426 },
    { min: 100525, max: 191950, rate: 0.24, baseTax: 17168.50 },
    { min: 191950, max: 243725, rate: 0.32, baseTax: 39110.50 },
    { min: 243725, max: 365600, rate: 0.35, baseTax: 55678.50 },
    { min: 365600, max: Infinity, rate: 0.37, baseTax: 98334.75 }
  ],
  headOfHousehold: [
    { min: 0, max: 16550, rate: 0.10, baseTax: 0 },
    { min: 16550, max: 63100, rate: 0.12, baseTax: 1655 },
    { min: 63100, max: 100500, rate: 0.22, baseTax: 7241 },
    { min: 100500, max: 191950, rate: 0.24, baseTax: 15469 },
    { min: 191950, max: 243700, rate: 0.32, baseTax: 37417 },
    { min: 243700, max: 609350, rate: 0.35, baseTax: 53977 },
    { min: 609350, max: Infinity, rate: 0.37, baseTax: 181954.50 }
  ],
  standardDeduction: {
    single: 14600,
    marriedFilingJointly: 29200,
    marriedFilingSeparately: 14600,
    headOfHousehold: 21900
  }
};

/**
 * 2025 Federal Tax Brackets (Projected/Estimated)
 * Note: These are estimates based on typical inflation adjustments
 */
export const FEDERAL_TAX_2025: FederalTaxYear = {
  year: 2025,
  single: [
    { min: 0, max: 11925, rate: 0.10, baseTax: 0 },
    { min: 11925, max: 48475, rate: 0.12, baseTax: 1192.50 },
    { min: 48475, max: 103350, rate: 0.22, baseTax: 5578.50 },
    { min: 103350, max: 197300, rate: 0.24, baseTax: 17651 },
    { min: 197300, max: 250525, rate: 0.32, baseTax: 40199 },
    { min: 250525, max: 626350, rate: 0.35, baseTax: 57231 },
    { min: 626350, max: Infinity, rate: 0.37, baseTax: 188769.75 }
  ],
  marriedFilingJointly: [
    { min: 0, max: 23850, rate: 0.10, baseTax: 0 },
    { min: 23850, max: 96950, rate: 0.12, baseTax: 2385 },
    { min: 96950, max: 206700, rate: 0.22, baseTax: 11157 },
    { min: 206700, max: 394600, rate: 0.24, baseTax: 35302 },
    { min: 394600, max: 501050, rate: 0.32, baseTax: 80398 },
    { min: 501050, max: 751600, rate: 0.35, baseTax: 114462 },
    { min: 751600, max: Infinity, rate: 0.37, baseTax: 202154.50 }
  ],
  marriedFilingSeparately: [
    { min: 0, max: 11925, rate: 0.10, baseTax: 0 },
    { min: 11925, max: 48475, rate: 0.12, baseTax: 1192.50 },
    { min: 48475, max: 103350, rate: 0.22, baseTax: 5578.50 },
    { min: 103350, max: 197300, rate: 0.24, baseTax: 17651 },
    { min: 197300, max: 250525, rate: 0.32, baseTax: 40199 },
    { min: 250525, max: 375800, rate: 0.35, baseTax: 57231 },
    { min: 375800, max: Infinity, rate: 0.37, baseTax: 101077.25 }
  ],
  headOfHousehold: [
    { min: 0, max: 17000, rate: 0.10, baseTax: 0 },
    { min: 17000, max: 64850, rate: 0.12, baseTax: 1700 },
    { min: 64850, max: 103350, rate: 0.22, baseTax: 7442 },
    { min: 103350, max: 197300, rate: 0.24, baseTax: 15912 },
    { min: 197300, max: 250500, rate: 0.32, baseTax: 38460 },
    { min: 250500, max: 626350, rate: 0.35, baseTax: 55484 },
    { min: 626350, max: Infinity, rate: 0.37, baseTax: 187031.50 }
  ],
  standardDeduction: {
    single: 15000,
    marriedFilingJointly: 30000,
    marriedFilingSeparately: 15000,
    headOfHousehold: 22500
  }
};

// ============================================================================
// FICA RATES
// ============================================================================

export interface FICARates {
  year: number;
  socialSecurity: {
    rate: number; // Employee rate
    wageLimit: number; // Maximum taxable wages
  };
  medicare: {
    rate: number; // Standard rate
    additionalRate: number; // Additional Medicare Tax
    additionalThreshold: {
      single: number;
      marriedFilingJointly: number;
      marriedFilingSeparately: number;
    };
  };
}

export const FICA_RATES_2024: FICARates = {
  year: 2024,
  socialSecurity: {
    rate: 0.062, // 6.2%
    wageLimit: 168600
  },
  medicare: {
    rate: 0.0145, // 1.45%
    additionalRate: 0.009, // Additional 0.9% for high earners
    additionalThreshold: {
      single: 200000,
      marriedFilingJointly: 250000,
      marriedFilingSeparately: 125000
    }
  }
};

export const FICA_RATES_2025: FICARates = {
  year: 2025,
  socialSecurity: {
    rate: 0.062,
    wageLimit: 176100 // Projected
  },
  medicare: {
    rate: 0.0145,
    additionalRate: 0.009,
    additionalThreshold: {
      single: 200000,
      marriedFilingJointly: 250000,
      marriedFilingSeparately: 125000
    }
  }
};

// ============================================================================
// STATE TAX INFORMATION
// ============================================================================

export type TaxFilingStatus = 'single' | 'marriedFilingJointly' | 'marriedFilingSeparately' | 'headOfHousehold';

export interface StateTaxInfo {
  name: string;
  abbreviation: string;
  hasIncomeTax: boolean;
  flatRate?: number; // If flat tax state
  brackets?: TaxBracket[]; // If graduated brackets
  standardDeduction?: number; // Some states have this
  militaryPayExempt: boolean; // Some states exempt military pay
  retiredMilitaryExempt: boolean; // Retired military pay exemption
  notes?: string;
}

/**
 * States with no income tax - military members often maintain residence here
 */
export const NO_INCOME_TAX_STATES = [
  'AK', // Alaska
  'FL', // Florida
  'NV', // Nevada
  'NH', // New Hampshire (dividends/interest only)
  'SD', // South Dakota
  'TN', // Tennessee (dividends/interest only until 2021, now fully exempt)
  'TX', // Texas
  'WA', // Washington
  'WY'  // Wyoming
] as const;

/**
 * Simplified state tax data for estimation
 * Note: Many states have complex brackets - this is for estimation only
 */
export const STATE_TAX_INFO: Record<string, StateTaxInfo> = {
  AL: {
    name: 'Alabama',
    abbreviation: 'AL',
    hasIncomeTax: true,
    flatRate: 0.05, // Simplified - actually graduated 2-5%
    militaryPayExempt: false,
    retiredMilitaryExempt: true,
    notes: 'Retired military pay exempt'
  },
  AK: {
    name: 'Alaska',
    abbreviation: 'AK',
    hasIncomeTax: false,
    militaryPayExempt: true,
    retiredMilitaryExempt: true
  },
  AZ: {
    name: 'Arizona',
    abbreviation: 'AZ',
    hasIncomeTax: true,
    flatRate: 0.025, // Flat rate as of 2023
    militaryPayExempt: false,
    retiredMilitaryExempt: false,
    notes: 'Flat 2.5% rate'
  },
  AR: {
    name: 'Arkansas',
    abbreviation: 'AR',
    hasIncomeTax: true,
    flatRate: 0.044, // Simplified
    militaryPayExempt: false,
    retiredMilitaryExempt: true,
    notes: 'Retired military pay exempt up to $6,000'
  },
  CA: {
    name: 'California',
    abbreviation: 'CA',
    hasIncomeTax: true,
    flatRate: 0.0725, // Simplified - actually 1-13.3%
    militaryPayExempt: false,
    retiredMilitaryExempt: false,
    notes: 'High tax state with 13.3% top bracket'
  },
  CO: {
    name: 'Colorado',
    abbreviation: 'CO',
    hasIncomeTax: true,
    flatRate: 0.044,
    militaryPayExempt: false,
    retiredMilitaryExempt: true,
    notes: 'Retired military can exclude up to $24,000'
  },
  CT: {
    name: 'Connecticut',
    abbreviation: 'CT',
    hasIncomeTax: true,
    flatRate: 0.055, // Simplified
    militaryPayExempt: false,
    retiredMilitaryExempt: true,
    notes: '100% military retirement exempt'
  },
  DE: {
    name: 'Delaware',
    abbreviation: 'DE',
    hasIncomeTax: true,
    flatRate: 0.055, // Simplified
    militaryPayExempt: false,
    retiredMilitaryExempt: true,
    notes: 'Up to $12,500 military pension exempt'
  },
  FL: {
    name: 'Florida',
    abbreviation: 'FL',
    hasIncomeTax: false,
    militaryPayExempt: true,
    retiredMilitaryExempt: true
  },
  GA: {
    name: 'Georgia',
    abbreviation: 'GA',
    hasIncomeTax: true,
    flatRate: 0.0549, // Moving to flat rate
    militaryPayExempt: false,
    retiredMilitaryExempt: true,
    notes: 'Military retirement exempt up to $35,000 (65+) or $17,500 (under 65)'
  },
  HI: {
    name: 'Hawaii',
    abbreviation: 'HI',
    hasIncomeTax: true,
    flatRate: 0.0725, // Simplified
    militaryPayExempt: false,
    retiredMilitaryExempt: true,
    notes: 'All military pension income exempt'
  },
  ID: {
    name: 'Idaho',
    abbreviation: 'ID',
    hasIncomeTax: true,
    flatRate: 0.058,
    militaryPayExempt: false,
    retiredMilitaryExempt: true,
    notes: 'Retired military pay partially exempt'
  },
  IL: {
    name: 'Illinois',
    abbreviation: 'IL',
    hasIncomeTax: true,
    flatRate: 0.0495,
    militaryPayExempt: false,
    retiredMilitaryExempt: true,
    notes: 'All retirement income exempt'
  },
  IN: {
    name: 'Indiana',
    abbreviation: 'IN',
    hasIncomeTax: true,
    flatRate: 0.0305, // Plus county tax
    militaryPayExempt: false,
    retiredMilitaryExempt: true,
    notes: 'Military retirement exempt'
  },
  IA: {
    name: 'Iowa',
    abbreviation: 'IA',
    hasIncomeTax: true,
    flatRate: 0.0385, // Moving to flat
    militaryPayExempt: false,
    retiredMilitaryExempt: true,
    notes: 'Military retirement exempt'
  },
  KS: {
    name: 'Kansas',
    abbreviation: 'KS',
    hasIncomeTax: true,
    flatRate: 0.057,
    militaryPayExempt: false,
    retiredMilitaryExempt: true,
    notes: 'Military retirement exempt'
  },
  KY: {
    name: 'Kentucky',
    abbreviation: 'KY',
    hasIncomeTax: true,
    flatRate: 0.04,
    militaryPayExempt: false,
    retiredMilitaryExempt: true,
    notes: 'Military retirement exempt up to $31,110'
  },
  LA: {
    name: 'Louisiana',
    abbreviation: 'LA',
    hasIncomeTax: true,
    flatRate: 0.0425, // Simplified
    militaryPayExempt: false,
    retiredMilitaryExempt: true,
    notes: 'Military retirement exempt'
  },
  ME: {
    name: 'Maine',
    abbreviation: 'ME',
    hasIncomeTax: true,
    flatRate: 0.0715, // Simplified
    militaryPayExempt: false,
    retiredMilitaryExempt: true,
    notes: 'Military pension exempt up to $10,000'
  },
  MD: {
    name: 'Maryland',
    abbreviation: 'MD',
    hasIncomeTax: true,
    flatRate: 0.0475, // Simplified - actually 2-5.75%
    militaryPayExempt: false,
    retiredMilitaryExempt: true,
    notes: 'First $5,000 retired military exempt, increases with age'
  },
  MA: {
    name: 'Massachusetts',
    abbreviation: 'MA',
    hasIncomeTax: true,
    flatRate: 0.05,
    militaryPayExempt: false,
    retiredMilitaryExempt: true,
    notes: 'US military pension exempt'
  },
  MI: {
    name: 'Michigan',
    abbreviation: 'MI',
    hasIncomeTax: true,
    flatRate: 0.0425,
    militaryPayExempt: false,
    retiredMilitaryExempt: true,
    notes: 'Military retirement exempt'
  },
  MN: {
    name: 'Minnesota',
    abbreviation: 'MN',
    hasIncomeTax: true,
    flatRate: 0.0785, // Simplified
    militaryPayExempt: false,
    retiredMilitaryExempt: false,
    notes: 'Military retirement taxed'
  },
  MS: {
    name: 'Mississippi',
    abbreviation: 'MS',
    hasIncomeTax: true,
    flatRate: 0.05,
    militaryPayExempt: false,
    retiredMilitaryExempt: true,
    notes: 'All military retirement exempt'
  },
  MO: {
    name: 'Missouri',
    abbreviation: 'MO',
    hasIncomeTax: true,
    flatRate: 0.0495, // Simplified
    militaryPayExempt: false,
    retiredMilitaryExempt: true,
    notes: 'Military retirement exempt'
  },
  MT: {
    name: 'Montana',
    abbreviation: 'MT',
    hasIncomeTax: true,
    flatRate: 0.059, // Moving to flat
    militaryPayExempt: false,
    retiredMilitaryExempt: false,
    notes: 'Partial military retirement exemption'
  },
  NE: {
    name: 'Nebraska',
    abbreviation: 'NE',
    hasIncomeTax: true,
    flatRate: 0.0584, // Simplified
    militaryPayExempt: false,
    retiredMilitaryExempt: true,
    notes: '100% military retirement exempt starting 2022'
  },
  NV: {
    name: 'Nevada',
    abbreviation: 'NV',
    hasIncomeTax: false,
    militaryPayExempt: true,
    retiredMilitaryExempt: true
  },
  NH: {
    name: 'New Hampshire',
    abbreviation: 'NH',
    hasIncomeTax: false, // No earned income tax
    militaryPayExempt: true,
    retiredMilitaryExempt: true,
    notes: 'No tax on earned income (only interest/dividends, being phased out)'
  },
  NJ: {
    name: 'New Jersey',
    abbreviation: 'NJ',
    hasIncomeTax: true,
    flatRate: 0.0637, // Simplified
    militaryPayExempt: false,
    retiredMilitaryExempt: true,
    notes: 'Military pension exempt up to exclusion amount'
  },
  NM: {
    name: 'New Mexico',
    abbreviation: 'NM',
    hasIncomeTax: true,
    flatRate: 0.049, // Simplified
    militaryPayExempt: false,
    retiredMilitaryExempt: true,
    notes: 'Military retirement exempt'
  },
  NY: {
    name: 'New York',
    abbreviation: 'NY',
    hasIncomeTax: true,
    flatRate: 0.0685, // Simplified
    militaryPayExempt: false,
    retiredMilitaryExempt: true,
    notes: 'US military pension exempt'
  },
  NC: {
    name: 'North Carolina',
    abbreviation: 'NC',
    hasIncomeTax: true,
    flatRate: 0.0475, // Decreasing over time
    militaryPayExempt: false,
    retiredMilitaryExempt: true,
    notes: 'Bailey Settlement - vested by 8/12/89 exempt'
  },
  ND: {
    name: 'North Dakota',
    abbreviation: 'ND',
    hasIncomeTax: true,
    flatRate: 0.0195, // Very low - moving toward elimination
    militaryPayExempt: false,
    retiredMilitaryExempt: true,
    notes: 'Low tax state, military retirement exempt'
  },
  OH: {
    name: 'Ohio',
    abbreviation: 'OH',
    hasIncomeTax: true,
    flatRate: 0.0399, // Simplified
    militaryPayExempt: false,
    retiredMilitaryExempt: true,
    notes: 'Military retirement credit'
  },
  OK: {
    name: 'Oklahoma',
    abbreviation: 'OK',
    hasIncomeTax: true,
    flatRate: 0.0475, // Simplified
    militaryPayExempt: false,
    retiredMilitaryExempt: true,
    notes: '75% of military retirement exempt'
  },
  OR: {
    name: 'Oregon',
    abbreviation: 'OR',
    hasIncomeTax: true,
    flatRate: 0.09, // Simplified - actually 4.75-9.9%
    militaryPayExempt: false,
    retiredMilitaryExempt: false,
    notes: 'Military retirement taxed (partial deduction available)'
  },
  PA: {
    name: 'Pennsylvania',
    abbreviation: 'PA',
    hasIncomeTax: true,
    flatRate: 0.0307,
    militaryPayExempt: false,
    retiredMilitaryExempt: true,
    notes: 'All retirement income exempt'
  },
  RI: {
    name: 'Rhode Island',
    abbreviation: 'RI',
    hasIncomeTax: true,
    flatRate: 0.0599, // Simplified
    militaryPayExempt: false,
    retiredMilitaryExempt: true,
    notes: 'Military retirement exempt'
  },
  SC: {
    name: 'South Carolina',
    abbreviation: 'SC',
    hasIncomeTax: true,
    flatRate: 0.065, // Moving to flat 6%
    militaryPayExempt: false,
    retiredMilitaryExempt: true,
    notes: 'Military retirement exempt'
  },
  SD: {
    name: 'South Dakota',
    abbreviation: 'SD',
    hasIncomeTax: false,
    militaryPayExempt: true,
    retiredMilitaryExempt: true
  },
  TN: {
    name: 'Tennessee',
    abbreviation: 'TN',
    hasIncomeTax: false,
    militaryPayExempt: true,
    retiredMilitaryExempt: true
  },
  TX: {
    name: 'Texas',
    abbreviation: 'TX',
    hasIncomeTax: false,
    militaryPayExempt: true,
    retiredMilitaryExempt: true
  },
  UT: {
    name: 'Utah',
    abbreviation: 'UT',
    hasIncomeTax: true,
    flatRate: 0.0485,
    militaryPayExempt: false,
    retiredMilitaryExempt: true,
    notes: 'Military retirement credit available'
  },
  VT: {
    name: 'Vermont',
    abbreviation: 'VT',
    hasIncomeTax: true,
    flatRate: 0.0675, // Simplified
    militaryPayExempt: false,
    retiredMilitaryExempt: false,
    notes: 'Military retirement taxed'
  },
  VA: {
    name: 'Virginia',
    abbreviation: 'VA',
    hasIncomeTax: true,
    flatRate: 0.0575, // Top rate
    militaryPayExempt: false,
    retiredMilitaryExempt: true,
    notes: 'Up to $40,000 military retirement exempt'
  },
  WA: {
    name: 'Washington',
    abbreviation: 'WA',
    hasIncomeTax: false,
    militaryPayExempt: true,
    retiredMilitaryExempt: true
  },
  WV: {
    name: 'West Virginia',
    abbreviation: 'WV',
    hasIncomeTax: true,
    flatRate: 0.0512, // Simplified
    militaryPayExempt: false,
    retiredMilitaryExempt: true,
    notes: 'Military retirement exempt'
  },
  WI: {
    name: 'Wisconsin',
    abbreviation: 'WI',
    hasIncomeTax: true,
    flatRate: 0.0653, // Simplified
    militaryPayExempt: false,
    retiredMilitaryExempt: true,
    notes: 'Military retirement exempt'
  },
  WY: {
    name: 'Wyoming',
    abbreviation: 'WY',
    hasIncomeTax: false,
    militaryPayExempt: true,
    retiredMilitaryExempt: true
  },
  DC: {
    name: 'District of Columbia',
    abbreviation: 'DC',
    hasIncomeTax: true,
    flatRate: 0.085, // Simplified
    militaryPayExempt: false,
    retiredMilitaryExempt: false,
    notes: 'Military retirement taxed'
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get federal tax brackets for a given year
 */
export function getFederalTaxYear(year: number): FederalTaxYear {
  if (year >= 2025) return FEDERAL_TAX_2025;
  return FEDERAL_TAX_2024;
}

/**
 * Get FICA rates for a given year
 */
export function getFICARates(year: number): FICARates {
  if (year >= 2025) return FICA_RATES_2025;
  return FICA_RATES_2024;
}

/**
 * Get brackets for filing status
 */
export function getBracketsForFilingStatus(
  taxYear: FederalTaxYear,
  filingStatus: TaxFilingStatus
): TaxBracket[] {
  switch (filingStatus) {
    case 'single':
      return taxYear.single;
    case 'marriedFilingJointly':
      return taxYear.marriedFilingJointly;
    case 'marriedFilingSeparately':
      return taxYear.marriedFilingSeparately;
    case 'headOfHousehold':
      return taxYear.headOfHousehold;
    default:
      return taxYear.single;
  }
}

/**
 * Get standard deduction for filing status
 */
export function getStandardDeduction(
  taxYear: FederalTaxYear,
  filingStatus: TaxFilingStatus
): number {
  return taxYear.standardDeduction[filingStatus] || taxYear.standardDeduction.single;
}

/**
 * Check if state has income tax
 */
export function stateHasIncomeTax(stateAbbr: string): boolean {
  const state = STATE_TAX_INFO[stateAbbr.toUpperCase()];
  return state ? state.hasIncomeTax : true; // Assume tax if unknown
}

/**
 * Get state tax rate (simplified)
 */
export function getStateTaxRate(stateAbbr: string): number {
  const state = STATE_TAX_INFO[stateAbbr.toUpperCase()];
  if (!state || !state.hasIncomeTax) return 0;
  return state.flatRate || 0.05; // Default to 5% if no flat rate
}

/**
 * Check if state exempts military retirement pay
 */
export function isRetirementExempt(stateAbbr: string): boolean {
  const state = STATE_TAX_INFO[stateAbbr.toUpperCase()];
  return state?.retiredMilitaryExempt || false;
}

/**
 * Get list of no-income-tax states
 */
export function getNoIncomeTaxStates(): string[] {
  return [...NO_INCOME_TAX_STATES];
}

/**
 * Get all states sorted by tax friendliness for military
 */
export function getMilitaryFriendlyStates(): Array<{ state: string; info: StateTaxInfo }> {
  return Object.entries(STATE_TAX_INFO)
    .filter(([_, info]) => !info.hasIncomeTax || info.militaryPayExempt)
    .map(([state, info]) => ({ state, info }))
    .sort((a, b) => a.state.localeCompare(b.state));
}
