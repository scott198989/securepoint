/**
 * Tax Estimation Utilities
 * Calculate federal and state tax estimates for military pay
 */

import {
  TaxFilingStatus,
  getFederalTaxYear,
  getFICARates,
  getBracketsForFilingStatus,
  getStandardDeduction,
  getStateTaxRate,
  stateHasIncomeTax,
  TaxBracket
} from '../../constants/taxBrackets';

// ============================================================================
// TYPES
// ============================================================================

export interface TaxableIncome {
  basePay: number;
  specialPays: number; // Taxable special pays
  bonuses: number;
  otherTaxable: number;
}

export interface TaxFreeIncome {
  bah: number;
  bas: number;
  combatPay: number; // HFP, IDP when in combat zone
  otherTaxFree: number;
}

export interface TaxEstimateInput {
  taxableIncome: TaxableIncome;
  taxFreeIncome: TaxFreeIncome;
  filingStatus: TaxFilingStatus;
  stateOfResidence: string; // State abbreviation
  additionalWithholding?: number; // Extra withholding requested
  exemptions?: number; // W-4 exemptions (legacy)
  inCombatZone?: boolean; // CZTE applies
  taxYear?: number;
}

export interface TaxEstimateResult {
  // Annual estimates
  annualTaxableIncome: number;
  annualTaxFreeIncome: number;
  annualGrossIncome: number;

  // Federal
  federalTaxableIncome: number; // After standard deduction
  federalTaxLiability: number;
  effectiveFederalRate: number;
  marginalFederalRate: number;

  // State
  stateTaxableIncome: number;
  stateTaxLiability: number;
  effectiveStateRate: number;
  stateHasNoIncomeTax: boolean;

  // FICA
  socialSecurityTax: number;
  medicareTax: number;
  totalFICA: number;

  // Totals
  totalAnnualTax: number;
  totalMonthlyTax: number;
  monthlyTakeHome: number;

  // Per paycheck (semi-monthly)
  perPaycheckTax: number;
  perPaycheckTakeHome: number;

  // Breakdown for display
  breakdown: {
    category: string;
    annual: number;
    monthly: number;
    perPaycheck: number;
  }[];
}

export interface WithholdingEstimate {
  federalWithholding: number;
  stateWithholding: number;
  socialSecurity: number;
  medicare: number;
  totalWithholding: number;
}

// ============================================================================
// CORE TAX CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate federal income tax using tax brackets
 */
export function calculateFederalTax(
  taxableIncome: number,
  filingStatus: TaxFilingStatus,
  taxYear: number = new Date().getFullYear()
): { tax: number; effectiveRate: number; marginalRate: number } {
  const federalTaxYear = getFederalTaxYear(taxYear);
  const brackets = getBracketsForFilingStatus(federalTaxYear, filingStatus);
  const standardDeduction = getStandardDeduction(federalTaxYear, filingStatus);

  // Apply standard deduction
  const adjustedIncome = Math.max(0, taxableIncome - standardDeduction);

  if (adjustedIncome <= 0) {
    return { tax: 0, effectiveRate: 0, marginalRate: 0.10 };
  }

  // Find applicable bracket and calculate tax
  let tax = 0;
  let marginalRate = 0.10;

  for (const bracket of brackets) {
    if (adjustedIncome > bracket.min) {
      if (adjustedIncome <= bracket.max) {
        // In this bracket
        tax = bracket.baseTax + (adjustedIncome - bracket.min) * bracket.rate;
        marginalRate = bracket.rate;
        break;
      }
    }
  }

  // If income exceeds all brackets, use top bracket
  if (adjustedIncome > brackets[brackets.length - 1].min) {
    const topBracket = brackets[brackets.length - 1];
    tax = topBracket.baseTax + (adjustedIncome - topBracket.min) * topBracket.rate;
    marginalRate = topBracket.rate;
  }

  const effectiveRate = taxableIncome > 0 ? tax / taxableIncome : 0;

  return {
    tax: Math.round(tax * 100) / 100,
    effectiveRate: Math.round(effectiveRate * 10000) / 10000,
    marginalRate
  };
}

/**
 * Calculate state income tax (simplified)
 */
export function calculateStateTax(
  taxableIncome: number,
  stateAbbr: string
): { tax: number; rate: number; hasNoTax: boolean } {
  if (!stateHasIncomeTax(stateAbbr)) {
    return { tax: 0, rate: 0, hasNoTax: true };
  }

  const rate = getStateTaxRate(stateAbbr);
  const tax = taxableIncome * rate;

  return {
    tax: Math.round(tax * 100) / 100,
    rate,
    hasNoTax: false
  };
}

/**
 * Calculate FICA taxes (Social Security and Medicare)
 */
export function calculateFICA(
  taxableIncome: number,
  filingStatus: TaxFilingStatus,
  taxYear: number = new Date().getFullYear()
): { socialSecurity: number; medicare: number; total: number } {
  const rates = getFICARates(taxYear);

  // Social Security - capped at wage limit
  const ssWages = Math.min(taxableIncome, rates.socialSecurity.wageLimit);
  const socialSecurity = ssWages * rates.socialSecurity.rate;

  // Medicare - no cap, but additional tax for high earners
  let medicare = taxableIncome * rates.medicare.rate;
  const thresholds = rates.medicare.additionalThreshold as Record<string, number>;
  const threshold = thresholds[filingStatus] || thresholds.single;

  if (taxableIncome > threshold) {
    medicare += (taxableIncome - threshold) * rates.medicare.additionalRate;
  }

  return {
    socialSecurity: Math.round(socialSecurity * 100) / 100,
    medicare: Math.round(medicare * 100) / 100,
    total: Math.round((socialSecurity + medicare) * 100) / 100
  };
}

// ============================================================================
// MAIN ESTIMATION FUNCTION
// ============================================================================

/**
 * Calculate comprehensive tax estimate
 */
export function estimateTaxes(input: TaxEstimateInput): TaxEstimateResult {
  const taxYear = input.taxYear || new Date().getFullYear();

  // Calculate annual amounts
  const annualTaxable =
    (input.taxableIncome.basePay +
      input.taxableIncome.specialPays +
      input.taxableIncome.bonuses +
      input.taxableIncome.otherTaxable) * 12;

  const annualTaxFree =
    (input.taxFreeIncome.bah +
      input.taxFreeIncome.bas +
      input.taxFreeIncome.combatPay +
      input.taxFreeIncome.otherTaxFree) * 12;

  // Combat zone tax exclusion
  let federalTaxableIncome = annualTaxable;
  if (input.inCombatZone) {
    // Enlisted: all base pay tax-free
    // Officers: up to highest enlisted rate tax-free
    // Simplified: just showing potential benefit
    federalTaxableIncome = Math.max(0, annualTaxable - input.taxFreeIncome.combatPay * 12);
  }

  // Federal tax calculation
  const federalResult = calculateFederalTax(
    federalTaxableIncome,
    input.filingStatus,
    taxYear
  );

  // State tax calculation
  const stateResult = calculateStateTax(
    federalTaxableIncome, // Most states use federal AGI as starting point
    input.stateOfResidence
  );

  // FICA calculation (on all taxable wages, not reduced by combat zone)
  const ficaResult = calculateFICA(
    annualTaxable,
    input.filingStatus,
    taxYear
  );

  // Totals
  const totalAnnualTax =
    federalResult.tax + stateResult.tax + ficaResult.total;
  const totalMonthlyTax = totalAnnualTax / 12;

  const annualGross = annualTaxable + annualTaxFree;
  const monthlyGross = annualGross / 12;
  const monthlyTakeHome = monthlyGross - totalMonthlyTax;

  // Per paycheck (semi-monthly = 24 paychecks)
  const perPaycheckTax = totalAnnualTax / 24;
  const perPaycheckGross = annualGross / 24;
  const perPaycheckTakeHome = perPaycheckGross - perPaycheckTax;

  // Breakdown for display
  const breakdown = [
    {
      category: 'Federal Income Tax',
      annual: federalResult.tax,
      monthly: federalResult.tax / 12,
      perPaycheck: federalResult.tax / 24
    },
    {
      category: 'State Income Tax',
      annual: stateResult.tax,
      monthly: stateResult.tax / 12,
      perPaycheck: stateResult.tax / 24
    },
    {
      category: 'Social Security (FICA)',
      annual: ficaResult.socialSecurity,
      monthly: ficaResult.socialSecurity / 12,
      perPaycheck: ficaResult.socialSecurity / 24
    },
    {
      category: 'Medicare (FICA)',
      annual: ficaResult.medicare,
      monthly: ficaResult.medicare / 12,
      perPaycheck: ficaResult.medicare / 24
    }
  ];

  return {
    annualTaxableIncome: annualTaxable,
    annualTaxFreeIncome: annualTaxFree,
    annualGrossIncome: annualGross,

    federalTaxableIncome,
    federalTaxLiability: federalResult.tax,
    effectiveFederalRate: federalResult.effectiveRate,
    marginalFederalRate: federalResult.marginalRate,

    stateTaxableIncome: federalTaxableIncome,
    stateTaxLiability: stateResult.tax,
    effectiveStateRate: stateResult.rate,
    stateHasNoIncomeTax: stateResult.hasNoTax,

    socialSecurityTax: ficaResult.socialSecurity,
    medicareTax: ficaResult.medicare,
    totalFICA: ficaResult.total,

    totalAnnualTax,
    totalMonthlyTax,
    monthlyTakeHome,

    perPaycheckTax,
    perPaycheckTakeHome,

    breakdown
  };
}

// ============================================================================
// WITHHOLDING ESTIMATION
// ============================================================================

/**
 * Estimate monthly withholding amounts
 * This is what would appear on an LES as deductions
 */
export function estimateMonthlyWithholding(
  monthlyTaxableIncome: number,
  filingStatus: TaxFilingStatus,
  stateAbbr: string,
  additionalFederalWithholding: number = 0,
  additionalStateWithholding: number = 0
): WithholdingEstimate {
  const annualTaxable = monthlyTaxableIncome * 12;

  // Federal withholding estimate
  const federal = calculateFederalTax(annualTaxable, filingStatus);
  const federalMonthly = federal.tax / 12 + additionalFederalWithholding;

  // State withholding estimate
  const state = calculateStateTax(annualTaxable, stateAbbr);
  const stateMonthly = state.tax / 12 + additionalStateWithholding;

  // FICA
  const fica = calculateFICA(annualTaxable, filingStatus);
  const ssMonthly = fica.socialSecurity / 12;
  const medicareMonthly = fica.medicare / 12;

  return {
    federalWithholding: Math.round(federalMonthly * 100) / 100,
    stateWithholding: Math.round(stateMonthly * 100) / 100,
    socialSecurity: Math.round(ssMonthly * 100) / 100,
    medicare: Math.round(medicareMonthly * 100) / 100,
    totalWithholding: Math.round(
      (federalMonthly + stateMonthly + ssMonthly + medicareMonthly) * 100
    ) / 100
  };
}

/**
 * Calculate per-paycheck withholding (semi-monthly)
 */
export function estimatePaycheckWithholding(
  monthlyTaxableIncome: number,
  filingStatus: TaxFilingStatus,
  stateAbbr: string
): WithholdingEstimate {
  const monthly = estimateMonthlyWithholding(monthlyTaxableIncome, filingStatus, stateAbbr);

  return {
    federalWithholding: Math.round((monthly.federalWithholding / 2) * 100) / 100,
    stateWithholding: Math.round((monthly.stateWithholding / 2) * 100) / 100,
    socialSecurity: Math.round((monthly.socialSecurity / 2) * 100) / 100,
    medicare: Math.round((monthly.medicare / 2) * 100) / 100,
    totalWithholding: Math.round((monthly.totalWithholding / 2) * 100) / 100
  };
}

// ============================================================================
// COMBAT ZONE TAX EXCLUSION
// ============================================================================

/**
 * Calculate combat zone tax exclusion benefit
 */
export function calculateCZTEBenefit(
  monthlyBasePay: number,
  monthlySpecialPay: number,
  isEnlisted: boolean,
  filingStatus: TaxFilingStatus
): {
  monthlyExclusion: number;
  annualTaxSavings: number;
  notes: string[];
} {
  // Enlisted: unlimited exclusion
  // Officers: capped at highest enlisted + HFP/IDP
  const E9_30_YEARS_PAY = 9148.20; // Approximate E-9 with 30 years
  const HFP_IDP = 225;

  let monthlyExclusion: number;
  const notes: string[] = [];

  if (isEnlisted) {
    monthlyExclusion = monthlyBasePay + monthlySpecialPay;
    notes.push('Enlisted: All pay earned in combat zone is tax-free');
  } else {
    const cap = E9_30_YEARS_PAY + HFP_IDP;
    monthlyExclusion = Math.min(monthlyBasePay + monthlySpecialPay, cap);
    notes.push(`Officers: Exclusion capped at ${formatCurrency(cap)}/month`);
    if (monthlyBasePay + monthlySpecialPay > cap) {
      notes.push('Some of your pay exceeds the exclusion cap');
    }
  }

  // Calculate tax savings
  const annualExclusion = monthlyExclusion * 12;
  const withoutCZTE = calculateFederalTax(
    (monthlyBasePay + monthlySpecialPay) * 12,
    filingStatus
  );
  const withCZTE = calculateFederalTax(
    Math.max(0, (monthlyBasePay + monthlySpecialPay) * 12 - annualExclusion),
    filingStatus
  );

  const annualTaxSavings = withoutCZTE.tax - withCZTE.tax;

  notes.push('CZTE applies for any portion of a month in the combat zone');
  notes.push('Reenlistment bonuses in combat zone are 100% tax-free');

  return {
    monthlyExclusion,
    annualTaxSavings,
    notes
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format currency for display
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}

/**
 * Calculate year-to-date tax liability
 */
export function calculateYTDTax(
  monthlyTaxableIncome: number,
  monthsElapsed: number,
  filingStatus: TaxFilingStatus,
  stateAbbr: string
): {
  ytdFederal: number;
  ytdState: number;
  ytdFICA: number;
  ytdTotal: number;
} {
  const annualProjected = monthlyTaxableIncome * 12;

  const federal = calculateFederalTax(annualProjected, filingStatus);
  const state = calculateStateTax(annualProjected, stateAbbr);
  const fica = calculateFICA(annualProjected, filingStatus);

  const ytdFraction = monthsElapsed / 12;

  return {
    ytdFederal: Math.round(federal.tax * ytdFraction * 100) / 100,
    ytdState: Math.round(state.tax * ytdFraction * 100) / 100,
    ytdFICA: Math.round(fica.total * ytdFraction * 100) / 100,
    ytdTotal: Math.round((federal.tax + state.tax + fica.total) * ytdFraction * 100) / 100
  };
}

/**
 * Compare actual LES withholding to calculated estimate
 */
export function compareWithholdingToEstimate(
  actualFederal: number,
  actualState: number,
  actualSS: number,
  actualMedicare: number,
  monthlyTaxableIncome: number,
  filingStatus: TaxFilingStatus,
  stateAbbr: string
): {
  federalDiff: number;
  stateDiff: number;
  ssDiff: number;
  medicareDiff: number;
  totalDiff: number;
  analysis: string[];
} {
  const estimate = estimateMonthlyWithholding(monthlyTaxableIncome, filingStatus, stateAbbr);

  const federalDiff = actualFederal - estimate.federalWithholding;
  const stateDiff = actualState - estimate.stateWithholding;
  const ssDiff = actualSS - estimate.socialSecurity;
  const medicareDiff = actualMedicare - estimate.medicare;
  const totalDiff = federalDiff + stateDiff + ssDiff + medicareDiff;

  const analysis: string[] = [];

  if (Math.abs(federalDiff) > 50) {
    if (federalDiff > 0) {
      analysis.push('Federal withholding is higher than expected. Check your W-4 allowances.');
    } else {
      analysis.push('Federal withholding is lower than expected. You may owe at tax time.');
    }
  }

  if (Math.abs(stateDiff) > 25 && !stateHasIncomeTax(stateAbbr)) {
    analysis.push('You have state tax withheld but your SLR has no income tax. Update DD Form 2058.');
  }

  if (Math.abs(ssDiff) > 10 || Math.abs(medicareDiff) > 5) {
    analysis.push('FICA amounts differ from estimate. This could be due to timing or YTD caps.');
  }

  if (analysis.length === 0) {
    analysis.push('Withholding amounts are within expected range.');
  }

  return {
    federalDiff: Math.round(federalDiff * 100) / 100,
    stateDiff: Math.round(stateDiff * 100) / 100,
    ssDiff: Math.round(ssDiff * 100) / 100,
    medicareDiff: Math.round(medicareDiff * 100) / 100,
    totalDiff: Math.round(totalDiff * 100) / 100,
    analysis
  };
}
