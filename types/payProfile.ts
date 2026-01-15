// Enhanced Pay Profile types for comprehensive military pay calculations

import { PayGrade, MilitaryBranch, MilitaryStatus } from './user';

// Duty status - more granular than MilitaryStatus
export type DutyStatus =
  | 'active_duty'           // Full-time active duty
  | 'reserve_drilling'      // Traditional Reserve (drilling)
  | 'reserve_inactive'      // IRR
  | 'guard_drilling'        // Traditional Guard (drilling)
  | 'ados'                  // Active Duty Operational Support
  | 'ado'                   // Active Duty for Operational Support
  | 'mobilized_title10'     // Federal mobilization
  | 'mobilized_title32'     // State mobilization (Guard)
  | 'agr'                   // Active Guard Reserve
  | 'technician'            // Federal technician
  | 'deployed'              // Currently deployed (any component)
  | 'veteran'               // Separated
  | 'retired';              // Military retirement

// Military component
export type MilitaryComponent = 'active' | 'reserve' | 'guard';

// Housing situation
export type HousingType =
  | 'barracks'              // On-base barracks (no BAH)
  | 'on_base_family'        // On-base family housing (no BAH)
  | 'off_base_bah'          // Off-base receiving BAH
  | 'off_base_oha'          // Overseas Housing Allowance
  | 'with_parents'          // Living with parents (may still get BAH)
  | 'privatized_housing';   // Privatized on-base (receives BAH)

// Tax filing status for withholding estimates
export type TaxFilingStatus =
  | 'single'
  | 'married_filing_jointly'
  | 'married_filing_separately'
  | 'head_of_household'
  | 'qualifying_widow';

// State of residence - impacts state tax withholding
export type StateOfResidence = string; // Two-letter state code

// Special pay types
export type SpecialPayType =
  // Combat/Hazard
  | 'hostile_fire_imminent_danger' // HFP/IDP - $225/mo
  | 'hardship_duty_location'       // HDP-L - $50-$150/mo
  | 'hardship_duty_mission'        // HDP-M - $150/mo
  // Aviation
  | 'flight_pay_acip'              // Aviation Career Incentive Pay
  | 'flight_pay_cefip'             // Career Enlisted Flyer Incentive Pay
  | 'flight_pay_hdip'              // Hazardous Duty Incentive Pay (Flying)
  // Maritime
  | 'sea_pay'                      // Career Sea Pay
  | 'submarine_pay'                // Submarine Duty Pay
  // Airborne/Special
  | 'jump_pay'                     // Parachute Duty Pay - $150/mo
  | 'jump_pay_halo'                // HALO/MFF - $225/mo
  | 'dive_pay'                     // Diving Duty Pay - $150-$340/mo
  // Other
  | 'family_separation'            // FSA - $250/mo (30+ days)
  | 'foreign_language'             // FLPB - up to $1000/mo
  | 'special_duty_assignment'      // SDAP - $75-$450/mo
  | 'assignment_incentive'         // AIP - varies
  | 'career_sea_pay_premium';      // CSP-P - $200/mo (36+ months sea)

// Special pay qualification tracking
export interface SpecialPayQualification {
  payType: SpecialPayType;
  isEligible: boolean;
  isActive: boolean;          // Currently receiving
  startDate?: string;         // When started receiving
  endDate?: string;           // When ended/will end
  monthlyAmount: number;
  tier?: number;              // For tiered pays (HDP levels, dive pay, etc.)
  certificationRequired?: string;  // e.g., "Airborne Orders", "Dive Cert"
  lastVerified?: string;      // Date last confirmed on LES
  notes?: string;
}

// Enhanced Pay Profile - comprehensive data for calculations
export interface EnhancedPayProfile {
  id: string;

  // Basic Info
  payGrade: PayGrade;
  yearsOfService: number;
  yearsOfServiceDate?: string;  // BASD/PEBD for accurate YOS calculation
  branch: MilitaryBranch;

  // Duty Status
  dutyStatus: DutyStatus;
  component: MilitaryComponent;

  // Location & Housing
  dutyStationName?: string;
  dutyStationZip: string;
  mhaCode?: string;              // Military Housing Area (auto-populated from ZIP)
  housingType: HousingType;

  // Dependents & Family
  hasDependents: boolean;
  dependentCount: number;
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  spouseWorkStatus?: 'employed' | 'unemployed' | 'military';

  // Tax Information
  filingStatus: TaxFilingStatus;
  stateOfResidence: StateOfResidence;
  stateTaxExempt?: boolean;     // Some states exempt military pay
  additionalWithholding?: number;

  // Deductions (monthly amounts)
  tspTraditionalPercent: number;   // TSP Traditional contribution %
  tspRothPercent: number;          // TSP Roth contribution %
  sgliCoverage: number;            // SGLI coverage amount (max $500k)
  tricareDental: boolean;          // TRICARE Dental enrollment

  // Special Pay Qualifications
  specialPayQualifications: SpecialPayQualification[];

  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastPayProfileSync?: string;
  isComplete: boolean;
}

// Default values for new profile
export const DEFAULT_PAY_PROFILE: Partial<EnhancedPayProfile> = {
  yearsOfService: 0,
  dutyStatus: 'active_duty',
  component: 'active',
  housingType: 'off_base_bah',
  hasDependents: false,
  dependentCount: 0,
  maritalStatus: 'single',
  filingStatus: 'single',
  stateOfResidence: '',
  tspTraditionalPercent: 5,    // BRS default match
  tspRothPercent: 0,
  sgliCoverage: 500000,        // Max coverage default
  tricareDental: false,
  specialPayQualifications: [],
  isComplete: false,
};

// Pay estimate result (enhanced from existing)
export interface DetailedPayEstimate {
  // Base compensation
  basePay: number;

  // Allowances
  allowances: {
    bah: number;
    bahType?: 'standard' | 'type_ii' | 'partial';
    bas: number;
    oha?: number;
    cola?: number;
    fsa?: number;
    dlaOneTime?: number;  // For PCS moves
  };

  // Special pays
  specialPays: {
    type: SpecialPayType;
    name: string;
    amount: number;
    isTaxFree: boolean;
  }[];

  // Totals
  grossPay: number;
  taxableIncome: number;
  taxFreeIncome: number;

  // Estimated deductions
  estimatedDeductions: {
    federalTax: number;
    stateTax: number;
    socialSecurity: number;  // 6.2% up to wage base
    medicare: number;        // 1.45%
    sgli: number;
    tsgli: number;           // Traumatic Injury SGLI
    tspTraditional: number;
    tspRoth: number;
    tricareDental: number;
    otherDeductions: number;
  };

  totalDeductions: number;
  netPay: number;

  // Per-period breakdown
  perPayPeriod: {
    gross: number;
    deductions: number;
    net: number;
    payDate: '1st' | '15th';
  }[];

  // Annual projection
  annualGross: number;
  annualTaxable: number;
  annualTaxFree: number;
  annualNet: number;
}

// Drill pay estimate for Guard/Reserve
export interface DrillPayEstimate {
  payGrade: PayGrade;
  yearsOfService: number;
  drillPeriods: number;        // Usually 4 for standard weekend (MUTA-4)
  basePayDaily: number;        // 1/30 of monthly base pay
  totalDrillPay: number;       // drillPeriods * basePayDaily
  bahTypeII?: number;          // If on orders 30+ days
  basDaily?: number;           // BAS if on orders
  incentivePays?: number;      // Any applicable special pays
  grossTotal: number;
  federalTaxEstimate: number;
  netEstimate: number;
}

// Annual Training (AT) pay estimate
export interface ATPayEstimate {
  payGrade: PayGrade;
  yearsOfService: number;
  days: number;                // Usually 14-15 days
  basePayDaily: number;
  totalBasePay: number;
  bahTypeII: number;           // BAH Type II for orders < 30 days
  bas: number;
  specialPays: number;
  grossTotal: number;
  federalTaxEstimate: number;
  netEstimate: number;
}

// Orders comparison (Guard/Reserve going on active orders)
export interface OrdersPayComparison {
  ordersDays: number;
  militaryGross: number;
  militaryNet: number;
  civilianEquivalent?: number;  // What they'd make at civilian job
  financialDelta?: number;      // Difference (positive = military pays more)
  recommendation?: 'favorable' | 'neutral' | 'unfavorable';
  notes?: string;
}

// Profile completeness check
export interface ProfileCompleteness {
  isComplete: boolean;
  completedSteps: string[];
  missingSteps: string[];
  percentComplete: number;
}

// Wizard step data
export interface PaySetupWizardStep {
  id: string;
  title: string;
  description: string;
  fields: string[];
  isOptional: boolean;
}

export const PAY_SETUP_WIZARD_STEPS: PaySetupWizardStep[] = [
  {
    id: 'service',
    title: 'Service Information',
    description: 'Your branch, grade, and years of service',
    fields: ['branch', 'payGrade', 'yearsOfService', 'yearsOfServiceDate'],
    isOptional: false,
  },
  {
    id: 'status',
    title: 'Duty Status',
    description: 'Your current duty status and component',
    fields: ['dutyStatus', 'component'],
    isOptional: false,
  },
  {
    id: 'location',
    title: 'Duty Station',
    description: 'Where you are stationed (for BAH calculation)',
    fields: ['dutyStationName', 'dutyStationZip', 'housingType'],
    isOptional: false,
  },
  {
    id: 'family',
    title: 'Family Status',
    description: 'Dependents and marital status (affects BAH)',
    fields: ['maritalStatus', 'hasDependents', 'dependentCount'],
    isOptional: false,
  },
  {
    id: 'tax',
    title: 'Tax Information',
    description: 'Filing status and state of residence',
    fields: ['filingStatus', 'stateOfResidence'],
    isOptional: false,
  },
  {
    id: 'deductions',
    title: 'Deductions',
    description: 'TSP, SGLI, and other deductions',
    fields: ['tspTraditionalPercent', 'tspRothPercent', 'sgliCoverage', 'tricareDental'],
    isOptional: true,
  },
  {
    id: 'special_pays',
    title: 'Special Pays',
    description: 'Any special or incentive pays you receive',
    fields: ['specialPayQualifications'],
    isOptional: true,
  },
];
