// Military-specific type definitions

import { PayGrade } from './user';

export type IncomeType =
  // Base Pay & Allowances
  | 'base_pay'
  | 'bah' // Basic Allowance for Housing
  | 'bas' // Basic Allowance for Subsistence
  | 'oha' // Overseas Housing Allowance
  | 'cola' // Cost of Living Allowance
  | 'fsa' // Family Separation Allowance
  // Special & Incentive Pays
  | 'hazard_duty_pay'
  | 'flight_pay'
  | 'sea_pay'
  | 'jump_pay'
  | 'dive_pay'
  | 'foreign_language_pay'
  | 'special_duty_pay'
  | 'hardship_duty_pay'
  | 'hostile_fire_pay'
  | 'imminent_danger_pay'
  // Guard & Reserve
  | 'drill_pay'
  | 'annual_training_pay'
  | 'activation_pay'
  // Veteran Income
  | 'va_disability'
  | 'retirement_pay'
  | 'crsc' // Combat-Related Special Compensation
  | 'crdp' // Concurrent Retirement and Disability Pay
  | 'gi_bill_mha' // GI Bill Monthly Housing Allowance
  | 'vr_e_subsistence' // Voc Rehab
  // Civilian/Other
  | 'civilian_salary'
  | 'other_income';

export interface IncomeSource {
  id: string;
  type: IncomeType;
  name: string;
  amount: number;
  frequency: 'monthly' | 'biweekly' | 'weekly' | 'one_time' | 'drill'; // drill = irregular
  isTaxFree: boolean;
  isTaxable: boolean; // separate from tax-free for partial situations
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export type MilitaryExpenseCategory =
  | 'sgli' // Servicemembers' Group Life Insurance
  | 'vgli' // Veterans' Group Life Insurance
  | 'tsp_traditional'
  | 'tsp_roth'
  | 'tricare_premium'
  | 'tricare_copay'
  | 'va_copay'
  | 'dental_fedvip'
  | 'uniform_gear'
  | 'mess_dues'
  | 'unit_fund'
  | 'pcs_expense'
  | 'storage'
  | 'allotment'
  | 'military_star_card';

export interface DeploymentInfo {
  isActive: boolean;
  startDate?: string;
  expectedEndDate?: string;
  location?: string;
  combatZone: boolean;
  hostileFirePay: boolean;
  familySeparationAllowance: boolean;
  reducedExpenseCategories: string[];
  savingsGoalId?: string;
}

export interface TransitionInfo {
  etsDate?: string;
  retirementDate?: string;
  terminalLeaveStart?: string;
  projectedFinalPay?: number;
  projectedVaDisability?: number;
  plannedCivilianIncome?: number;
  notes?: string;
}

// Pay table structure for military pay calculations
export interface PayTableEntry {
  payGrade: PayGrade;
  yearsOfService: number;
  monthlyPay: number;
}

// BAH rate structure
export interface BAHRate {
  zipCode: string;
  mha: string; // Military Housing Area
  withDependents: number;
  withoutDependents: number;
  payGrade: PayGrade;
  effectiveYear: number;
}

// Tax-free income types for easy reference
export const TAX_FREE_INCOME_TYPES: IncomeType[] = [
  'bah',
  'bas',
  'oha',
  'cola',
  'fsa',
  'hostile_fire_pay',
  'imminent_danger_pay',
  'va_disability',
];
