// Military pay calculation utilities

import { PayGrade, IncomeSource, MilitaryProfile } from '../../types';
import {
  getBasePay,
  getBASRate,
  SPECIAL_PAY_RATES,
  getPayGradeType,
} from '../../constants/militaryData/payTables';
import { getBAHRate, findMHAByZip } from '../../constants/militaryData/bahRates';

export interface PayEstimate {
  basePay: number;
  bah: number;
  bas: number;
  specialPays: { name: string; amount: number }[];
  totalGross: number;
  taxableIncome: number;
  taxFreeIncome: number;
}

// Calculate estimated military pay based on profile
export function calculateMilitaryPay(
  profile: MilitaryProfile,
  mhaCode?: string,
  hasDependents: boolean = false,
  specialPays: string[] = []
): PayEstimate {
  const result: PayEstimate = {
    basePay: 0,
    bah: 0,
    bas: 0,
    specialPays: [],
    totalGross: 0,
    taxableIncome: 0,
    taxFreeIncome: 0,
  };

  if (!profile.payGrade) return result;

  // Base pay
  result.basePay = getBasePay(profile.payGrade, profile.yearsOfService || 0);
  result.taxableIncome = result.basePay;

  // BAH (tax-free)
  if (mhaCode) {
    const bahRate = getBAHRate(mhaCode, profile.payGrade, hasDependents);
    result.bah = bahRate || 0;
    result.taxFreeIncome += result.bah;
  }

  // BAS (tax-free)
  result.bas = getBASRate(profile.payGrade);
  result.taxFreeIncome += result.bas;

  // Special pays
  for (const pay of specialPays) {
    let amount = 0;
    let name = pay;

    switch (pay) {
      case 'hostile_fire':
        amount = SPECIAL_PAY_RATES.hostileFirePay;
        name = 'Hostile Fire Pay';
        result.taxFreeIncome += amount; // Tax-free in combat zone
        break;
      case 'imminent_danger':
        amount = SPECIAL_PAY_RATES.imminentDangerPay;
        name = 'Imminent Danger Pay';
        result.taxFreeIncome += amount;
        break;
      case 'family_separation':
        amount = SPECIAL_PAY_RATES.familySeparationAllowance;
        name = 'Family Separation Allowance';
        result.taxFreeIncome += amount;
        break;
      case 'flight_pay':
        const payType = getPayGradeType(profile.payGrade);
        if (payType === 'enlisted') {
          amount = SPECIAL_PAY_RATES.flightPay.enlisted;
        } else {
          const grade = parseInt(profile.payGrade.split('-')[1]);
          if (grade <= 2) amount = SPECIAL_PAY_RATES.flightPay.officer_O1_O2;
          else if (grade <= 4) amount = SPECIAL_PAY_RATES.flightPay.officer_O3_O4;
          else amount = SPECIAL_PAY_RATES.flightPay.officer_O5_O6;
        }
        name = 'Flight Pay';
        result.taxableIncome += amount;
        break;
      case 'jump_pay':
        amount = SPECIAL_PAY_RATES.jumpPay;
        name = 'Jump Pay';
        result.taxableIncome += amount;
        break;
      case 'dive_pay':
        amount = SPECIAL_PAY_RATES.divePay.basic;
        name = 'Dive Pay';
        result.taxableIncome += amount;
        break;
    }

    if (amount > 0) {
      result.specialPays.push({ name, amount });
    }
  }

  result.totalGross =
    result.basePay +
    result.bah +
    result.bas +
    result.specialPays.reduce((sum, p) => sum + p.amount, 0);

  return result;
}

// Calculate drill pay for Guard/Reserve (one weekend drill = 4 drill periods)
export function calculateDrillPay(
  payGrade: PayGrade,
  yearsOfService: number,
  drillPeriods: number = 4 // Standard weekend is 4 drills
): number {
  const monthlyBasePay = getBasePay(payGrade, yearsOfService);
  // Daily rate is monthly / 30, drill pay is 1/30 of monthly per drill period
  const dailyRate = monthlyBasePay / 30;
  return dailyRate * drillPeriods;
}

// Calculate Annual Training (AT) pay (typically 15 days)
export function calculateATpay(
  payGrade: PayGrade,
  yearsOfService: number,
  days: number = 15
): number {
  const monthlyBasePay = getBasePay(payGrade, yearsOfService);
  const dailyRate = monthlyBasePay / 30;
  return dailyRate * days;
}

// Calculate VA disability monthly compensation (2024 rates)
// These are simplified - actual rates vary by dependents
export const VA_DISABILITY_RATES: Record<number, number> = {
  10: 171.23,
  20: 338.49,
  30: 524.31,
  40: 755.28,
  50: 1075.16,
  60: 1361.88,
  70: 1716.28,
  80: 1995.01,
  90: 2241.91,
  100: 3737.85, // Basic rate without dependents
};

export function getVADisabilityCompensation(rating: number): number {
  // Round to nearest 10
  const roundedRating = Math.round(rating / 10) * 10;
  return VA_DISABILITY_RATES[roundedRating] || 0;
}

// Calculate retirement pay estimate (simplified)
// Actual calculation depends on retirement system (Legacy vs BRS)
export function calculateRetirementPay(
  payGrade: PayGrade,
  yearsOfService: number,
  retirementSystem: 'legacy' | 'brs' = 'brs'
): number {
  const highThreeAverage = getBasePay(payGrade, yearsOfService); // Simplified: use current pay

  if (retirementSystem === 'legacy') {
    // Legacy: 2.5% per year, max 75% at 30 years
    const multiplier = Math.min(yearsOfService * 0.025, 0.75);
    return highThreeAverage * multiplier;
  } else {
    // BRS: 2.0% per year, max 60% at 30 years (plus TSP match)
    const multiplier = Math.min(yearsOfService * 0.02, 0.6);
    return highThreeAverage * multiplier;
  }
}

// Calculate terminal leave cash-out value
export function calculateTerminalLeaveValue(
  payGrade: PayGrade,
  yearsOfService: number,
  leaveDays: number
): number {
  const monthlyBasePay = getBasePay(payGrade, yearsOfService);
  const dailyRate = monthlyBasePay / 30;
  return dailyRate * leaveDays;
}

// Calculate GI Bill MHA (Monthly Housing Allowance)
// MHA is based on E-5 with dependents BAH rate for school location
export function calculateGIBillMHA(
  mhaCode: string,
  attendanceRate: number = 100 // Full-time = 100%
): number {
  const e5BAH = getBAHRate(mhaCode, 'E-5', true);
  if (!e5BAH) return 0;
  return e5BAH * (attendanceRate / 100);
}

// Aggregate all income sources into total
export function calculateTotalMonthlyIncome(
  incomeSources: IncomeSource[]
): { total: number; taxable: number; taxFree: number } {
  let total = 0;
  let taxable = 0;
  let taxFree = 0;

  for (const source of incomeSources) {
    let monthlyAmount = source.amount;

    // Convert to monthly if needed
    if (source.frequency === 'biweekly') {
      monthlyAmount = (source.amount * 26) / 12;
    } else if (source.frequency === 'weekly') {
      monthlyAmount = (source.amount * 52) / 12;
    }
    // 'drill' frequency is irregular, user enters monthly estimate

    total += monthlyAmount;

    if (source.isTaxFree) {
      taxFree += monthlyAmount;
    } else {
      taxable += monthlyAmount;
    }
  }

  return { total, taxable, taxFree };
}
