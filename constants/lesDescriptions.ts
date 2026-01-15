/**
 * LES Line Item Descriptions
 * "Why is this here?" explainer text for each entitlement and deduction type
 */

import { EntitlementType, DeductionType, AllotmentType } from '../types/les';

// ============================================================================
// ENTITLEMENT DESCRIPTIONS
// ============================================================================

export interface LineItemDescription {
  name: string; // Full name
  abbreviation?: string; // Common abbreviation
  description: string; // What it is
  whyYouHaveIt: string; // Why it appears on your LES
  eligibility?: string; // Who qualifies
  amount?: string; // How amount is determined
  taxInfo: string; // Tax treatment
  commonIssues?: string[]; // Common problems/questions
  references?: string[]; // Regulations/references
  relatedItems?: string[]; // Other related line items
}

export const ENTITLEMENT_DESCRIPTIONS: Record<EntitlementType, LineItemDescription> = {
  // Base Pay
  base_pay: {
    name: 'Basic Pay',
    description: 'Your primary military compensation based on rank and time in service.',
    whyYouHaveIt: 'All service members receive basic pay. Your amount is determined by your pay grade and years of service.',
    eligibility: 'All active duty, Guard, and Reserve service members',
    amount: 'Set by Congress annually. Increases with rank and years of service.',
    taxInfo: 'Fully taxable for federal, state, and local income tax. Subject to FICA.',
    commonIssues: [
      'Pay may lag behind promotion if paperwork is delayed',
      'YOS credit may not reflect prior service until corrected',
      'Drill status shows 1/30th of monthly rate per drill period'
    ],
    references: ['37 U.S.C. § 204', 'DoD Pay Manual 7000.14-R']
  },

  base_pay_accrued: {
    name: 'Base Pay Accrued',
    description: 'Base pay that has been earned but not yet paid out.',
    whyYouHaveIt: 'Shows base pay earned in the current period before pay date.',
    taxInfo: 'Taxable when paid.',
    commonIssues: ['Usually appears mid-month before end-of-month pay']
  },

  // Allowances
  bah: {
    name: 'Basic Allowance for Housing',
    abbreviation: 'BAH',
    description: 'Monthly allowance to help cover housing costs when living off-base.',
    whyYouHaveIt: 'You live in non-government housing or have dependents. BAH helps offset rental/mortgage costs.',
    eligibility: 'Service members not provided government quarters, or with dependents',
    amount: 'Based on your duty station ZIP code, pay grade, and dependency status. Rates set by DoD annually.',
    taxInfo: 'TAX FREE - not subject to federal, state, or FICA taxes.',
    commonIssues: [
      'Rate changes when you PCS to new location',
      '"With dependents" rate applies if you have ANY dependents',
      'BAH may be reduced if living in privatized housing with lower rent',
      'Guard/Reserve only receive BAH when on orders 30+ days'
    ],
    references: ['37 U.S.C. § 403', 'JTR Chapter 10']
  },

  bah_diff: {
    name: 'BAH Differential',
    abbreviation: 'BAH-DIFF',
    description: 'Partial BAH for members assigned to single-type government quarters who pay child support.',
    whyYouHaveIt: 'You live in barracks but pay court-ordered child support.',
    eligibility: 'Members in government quarters with child support obligations',
    taxInfo: 'TAX FREE',
    commonIssues: ['Must provide proof of child support payments']
  },

  bah_partial: {
    name: 'Partial BAH',
    description: 'Reduced BAH rate for members in barracks without dependents.',
    whyYouHaveIt: 'You live in government quarters but are entitled to partial BAH.',
    eligibility: 'Junior enlisted in barracks, certain situations',
    amount: 'Flat rate based on pay grade, not location',
    taxInfo: 'TAX FREE'
  },

  bas: {
    name: 'Basic Allowance for Subsistence',
    abbreviation: 'BAS',
    description: 'Monthly allowance to help cover food costs.',
    whyYouHaveIt: 'You are expected to pay for your own meals (not on meal card).',
    eligibility: 'Officers receive BAS automatically. Enlisted must be authorized to mess separately.',
    amount: 'Flat rate: Officers ~$311/mo, Enlisted ~$452/mo (2024 rates)',
    taxInfo: 'TAX FREE - not subject to federal, state, or FICA taxes.',
    commonIssues: [
      'Enlisted on meal card do not receive BAS',
      'May be prorated if status changes mid-month',
      'Separate rations must be authorized by commander'
    ],
    references: ['37 U.S.C. § 402']
  },

  oha: {
    name: 'Overseas Housing Allowance',
    abbreviation: 'OHA',
    description: 'Housing allowance for service members stationed overseas.',
    whyYouHaveIt: 'You are stationed overseas and live in non-government housing.',
    eligibility: 'Members stationed OCONUS in areas without BAH',
    amount: 'Based on actual rent up to a maximum, plus utility allowance',
    taxInfo: 'TAX FREE',
    commonIssues: [
      'Must provide lease as proof of rent amount',
      'Includes separate utility/recurring maintenance allowance'
    ]
  },

  cola: {
    name: 'Cost of Living Allowance',
    abbreviation: 'COLA',
    description: 'Allowance to offset higher costs in expensive locations.',
    whyYouHaveIt: 'Your duty station has a higher cost of living than the average US location.',
    eligibility: 'Members at designated high-cost locations (CONUS or OCONUS)',
    amount: 'Varies by location and dependent status',
    taxInfo: 'OCONUS COLA is TAX FREE. CONUS COLA is TAXABLE.',
    commonIssues: [
      'OCONUS rates fluctuate with exchange rates',
      'Ends when you PCS to non-COLA location'
    ],
    references: ['37 U.S.C. § 405']
  },

  fsa: {
    name: 'Family Separation Allowance',
    abbreviation: 'FSA',
    description: 'Additional pay when separated from dependents for 30+ days.',
    whyYouHaveIt: 'You are on orders that separate you from your dependents for more than 30 consecutive days.',
    eligibility: 'Members with dependents, deployed or TDY 30+ days away from family',
    amount: '$250 per month (flat rate)',
    taxInfo: 'TAX FREE',
    commonIssues: [
      'Must be separated 30+ days - no FSA for 29 days',
      'Cannot be receiving BAH "with dependents" at temp duty location',
      'Begins on day 31 of separation'
    ],
    references: ['37 U.S.C. § 427']
  },

  clothing_allowance: {
    name: 'Clothing Maintenance Allowance',
    description: 'Annual allowance to maintain uniforms.',
    whyYouHaveIt: 'Annual payment to help maintain and replace uniform items.',
    eligibility: 'Enlisted members after initial uniform issue',
    amount: 'Varies by service. Standard vs Basic rate based on TIS.',
    taxInfo: 'TAX FREE',
    commonIssues: ['Usually paid annually on enlistment anniversary']
  },

  dislocation_allowance: {
    name: 'Dislocation Allowance',
    abbreviation: 'DLA',
    description: 'One-time payment to help with PCS move expenses.',
    whyYouHaveIt: 'You are executing a Permanent Change of Station (PCS) move.',
    eligibility: 'Members with PCS orders who relocate household',
    amount: 'Based on pay grade and dependency status. Higher rates with dependents.',
    taxInfo: 'TAX FREE',
    commonIssues: [
      'Paid once per PCS, not per household member',
      'May be partial for consecutive overseas tours'
    ],
    references: ['JTR Chapter 5']
  },

  temporary_lodging_expense: {
    name: 'Temporary Lodging Expense',
    abbreviation: 'TLE',
    description: 'Reimbursement for temporary lodging during PCS.',
    whyYouHaveIt: 'You incurred lodging expenses while in transit or waiting for housing during PCS.',
    eligibility: 'Members in PCS status',
    amount: 'Up to 10 days CONUS, 60 days OCONUS (as TLA)',
    taxInfo: 'TAX FREE',
    commonIssues: ['Must have receipts', 'Subject to per diem limits']
  },

  move_in_housing_allowance: {
    name: 'Move-In Housing Allowance',
    abbreviation: 'MIHA',
    description: 'Overseas allowance for move-in housing costs.',
    whyYouHaveIt: 'You are moving into overseas housing and have one-time setup costs.',
    eligibility: 'Members receiving OHA',
    amount: 'One-time payment for security deposits, hookups, etc.',
    taxInfo: 'TAX FREE'
  },

  // Special/Incentive Pays
  hostile_fire_pay: {
    name: 'Hostile Fire Pay',
    abbreviation: 'HFP',
    description: 'Additional pay for service in hostile fire areas.',
    whyYouHaveIt: 'You are serving in or near an area where you are subject to hostile fire or explosion.',
    eligibility: 'Members in designated hostile fire areas or who experience hostile action',
    amount: '$225 per month (flat rate, any portion of month)',
    taxInfo: 'TAX FREE - qualifies for Combat Zone Tax Exclusion',
    commonIssues: [
      'Only one HFP/IDP payment per month even if both apply',
      'One day in zone = full month payment',
      'Retroactive claims require documentation'
    ],
    references: ['37 U.S.C. § 310']
  },

  imminent_danger_pay: {
    name: 'Imminent Danger Pay',
    abbreviation: 'IDP',
    description: 'Additional pay for service in designated imminent danger areas.',
    whyYouHaveIt: 'You are serving in an area designated by DoD as an imminent danger area.',
    eligibility: 'Members in designated IDP areas',
    amount: '$225 per month (flat rate)',
    taxInfo: 'TAX FREE - qualifies for Combat Zone Tax Exclusion',
    commonIssues: [
      'Combined with HFP - you receive one or the other, not both',
      'Area must be on designated list'
    ],
    references: ['37 U.S.C. § 310']
  },

  hardship_duty_pay_location: {
    name: 'Hardship Duty Pay - Location',
    abbreviation: 'HDP-L',
    description: 'Additional pay for assignment to designated hardship locations.',
    whyYouHaveIt: 'You are assigned to a location designated as a hardship duty location.',
    eligibility: 'Members assigned to designated locations',
    amount: '$50-$150/month based on hardship level',
    taxInfo: 'TAXABLE (unless in combat zone)',
    references: ['37 U.S.C. § 305']
  },

  hardship_duty_pay_mission: {
    name: 'Hardship Duty Pay - Mission',
    abbreviation: 'HDP-M',
    description: 'Additional pay for performing designated hardship missions.',
    whyYouHaveIt: 'You are performing duties designated as hardship missions.',
    eligibility: 'Members performing designated hardship missions',
    amount: 'Varies by mission type',
    taxInfo: 'TAXABLE (unless in combat zone)'
  },

  assignment_incentive_pay: {
    name: 'Assignment Incentive Pay',
    abbreviation: 'AIP',
    description: 'Incentive pay for volunteering for hard-to-fill assignments.',
    whyYouHaveIt: 'You volunteered for and are serving in a hard-to-fill assignment.',
    eligibility: 'Members in designated difficult-to-fill positions',
    amount: 'Up to $3,000/month based on assignment',
    taxInfo: 'TAXABLE',
    references: ['37 U.S.C. § 307a']
  },

  special_duty_assignment_pay: {
    name: 'Special Duty Assignment Pay',
    abbreviation: 'SDAP',
    description: 'Additional pay for duties requiring extremely demanding responsibilities.',
    whyYouHaveIt: 'You are serving in a position designated for SDAP (recruiter, drill sergeant, etc.).',
    eligibility: 'Members in designated SDAP positions',
    amount: '$75-$450/month based on duty level (SD-1 through SD-6)',
    taxInfo: 'TAXABLE',
    commonIssues: [
      'Must be in valid SDAP billet',
      'Ends when you leave the position'
    ],
    references: ['37 U.S.C. § 307']
  },

  career_sea_pay: {
    name: 'Career Sea Pay',
    abbreviation: 'CSP',
    description: 'Additional pay for duty aboard ships.',
    whyYouHaveIt: 'You are assigned to sea duty aboard a Navy vessel.',
    eligibility: 'Members assigned to vessels at sea',
    amount: 'Based on pay grade and consecutive years of sea duty',
    taxInfo: 'TAXABLE',
    references: ['37 U.S.C. § 305a']
  },

  career_sea_pay_premium: {
    name: 'Career Sea Pay Premium',
    abbreviation: 'CSP-P',
    description: 'Additional sea pay for high sea time.',
    whyYouHaveIt: 'You have extensive sea duty and qualify for the premium rate.',
    eligibility: 'Members with 36+ months consecutive sea duty',
    amount: '$100/month additional',
    taxInfo: 'TAXABLE'
  },

  submarine_duty_pay: {
    name: 'Submarine Duty Pay',
    abbreviation: 'SUBPAY',
    description: 'Incentive pay for submarine duty.',
    whyYouHaveIt: 'You are qualified and serving aboard a submarine.',
    eligibility: 'Submarine-qualified personnel on submarine duty',
    amount: 'Based on pay grade, $75-$835/month',
    taxInfo: 'TAXABLE',
    references: ['37 U.S.C. § 301c']
  },

  flight_pay: {
    name: 'Aviation Career Incentive Pay',
    abbreviation: 'ACIP/Flight Pay',
    description: 'Monthly incentive pay for aviation duty.',
    whyYouHaveIt: 'You are in an aviation career field and perform regular flight duties.',
    eligibility: 'Rated officers and enlisted aircrew',
    amount: 'Officers: $125-$840/month. Enlisted: $150-$400/month',
    taxInfo: 'TAXABLE',
    commonIssues: [
      'Must meet minimum flight hours (gate months)',
      'Different rates for rated vs career enlisted'
    ],
    references: ['37 U.S.C. § 301a']
  },

  flight_deck_pay: {
    name: 'Flight Deck Duty Pay',
    description: 'Hazardous duty pay for flight deck operations.',
    whyYouHaveIt: 'You perform duties on the flight deck of an aircraft carrier.',
    eligibility: 'Personnel assigned to flight deck duties',
    amount: '$150/month',
    taxInfo: 'TAXABLE',
    references: ['37 U.S.C. § 301']
  },

  demolition_pay: {
    name: 'Demolition Duty Pay',
    description: 'Hazardous duty pay for demolition work.',
    whyYouHaveIt: 'You perform primary demolition duties including explosives handling.',
    eligibility: 'Personnel in primary demolition duties',
    amount: '$150/month',
    taxInfo: 'TAXABLE',
    references: ['37 U.S.C. § 301']
  },

  parachute_duty_pay: {
    name: 'Parachute Duty Pay (Jump Pay)',
    abbreviation: 'Jump Pay',
    description: 'Incentive pay for maintaining parachute qualification.',
    whyYouHaveIt: 'You are in a jump status position and maintain parachute qualification.',
    eligibility: 'Airborne-qualified personnel in jump billets',
    amount: '$150/month (regular), $225/month (HALO)',
    taxInfo: 'TAXABLE',
    commonIssues: [
      'Must perform required jumps to maintain status',
      'Position must be coded as jump billet'
    ],
    references: ['37 U.S.C. § 301']
  },

  diving_duty_pay: {
    name: 'Diving Duty Pay',
    description: 'Incentive pay for diving duties.',
    whyYouHaveIt: 'You are dive-qualified and perform diving duties.',
    eligibility: 'Qualified divers in diving billets',
    amount: '$150-$340/month based on qualification level',
    taxInfo: 'TAXABLE',
    references: ['37 U.S.C. § 304']
  },

  foreign_language_proficiency_pay: {
    name: 'Foreign Language Proficiency Pay',
    abbreviation: 'FLPP',
    description: 'Incentive pay for foreign language skills.',
    whyYouHaveIt: 'You have demonstrated proficiency in a foreign language needed by DoD.',
    eligibility: 'Members with tested language proficiency',
    amount: 'Up to $1,000/month based on language and proficiency level',
    taxInfo: 'TAXABLE',
    commonIssues: [
      'Must pass DLPT annually',
      'Amount varies by language demand and proficiency'
    ],
    references: ['37 U.S.C. § 316']
  },

  hazardous_duty_incentive_pay: {
    name: 'Hazardous Duty Incentive Pay',
    abbreviation: 'HDIP',
    description: 'Pay for performing various hazardous duties.',
    whyYouHaveIt: 'You perform duties officially designated as hazardous.',
    eligibility: 'Members performing designated hazardous duties',
    amount: '$150/month per hazardous duty type',
    taxInfo: 'TAXABLE',
    references: ['37 U.S.C. § 301']
  },

  // Bonuses
  enlistment_bonus: {
    name: 'Enlistment Bonus',
    description: 'Bonus for initial enlistment in critical skills.',
    whyYouHaveIt: 'You enlisted in a career field offering an enlistment bonus.',
    amount: 'Varies by MOS/rating and market conditions',
    taxInfo: 'TAXABLE - federal and state income tax',
    commonIssues: [
      'May be paid in lump sum or installments',
      'Must complete service obligation or repay'
    ]
  },

  reenlistment_bonus: {
    name: 'Reenlistment Bonus',
    description: 'Bonus for reenlisting.',
    whyYouHaveIt: 'You reenlisted and your career field offers a reenlistment bonus.',
    amount: 'Based on multiplier × monthly base pay × years reenlisted',
    taxInfo: 'TAXABLE - but TAX FREE if reenlisted in combat zone',
    commonIssues: ['Combat zone reenlistment makes entire bonus tax-free']
  },

  selective_reenlistment_bonus: {
    name: 'Selective Reenlistment Bonus',
    abbreviation: 'SRB',
    description: 'Targeted bonus for critical skills reenlistment.',
    whyYouHaveIt: 'Your MOS/rating is designated for SRB payments.',
    amount: 'Based on SRB multiplier for your skill',
    taxInfo: 'TAXABLE (TAX FREE if in combat zone)',
    references: ['37 U.S.C. § 308']
  },

  retention_bonus: {
    name: 'Retention Bonus',
    description: 'Bonus to retain members in critical positions.',
    whyYouHaveIt: 'You agreed to extend service in a critical position.',
    taxInfo: 'TAXABLE'
  },

  critical_skills_retention_bonus: {
    name: 'Critical Skills Retention Bonus',
    abbreviation: 'CSRB',
    description: 'Bonus for members with critical skills.',
    whyYouHaveIt: 'You possess skills designated as critical and agreed to continue service.',
    amount: 'Up to $200,000 over career',
    taxInfo: 'TAXABLE',
    references: ['37 U.S.C. § 355']
  },

  special_pay_bonus: {
    name: 'Special Pay/Bonus',
    description: 'Various special pays or bonuses.',
    whyYouHaveIt: 'You qualify for a special pay or bonus not categorized elsewhere.',
    taxInfo: 'Usually TAXABLE - check specific type'
  },

  // Combat Zone
  combat_zone_tax_exclusion: {
    name: 'Combat Zone Tax Exclusion',
    abbreviation: 'CZTE',
    description: 'Tax benefit for service in combat zones.',
    whyYouHaveIt: 'This shows you are receiving CZTE benefits for combat zone service.',
    eligibility: 'Members serving in designated combat zones',
    amount: 'Enlisted: Unlimited. Officers: Capped at highest enlisted pay + HFP/IDP',
    taxInfo: 'This MAKES your other pay TAX FREE - it is not additional pay',
    commonIssues: [
      'One day in zone = entire month tax free',
      'Applies to base pay, bonuses, and most special pays'
    ],
    references: ['26 U.S.C. § 112']
  },

  // Miscellaneous
  per_diem: {
    name: 'Per Diem',
    description: 'Daily allowance for temporary duty travel.',
    whyYouHaveIt: 'You are on TDY/TAD and receiving daily allowances for meals and incidentals.',
    amount: 'Based on location - lodging + M&IE rates',
    taxInfo: 'TAX FREE (reimbursement for expenses)',
    commonIssues: ['Rates vary by location', 'May be reduced for provided meals']
  },

  travel_pay: {
    name: 'Travel Pay',
    description: 'Reimbursement for authorized travel expenses.',
    whyYouHaveIt: 'You incurred travel expenses on official orders.',
    taxInfo: 'TAX FREE (reimbursement)',
    commonIssues: ['Must file travel voucher', 'Subject to JTR rules']
  },

  advance_pay: {
    name: 'Advance Pay',
    description: 'Advance of future pay, typically for PCS.',
    whyYouHaveIt: 'You requested and received an advance on your pay for PCS costs.',
    amount: 'Up to 3 months base pay',
    taxInfo: 'Not taxable (it is an advance, not income) - but creates debt',
    commonIssues: [
      'Must be repaid - will see "Advance Pay Debt" deduction',
      'Interest-free advance'
    ]
  },

  leave_sold: {
    name: 'Leave Sold',
    description: 'Payment for selling back unused leave.',
    whyYouHaveIt: 'You sold back unused leave days (usually at separation/reenlistment).',
    eligibility: 'Members at separation or reenlistment',
    amount: '1/30 of monthly base pay per day, up to 60 days career total',
    taxInfo: 'TAXABLE',
    commonIssues: ['60-day career limit', 'Cannot sell leave if taking terminal leave']
  },

  back_pay: {
    name: 'Back Pay',
    description: 'Retroactive pay adjustment.',
    whyYouHaveIt: 'You are receiving pay owed from a previous period (promotion, correction, etc.).',
    taxInfo: 'TAXABLE in the year received',
    commonIssues: ['May cause tax bracket bump', 'Check that calculation is correct']
  },

  other_entitlement: {
    name: 'Other Entitlement',
    description: 'Miscellaneous entitlement not categorized elsewhere.',
    whyYouHaveIt: 'You have an entitlement that does not fit standard categories.',
    taxInfo: 'Check your LES remarks or contact finance'
  }
};

// ============================================================================
// DEDUCTION DESCRIPTIONS
// ============================================================================

export const DEDUCTION_DESCRIPTIONS: Record<DeductionType, LineItemDescription> = {
  // Taxes
  federal_tax: {
    name: 'Federal Income Tax Withholding',
    abbreviation: 'FED TAX / FITW',
    description: 'Federal income tax withheld from your pay.',
    whyYouHaveIt: 'Required by law. Amount based on your W-4 elections.',
    amount: 'Based on taxable income, filing status, and W-4 allowances',
    taxInfo: 'This IS your tax - withheld to pay your annual tax liability',
    commonIssues: [
      'Update W-4 to change withholding',
      'Tax-free pay (BAH, BAS, HFP) is NOT included in taxable wages',
      'Compare to actual tax liability at year end'
    ]
  },

  state_tax: {
    name: 'State Income Tax Withholding',
    abbreviation: 'STATE TAX',
    description: 'State income tax withheld for your state of legal residence.',
    whyYouHaveIt: 'Your state of legal residence (SLR) has income tax.',
    amount: 'Based on your state\'s tax rates',
    taxInfo: 'Withheld for your state of legal residence, not duty station',
    commonIssues: [
      'Military can maintain residence in tax-free state',
      'SCRA protects you from duty station state tax',
      '9 states have no income tax',
      'Update DD Form 2058 to change SLR'
    ]
  },

  local_tax: {
    name: 'Local Tax',
    description: 'Local/city income tax withholding.',
    whyYouHaveIt: 'Some cities/localities have income tax (rare for military).',
    taxInfo: 'Usually only applies if local residence',
    commonIssues: ['Military typically exempt from duty station local taxes']
  },

  fica_social_security: {
    name: 'Social Security Tax (FICA)',
    abbreviation: 'FICA SOC SEC',
    description: 'Social Security tax (6.2% of taxable income).',
    whyYouHaveIt: 'Required by law for all workers. Funds Social Security benefits.',
    amount: '6.2% of taxable wages up to annual limit ($168,600 in 2024)',
    taxInfo: 'Mandatory - funds your future Social Security benefits',
    commonIssues: [
      'Only applies to taxable pay (not BAH, BAS)',
      'Stops once you hit annual wage limit',
      'Military service counts toward Social Security credits'
    ]
  },

  fica_medicare: {
    name: 'Medicare Tax (FICA)',
    abbreviation: 'FICA MED',
    description: 'Medicare tax (1.45% of taxable income).',
    whyYouHaveIt: 'Required by law. Funds Medicare program.',
    amount: '1.45% of all taxable wages (no limit). Additional 0.9% over $200K.',
    taxInfo: 'Mandatory - funds Medicare coverage',
    commonIssues: ['No wage limit like Social Security', 'High earners pay additional tax']
  },

  // Insurance
  sgli: {
    name: 'Servicemembers\' Group Life Insurance',
    abbreviation: 'SGLI',
    description: 'Life insurance coverage for service members.',
    whyYouHaveIt: 'You elected SGLI coverage (automatic unless declined).',
    eligibility: 'All service members eligible',
    amount: '$24-$25/month for maximum $500,000 coverage',
    taxInfo: 'Post-tax deduction - does not reduce taxable income',
    commonIssues: [
      'Coverage in $50,000 increments up to $500,000',
      'Automatically enrolled at max unless you decline',
      'Update beneficiaries on SGLI Online'
    ],
    references: ['38 U.S.C. § 1967']
  },

  sgli_family: {
    name: 'Family SGLI',
    abbreviation: 'FSGLI',
    description: 'Life insurance for spouse and children.',
    whyYouHaveIt: 'You elected coverage for your spouse and/or children.',
    amount: 'Spouse: Based on coverage amount. Children: $10,000 free coverage.',
    taxInfo: 'Post-tax deduction',
    commonIssues: ['Spouse coverage up to $100,000', 'Children covered free up to $10,000']
  },

  fsgli: {
    name: 'Family SGLI (Spouse)',
    abbreviation: 'FSGLI',
    description: 'Life insurance coverage for your spouse.',
    whyYouHaveIt: 'You elected FSGLI coverage for your spouse.',
    amount: 'Based on coverage amount elected',
    taxInfo: 'Post-tax deduction'
  },

  tricare_dental: {
    name: 'TRICARE Dental Program',
    abbreviation: 'TDP',
    description: 'Dental insurance premium.',
    whyYouHaveIt: 'You enrolled in the TRICARE Dental Program.',
    amount: 'Varies by plan and number of family members enrolled',
    taxInfo: 'Post-tax deduction',
    commonIssues: [
      'Active duty dental is free - this is for dependents',
      'Premium based on single/family enrollment'
    ]
  },

  tricare_vision: {
    name: 'TRICARE Vision Coverage',
    description: 'Vision insurance premium.',
    whyYouHaveIt: 'You enrolled in supplemental vision coverage.',
    taxInfo: 'Post-tax deduction'
  },

  // Retirement
  tsp_traditional: {
    name: 'Thrift Savings Plan (Traditional)',
    abbreviation: 'TSP',
    description: 'Traditional (pre-tax) contributions to your TSP retirement account.',
    whyYouHaveIt: 'You elected to contribute to Traditional TSP.',
    amount: 'Percentage of base pay you elected (1-100%)',
    taxInfo: 'PRE-TAX - reduces your current taxable income. Taxed at withdrawal.',
    commonIssues: [
      '2024 limit: $23,000 (plus $7,500 catch-up if 50+)',
      'BRS members get 1% automatic + up to 4% matching',
      'Can also contribute from bonuses and special pays',
      'Tax-exempt combat zone contributions stay tax-free forever'
    ],
    references: ['5 U.S.C. § 8432']
  },

  tsp_roth: {
    name: 'Thrift Savings Plan (Roth)',
    abbreviation: 'TSP ROTH',
    description: 'Roth (after-tax) contributions to your TSP retirement account.',
    whyYouHaveIt: 'You elected to contribute to Roth TSP.',
    amount: 'Percentage of base pay you elected',
    taxInfo: 'POST-TAX - no current tax benefit, but grows and withdraws tax-free.',
    commonIssues: [
      'Same $23,000 annual limit (combined with Traditional)',
      'Good option if you expect higher taxes in retirement',
      'Combat zone: Consider traditional for tax-exempt contributions'
    ]
  },

  tsp_loan_repayment: {
    name: 'TSP Loan Repayment',
    description: 'Repayment of loan taken from your TSP account.',
    whyYouHaveIt: 'You took a loan from your TSP and are repaying it.',
    amount: 'Based on loan amount and repayment term',
    taxInfo: 'Not tax-deductible (repaying yourself)',
    commonIssues: [
      'Must repay within 5 years (15 for home purchase)',
      'Interest goes back to your own account',
      'Missed payments can result in taxable distribution'
    ]
  },

  sbp: {
    name: 'Survivor Benefit Plan',
    abbreviation: 'SBP',
    description: 'Premium for survivor benefits after your death.',
    whyYouHaveIt: 'You elected SBP coverage for your survivors (typically at retirement).',
    amount: '6.5% of covered base pay',
    taxInfo: 'PRE-TAX - reduces taxable income',
    commonIssues: [
      'Provides 55% of covered amount to survivors',
      'Must elect within 1 year of retirement',
      'Can cover spouse, children, or other insurable interest'
    ],
    references: ['10 U.S.C. § 1447-1455']
  },

  // Debt/Recovery
  advance_pay_debt: {
    name: 'Advance Pay Debt',
    description: 'Repayment of advance pay received.',
    whyYouHaveIt: 'You received an advance payment that must be repaid.',
    amount: 'Based on advance amount and repayment schedule (usually 12 months)',
    taxInfo: 'Not taxable (repaying an advance)',
    commonIssues: [
      'Usually from PCS advance pay',
      'Can request extended repayment if hardship'
    ]
  },

  dpp: {
    name: 'Debt to Government (DPP)',
    abbreviation: 'DPP',
    description: 'Repayment of debt owed to the government.',
    whyYouHaveIt: 'You have a debt to the government being collected from your pay.',
    taxInfo: 'Not tax-deductible',
    commonIssues: [
      'Could be overpayment, lost equipment, etc.',
      'Contact finance to understand and dispute if needed'
    ]
  },

  overpayment_recovery: {
    name: 'Overpayment Recovery',
    description: 'Recovery of pay you received but were not entitled to.',
    whyYouHaveIt: 'You were overpaid and the overpayment is being recovered.',
    taxInfo: 'May receive tax adjustment if overpayment was in prior year',
    commonIssues: [
      'Common after BAH or entitlement status changes',
      'Can request repayment plan',
      'If wrong, dispute with finance'
    ]
  },

  government_debt: {
    name: 'Government Debt Collection',
    description: 'Collection of debt owed to government agencies.',
    whyYouHaveIt: 'A government agency is collecting a debt from your pay.',
    taxInfo: 'Not tax-deductible',
    commonIssues: ['Could be student loans, VA debt, etc.']
  },

  uniform_initial_issue: {
    name: 'Uniform Initial Issue Debt',
    description: 'Repayment for uniform items.',
    whyYouHaveIt: 'You have a debt for uniform items.',
    taxInfo: 'Not tax-deductible',
    commonIssues: ['Usually cleared before leaving training']
  },

  // Voluntary
  aer_donation: {
    name: 'Army Emergency Relief',
    abbreviation: 'AER',
    description: 'Voluntary donation to Army Emergency Relief.',
    whyYouHaveIt: 'You elected to donate to AER.',
    taxInfo: 'CHARITABLE - may be tax-deductible if you itemize',
    commonIssues: ['Voluntary - can stop anytime', 'Provides emergency assistance to soldiers']
  },

  afaf_donation: {
    name: 'Air Force Assistance Fund',
    abbreviation: 'AFAF',
    description: 'Voluntary donation to AFAF.',
    whyYouHaveIt: 'You elected to donate to AFAF.',
    taxInfo: 'CHARITABLE - may be tax-deductible',
    commonIssues: ['Supports Air Force families in need']
  },

  navy_relief_donation: {
    name: 'Navy-Marine Corps Relief Society',
    abbreviation: 'NMCRS',
    description: 'Voluntary donation to Navy-Marine Corps Relief.',
    whyYouHaveIt: 'You elected to donate to NMCRS.',
    taxInfo: 'CHARITABLE - may be tax-deductible'
  },

  cfc_donation: {
    name: 'Combined Federal Campaign',
    abbreviation: 'CFC',
    description: 'Voluntary charitable donation through CFC.',
    whyYouHaveIt: 'You pledged a donation through the Combined Federal Campaign.',
    taxInfo: 'CHARITABLE - may be tax-deductible',
    commonIssues: ['Annual campaign - pledges continue until changed']
  },

  savings_bond: {
    name: 'Savings Bond Purchase',
    description: 'Purchase of U.S. Savings Bonds.',
    whyYouHaveIt: 'You elected to purchase savings bonds through payroll deduction.',
    taxInfo: 'Not a deduction - converting pay to bonds. Bond interest is taxable.',
    commonIssues: ['Bonds sent to Treasury Direct account']
  },

  // Miscellaneous
  meal_deduction: {
    name: 'Meal Deduction',
    description: 'Deduction for meals provided.',
    whyYouHaveIt: 'You are on a meal card and meals are provided.',
    amount: 'Offsets BAS you would otherwise receive',
    taxInfo: 'Reduces pay (meals are provided instead)',
    commonIssues: [
      'Common for junior enlisted in barracks',
      'Usually means you receive reduced or no BAS'
    ]
  },

  garnishment: {
    name: 'Court-Ordered Garnishment',
    description: 'Court-ordered collection from your pay.',
    whyYouHaveIt: 'A court has ordered garnishment of your wages.',
    taxInfo: 'Not tax-deductible',
    commonIssues: [
      'Must comply with court order',
      'Contact JAG if you believe it is in error'
    ]
  },

  child_support: {
    name: 'Child Support',
    description: 'Court-ordered child support payment.',
    whyYouHaveIt: 'You have a child support obligation being collected from your pay.',
    taxInfo: 'NOT tax-deductible (child support is not deductible)',
    commonIssues: [
      'Amount set by court order',
      'Contact family support center if issues'
    ]
  },

  alimony: {
    name: 'Alimony/Spousal Support',
    description: 'Court-ordered spousal support payment.',
    whyYouHaveIt: 'You have an alimony/spousal support obligation.',
    taxInfo: 'NOT tax-deductible for divorces after 2018',
    commonIssues: ['Pre-2019 divorces may have different tax treatment']
  },

  car_payment: {
    name: 'Vehicle Allotment',
    description: 'Allotment for vehicle payment.',
    whyYouHaveIt: 'You set up an allotment to a car payment.',
    taxInfo: 'Not tax-deductible',
    commonIssues: ['Voluntary - can cancel anytime']
  },

  other_deduction: {
    name: 'Other Deduction',
    description: 'Miscellaneous deduction.',
    whyYouHaveIt: 'Check your LES remarks or contact finance for details.',
    taxInfo: 'Varies - check specific type'
  }
};

// ============================================================================
// ALLOTMENT DESCRIPTIONS
// ============================================================================

export const ALLOTMENT_DESCRIPTIONS: Record<AllotmentType, LineItemDescription> = {
  savings: {
    name: 'Savings Allotment',
    description: 'Automatic transfer to your bank account.',
    whyYouHaveIt: 'You set up an allotment to transfer money to a savings or checking account.',
    taxInfo: 'Not a deduction - just redirecting where your pay goes',
    commonIssues: ['Great for automatic savings', 'Can have multiple allotments']
  },

  car_payment: {
    name: 'Vehicle Payment Allotment',
    description: 'Automatic payment to vehicle lender.',
    whyYouHaveIt: 'You set up an allotment to pay your car loan automatically.',
    taxInfo: 'Not tax-deductible',
    commonIssues: ['Ensure amount matches payment to avoid late fees']
  },

  insurance_premium: {
    name: 'Insurance Allotment',
    description: 'Automatic payment to insurance company.',
    whyYouHaveIt: 'You set up an allotment for insurance premiums (auto, life, etc.).',
    taxInfo: 'Generally not tax-deductible (personal insurance)',
    commonIssues: ['Common for USAA, Geico, etc.']
  },

  loan_payment: {
    name: 'Loan Payment Allotment',
    description: 'Automatic payment to a lender.',
    whyYouHaveIt: 'You set up an allotment to pay a loan.',
    taxInfo: 'Not tax-deductible',
    commonIssues: ['Can be for any type of loan']
  },

  child_support_voluntary: {
    name: 'Voluntary Child Support',
    description: 'Voluntary child support payment.',
    whyYouHaveIt: 'You voluntarily set up child support payments.',
    taxInfo: 'NOT tax-deductible',
    commonIssues: ['Different from court-ordered garnishment']
  },

  spousal_support: {
    name: 'Spousal Support Allotment',
    description: 'Voluntary spousal support payment.',
    whyYouHaveIt: 'You set up voluntary spousal support payments.',
    taxInfo: 'NOT tax-deductible for post-2018 divorces'
  },

  rent_payment: {
    name: 'Rent Payment Allotment',
    description: 'Automatic rent payment.',
    whyYouHaveIt: 'You set up an allotment to pay rent directly.',
    taxInfo: 'Not tax-deductible',
    commonIssues: ['Useful for ensuring rent is always paid on time']
  },

  charity: {
    name: 'Charitable Allotment',
    description: 'Automatic charitable donation.',
    whyYouHaveIt: 'You set up regular charitable donations.',
    taxInfo: 'May be tax-deductible if you itemize',
    commonIssues: ['Keep records for tax purposes']
  },

  other_allotment: {
    name: 'Other Allotment',
    description: 'Other voluntary allotment.',
    whyYouHaveIt: 'You set up an allotment for another purpose.',
    taxInfo: 'Varies by type'
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get description for any line item type
 */
export function getLineItemDescription(
  type: EntitlementType | DeductionType | AllotmentType,
  category: 'entitlement' | 'deduction' | 'allotment'
): LineItemDescription | undefined {
  switch (category) {
    case 'entitlement':
      return ENTITLEMENT_DESCRIPTIONS[type as EntitlementType];
    case 'deduction':
      return DEDUCTION_DESCRIPTIONS[type as DeductionType];
    case 'allotment':
      return ALLOTMENT_DESCRIPTIONS[type as AllotmentType];
    default:
      return undefined;
  }
}

/**
 * Get a quick explanation for why an item changed
 */
export function getChangeExplanation(
  type: EntitlementType | DeductionType,
  changeType: 'added' | 'removed' | 'increased' | 'decreased'
): string {
  const explanations: Record<string, Record<string, string>> = {
    bah: {
      added: 'BAH started - you may have moved off-base or gained dependents',
      removed: 'BAH stopped - you may have moved to government quarters',
      increased: 'BAH increased - could be pay raise, location change, or gaining dependents',
      decreased: 'BAH decreased - could be rate update, losing dependent status, or location change'
    },
    bas: {
      added: 'BAS started - you may have been authorized separate rations',
      removed: 'BAS stopped - you may have been placed on meal card',
      increased: 'BAS increased - annual rate increase',
      decreased: 'BAS decreased - unusual, check with finance'
    },
    fsa: {
      added: 'FSA started - you have been separated from dependents 30+ days',
      removed: 'FSA stopped - separation ended or did not exceed 30 days',
      increased: 'FSA does not vary in amount',
      decreased: 'FSA does not vary in amount'
    },
    hostile_fire_pay: {
      added: 'HFP started - you entered a hostile fire area',
      removed: 'HFP stopped - you left the hostile fire area',
      increased: 'HFP is a flat rate and should not vary',
      decreased: 'HFP is a flat rate and should not vary'
    },
    federal_tax: {
      added: 'Federal tax withholding started',
      removed: 'Federal tax withholding stopped - unusual, verify W-4',
      increased: 'Tax increased - could be higher pay, fewer allowances, or rate change',
      decreased: 'Tax decreased - could be more allowances, tax-free pay, or CZTE'
    },
    tsp_traditional: {
      added: 'TSP contributions started',
      removed: 'TSP contributions stopped',
      increased: 'TSP contribution percentage increased',
      decreased: 'TSP contribution percentage decreased'
    }
  };

  return explanations[type]?.[changeType] || `${type} ${changeType}`;
}

/**
 * Common LES items for quick entry
 */
export const COMMON_LES_ITEMS = {
  entitlements: [
    'base_pay',
    'bah',
    'bas',
    'hostile_fire_pay',
    'fsa',
    'cola',
    'flight_pay',
    'parachute_duty_pay',
    'special_duty_assignment_pay'
  ] as EntitlementType[],
  deductions: [
    'federal_tax',
    'state_tax',
    'fica_social_security',
    'fica_medicare',
    'sgli',
    'tricare_dental',
    'tsp_traditional',
    'tsp_roth'
  ] as DeductionType[]
};
