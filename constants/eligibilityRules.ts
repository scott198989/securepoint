/**
 * Eligibility Rules
 * Special pay requirements and wizard configurations
 */

import {
  PayTypeInfo,
  EligibilityQuestion,
  EligibilityWizardConfig,
  EligibilityRule,
  WizardStep,
  PayTypeIdentifier,
} from '../types/eligibility';
import { SpecialPayType } from '../types/payProfile';

// ============================================================================
// PAY TYPE INFORMATION
// ============================================================================

export const PAY_TYPE_INFO: Record<string, PayTypeInfo> = {
  // SKILL-BASED PAYS
  flightPay: {
    type: 'flightPay',
    category: 'skill',
    name: 'Aviation Career Incentive Pay',
    shortName: 'ACIP/Flight Pay',
    description: 'Monthly incentive pay for personnel in aviation career fields who maintain flight status.',
    generalRequirements: [
      'Be in an aviation career field (pilot, navigator, flight officer, aircrew)',
      'Maintain current flight status',
      'Meet minimum monthly flight hour requirements',
      'Hold required aeronautical ratings',
    ],
    disqualifyingFactors: [
      'Loss of flight status',
      'Failure to meet flight hour minimums',
      'Removal from aeronautical orders',
      'Medical grounding (may receive reduced rate)',
    ],
    payRange: { min: 125, max: 1000 },
    isTaxable: true,
    frequency: 'monthly',
    howToApply: [
      'Verify flight status on aeronautical orders',
      'Ensure flight hours are logged in ARMS/SLFP',
      'Contact unit aviation resource manager',
    ],
    requiredDocuments: [
      'Aeronautical orders',
      'Flight hour logs',
      'Aviation physiology training certificate',
    ],
    approvalAuthority: 'Unit Commander',
    typicalProcessingTime: '30-60 days',
    regulation: '37 U.S.C. 301a',
  },

  divePay: {
    type: 'divePay',
    category: 'skill',
    name: 'Diving Duty Pay',
    shortName: 'Dive Pay',
    description: 'Special pay for qualified divers performing diving duty.',
    generalRequirements: [
      'Hold a military diving qualification (SCUBA, MK16, surface-supplied)',
      'Be assigned to diving duty',
      'Maintain diving currency requirements',
      'Pass annual diving physical',
    ],
    disqualifyingFactors: [
      'Loss of diving qualification',
      'Medical disqualification',
      'Not assigned to diving duty billet',
    ],
    payRange: { min: 150, max: 340 },
    isTaxable: true,
    frequency: 'monthly',
    howToApply: [
      'Verify diving qualification in service record',
      'Obtain diving duty orders',
      'Submit dive pay request to admin',
    ],
    requiredDocuments: [
      'Diving qualification certificate',
      'Diving physical examination',
      'Diving duty orders',
    ],
    approvalAuthority: 'Unit Commander',
    typicalProcessingTime: '30-45 days',
    regulation: '37 U.S.C. 304',
  },

  parachutePay: {
    type: 'parachutePay',
    category: 'skill',
    name: 'Parachute Duty Pay',
    shortName: 'Jump Pay',
    description: 'Special pay for qualified parachutists performing jump duty.',
    generalRequirements: [
      'Hold military parachutist qualification',
      'Be assigned to parachute duty',
      'Meet minimum jump requirements (1 jump per 3 months)',
      'Maintain current parachutist physical',
    ],
    disqualifyingFactors: [
      'Loss of parachutist qualification',
      'Medical disqualification',
      'Failure to meet minimum jump requirements',
    ],
    payRange: { min: 150, max: 225 },
    isTaxable: true,
    frequency: 'monthly',
    howToApply: [
      'Verify parachutist qualification',
      'Ensure jump log is current',
      'Submit request through chain of command',
    ],
    requiredDocuments: [
      'Parachutist badge orders',
      'Jump log',
      'Physical examination',
    ],
    approvalAuthority: 'Unit Commander',
    typicalProcessingTime: '30 days',
    regulation: '37 U.S.C. 304',
  },

  demolitionPay: {
    type: 'demolitionPay',
    category: 'skill',
    name: 'Demolition Duty Pay',
    shortName: 'Demo Pay',
    description: 'Special pay for personnel assigned to demolition duty.',
    generalRequirements: [
      'Hold EOD, combat engineer, or demolition qualification',
      'Be assigned to demolition duty',
      'Maintain required certifications',
    ],
    disqualifyingFactors: [
      'Loss of demolition qualification',
      'Not assigned to demolition duty',
      'Security clearance revocation',
    ],
    payRange: { min: 150, max: 250 },
    isTaxable: true,
    frequency: 'monthly',
    howToApply: [
      'Verify demolition qualification',
      'Obtain assignment orders to demo duty',
      'Submit pay request to finance',
    ],
    requiredDocuments: [
      'Qualification certificate',
      'Assignment orders',
      'Security clearance verification',
    ],
    approvalAuthority: 'Unit Commander',
    typicalProcessingTime: '30-45 days',
    regulation: '37 U.S.C. 304',
  },

  // HAZARD PAYS
  hazardousDutyPay: {
    type: 'hazardousDutyPay',
    category: 'hazard',
    name: 'Hazardous Duty Incentive Pay',
    shortName: 'HDIP',
    description: 'Additional pay for performing hazardous duties such as flight deck operations, toxic fuel handling, or other dangerous activities.',
    generalRequirements: [
      'Be assigned to duty involving physical hazards',
      'Perform hazardous duty on a regular basis',
      'Meet specific duty requirements for the hazard type',
    ],
    disqualifyingFactors: [
      'Transfer to non-hazardous duty',
      'Medical disqualification',
      'Administrative removal from hazardous duty',
    ],
    payRange: { min: 150, max: 250 },
    isTaxable: true,
    frequency: 'monthly',
    howToApply: [
      'Verify assignment to hazardous duty',
      'Document hazardous duty performance',
      'Submit request through chain of command',
    ],
    requiredDocuments: [
      'Assignment orders',
      'Duty performance documentation',
      'Medical clearance (if applicable)',
    ],
    approvalAuthority: 'Unit Commander',
    typicalProcessingTime: '30-60 days',
    regulation: '37 U.S.C. 301',
  },

  hostileFirePay: {
    type: 'hostileFirePay',
    category: 'hazard',
    name: 'Hostile Fire Pay / Imminent Danger Pay',
    shortName: 'HFP/IDP',
    description: 'Tax-free pay for service in designated hostile fire or imminent danger areas.',
    generalRequirements: [
      'Be deployed to or pass through designated HFP/IDP area',
      'Serve at least one day in the area during a month',
      'Area must be on the official HFP/IDP location list',
    ],
    disqualifyingFactors: [
      'Not present in designated area',
      'Area removed from HFP/IDP list',
    ],
    payRange: { min: 225, max: 225 },
    isTaxable: false,
    frequency: 'monthly',
    howToApply: [
      'Automatic when deployed to designated areas',
      'Verify deployment orders to HFP/IDP location',
      'Contact finance if not receiving after deployment',
    ],
    requiredDocuments: [
      'Deployment orders',
      'Proof of presence in designated area',
    ],
    approvalAuthority: 'Automatic/Finance',
    typicalProcessingTime: 'Automatic upon deployment',
    regulation: '37 U.S.C. 310',
  },

  // ASSIGNMENT PAYS
  specialDutyAssignmentPay: {
    type: 'specialDutyAssignmentPay',
    category: 'assignment',
    name: 'Special Duty Assignment Pay',
    shortName: 'SDAP',
    description: 'Additional pay for service members in designated special duty assignments requiring additional responsibility or skills.',
    generalRequirements: [
      'Be assigned to a designated SDAP position',
      'Meet all qualification requirements for the position',
      'Be performing duties in the SDAP billet',
    ],
    disqualifyingFactors: [
      'Transfer from SDAP position',
      'Loss of required qualification',
      'Position removed from SDAP list',
    ],
    payRange: { min: 75, max: 450 },
    isTaxable: true,
    frequency: 'monthly',
    howToApply: [
      'Verify position is SDAP-coded',
      'Ensure assignment orders reflect SDAP duty',
      'Coordinate with personnel office',
    ],
    requiredDocuments: [
      'Assignment orders',
      'Position description showing SDAP coding',
      'Qualification documentation',
    ],
    approvalAuthority: 'Personnel Command',
    typicalProcessingTime: '30-60 days',
    regulation: '37 U.S.C. 307',
  },

  foreignLanguagePay: {
    type: 'foreignLanguagePay',
    category: 'skill',
    name: 'Foreign Language Proficiency Pay',
    shortName: 'FLPP',
    description: 'Monthly pay for maintaining proficiency in a foreign language needed by the military.',
    generalRequirements: [
      'Score qualifying level on DLPT (2/2 or higher for most languages)',
      'Language must be on the DoD Strategic Language List',
      'Maintain proficiency through periodic testing',
    ],
    disqualifyingFactors: [
      'DLPT score below qualifying level',
      'Failure to take scheduled proficiency test',
      'Language removed from strategic list',
    ],
    payRange: { min: 100, max: 500 },
    isTaxable: true,
    frequency: 'monthly',
    howToApply: [
      'Take DLPT in strategic language',
      'Ensure scores are recorded in system',
      'Apply through personnel office',
    ],
    requiredDocuments: [
      'DLPT score sheet',
      'Language proficiency certificate',
    ],
    approvalAuthority: 'Personnel Command',
    typicalProcessingTime: '30-45 days',
    regulation: '37 U.S.C. 316',
  },

  combatZoneTaxExclusion: {
    type: 'combatZoneTaxExclusion',
    category: 'location',
    name: 'Combat Zone Tax Exclusion',
    shortName: 'CZTE',
    description: 'Federal income tax exclusion for service in designated combat zones.',
    generalRequirements: [
      'Serve in a designated combat zone',
      'Serve at least one day in the zone during a calendar month',
      'Be on active duty status',
    ],
    disqualifyingFactors: [
      'Not present in combat zone during month',
      'Zone removed from combat designation',
    ],
    payRange: { min: 0, max: 0 }, // Varies based on income
    isTaxable: false,
    frequency: 'monthly',
    howToApply: [
      'Automatic when deployed to combat zone',
      'Verify deployment orders',
      'Notify finance of any issues',
    ],
    requiredDocuments: [
      'Deployment orders',
      'Proof of combat zone service',
    ],
    approvalAuthority: 'Automatic/Finance',
    typicalProcessingTime: 'Automatic',
    regulation: '26 U.S.C. 112',
  },

  careerSeaPayPremium: {
    type: 'careerSeaPayPremium',
    category: 'assignment',
    name: 'Career Sea Pay Premium',
    shortName: 'CSP',
    description: 'Additional pay for Navy/Coast Guard personnel assigned to sea duty.',
    generalRequirements: [
      'Be in Navy or Coast Guard',
      'Be assigned to a ship or deployable unit',
      'Meet minimum sea time requirements',
    ],
    disqualifyingFactors: [
      'Transfer to shore duty',
      'Medical disqualification from sea duty',
    ],
    payRange: { min: 50, max: 750 },
    isTaxable: true,
    frequency: 'monthly',
    howToApply: [
      'Automatic for qualified personnel',
      'Verify sea duty assignment',
      'Contact personnel if not receiving',
    ],
    requiredDocuments: [
      'Sea duty orders',
      'Ship assignment verification',
    ],
    approvalAuthority: 'Automatic/Personnel',
    typicalProcessingTime: 'Automatic upon assignment',
    regulation: '37 U.S.C. 305a',
  },

  hardshipDutyPay: {
    type: 'hardshipDutyPay',
    category: 'location',
    name: 'Hardship Duty Pay - Location',
    shortName: 'HDP-L',
    description: 'Additional pay for service at designated hardship duty locations.',
    generalRequirements: [
      'Be assigned to a designated hardship location',
      'Serve minimum time at location',
      'Location must be on HDP-L list',
    ],
    disqualifyingFactors: [
      'Transfer from hardship location',
      'Location removed from HDP list',
    ],
    payRange: { min: 50, max: 150 },
    isTaxable: true,
    frequency: 'monthly',
    howToApply: [
      'Automatic for designated locations',
      'Verify assignment orders',
      'Contact finance if not receiving',
    ],
    requiredDocuments: [
      'PCS or TDY orders to hardship location',
    ],
    approvalAuthority: 'Automatic',
    typicalProcessingTime: 'Automatic upon arrival',
    regulation: '37 U.S.C. 305',
  },
};

// ============================================================================
// ELIGIBILITY QUESTIONS
// ============================================================================

export const GENERAL_QUESTIONS: EligibilityQuestion[] = [
  {
    id: 'service_status',
    payType: 'general',
    inputType: 'select',
    question: 'What is your current military status?',
    helpText: 'Select your active duty, reserve, or guard status',
    options: [
      { value: 'active_duty', label: 'Active Duty', description: 'Full-time military service' },
      { value: 'reserve', label: 'Reserve', description: 'Part-time service with federal reserve component' },
      { value: 'national_guard', label: 'National Guard', description: 'State National Guard (Army or Air)' },
      { value: 'retired', label: 'Retired', description: 'Military retired status' },
    ],
    required: true,
  },
  {
    id: 'branch',
    payType: 'general',
    inputType: 'select',
    question: 'What branch of service are you in?',
    options: [
      { value: 'army', label: 'Army' },
      { value: 'navy', label: 'Navy' },
      { value: 'air_force', label: 'Air Force' },
      { value: 'marine_corps', label: 'Marine Corps' },
      { value: 'coast_guard', label: 'Coast Guard' },
      { value: 'space_force', label: 'Space Force' },
    ],
    required: true,
  },
  {
    id: 'pay_grade',
    payType: 'general',
    inputType: 'select',
    question: 'What is your current pay grade?',
    options: [
      { value: 'E1', label: 'E-1' },
      { value: 'E2', label: 'E-2' },
      { value: 'E3', label: 'E-3' },
      { value: 'E4', label: 'E-4' },
      { value: 'E5', label: 'E-5' },
      { value: 'E6', label: 'E-6' },
      { value: 'E7', label: 'E-7' },
      { value: 'E8', label: 'E-8' },
      { value: 'E9', label: 'E-9' },
      { value: 'W1', label: 'W-1' },
      { value: 'W2', label: 'W-2' },
      { value: 'W3', label: 'W-3' },
      { value: 'W4', label: 'W-4' },
      { value: 'W5', label: 'W-5' },
      { value: 'O1', label: 'O-1' },
      { value: 'O2', label: 'O-2' },
      { value: 'O3', label: 'O-3' },
      { value: 'O4', label: 'O-4' },
      { value: 'O5', label: 'O-5' },
      { value: 'O6', label: 'O-6' },
      { value: 'O7', label: 'O-7' },
      { value: 'O8', label: 'O-8' },
      { value: 'O9', label: 'O-9' },
      { value: 'O10', label: 'O-10' },
    ],
    required: true,
  },
  {
    id: 'years_service',
    payType: 'general',
    inputType: 'number',
    question: 'How many years of military service do you have?',
    helpText: 'Include all active and reserve time',
    placeholder: 'Enter years',
    required: true,
    validation: {
      min: 0,
      max: 50,
      errorMessage: 'Years of service must be between 0 and 50',
    },
  },
];

export const FLIGHT_PAY_QUESTIONS: EligibilityQuestion[] = [
  {
    id: 'flight_has_rating',
    payType: 'flightPay',
    inputType: 'boolean',
    question: 'Do you hold a military aviation rating (pilot, navigator, flight officer, or enlisted aircrew)?',
    required: true,
  },
  {
    id: 'flight_status',
    payType: 'flightPay',
    inputType: 'select',
    question: 'What is your current flight status?',
    showIf: { questionId: 'flight_has_rating', operator: 'equals', value: true },
    options: [
      { value: 'current', label: 'Current', description: 'On flying status and meeting minimums' },
      { value: 'grounded_medical', label: 'Grounded (Medical)', description: 'Temporarily grounded for medical reasons' },
      { value: 'grounded_admin', label: 'Grounded (Administrative)', description: 'Grounded for non-medical reasons' },
      { value: 'dnif', label: 'DNIF', description: 'Duties Not Including Flying' },
    ],
    required: true,
  },
  {
    id: 'flight_years_aviation',
    payType: 'flightPay',
    inputType: 'number',
    question: 'How many years have you been in aviation?',
    helpText: 'Count from date of aviation rating',
    showIf: { questionId: 'flight_has_rating', operator: 'equals', value: true },
    required: true,
    validation: { min: 0, max: 40 },
  },
  {
    id: 'flight_meets_minimums',
    payType: 'flightPay',
    inputType: 'boolean',
    question: 'Are you meeting your minimum monthly flight hour requirements?',
    showIf: { questionId: 'flight_status', operator: 'equals', value: 'current' },
    required: true,
  },
];

export const DIVE_PAY_QUESTIONS: EligibilityQuestion[] = [
  {
    id: 'dive_qualified',
    payType: 'divePay',
    inputType: 'boolean',
    question: 'Do you hold a military diving qualification?',
    required: true,
  },
  {
    id: 'dive_type',
    payType: 'divePay',
    inputType: 'select',
    question: 'What type of diving qualification do you hold?',
    showIf: { questionId: 'dive_qualified', operator: 'equals', value: true },
    options: [
      { value: 'scuba', label: 'SCUBA', description: 'Self-Contained Underwater Breathing Apparatus' },
      { value: 'surface_supplied', label: 'Surface-Supplied', description: 'Air supplied from surface' },
      { value: 'mixed_gas', label: 'Mixed Gas', description: 'Helium-oxygen or other mixed gas' },
      { value: 'saturation', label: 'Saturation', description: 'Saturation diving qualified' },
    ],
    required: true,
  },
  {
    id: 'dive_assigned',
    payType: 'divePay',
    inputType: 'boolean',
    question: 'Are you currently assigned to diving duty?',
    showIf: { questionId: 'dive_qualified', operator: 'equals', value: true },
    required: true,
  },
  {
    id: 'dive_physical_current',
    payType: 'divePay',
    inputType: 'boolean',
    question: 'Is your diving physical examination current?',
    showIf: { questionId: 'dive_assigned', operator: 'equals', value: true },
    required: true,
  },
];

export const JUMP_PAY_QUESTIONS: EligibilityQuestion[] = [
  {
    id: 'jump_qualified',
    payType: 'parachutePay',
    inputType: 'boolean',
    question: 'Do you hold a military parachutist qualification?',
    required: true,
  },
  {
    id: 'jump_type',
    payType: 'parachutePay',
    inputType: 'select',
    question: 'What parachutist qualification do you hold?',
    showIf: { questionId: 'jump_qualified', operator: 'equals', value: true },
    options: [
      { value: 'basic', label: 'Basic Parachutist', description: 'Initial jump qualification' },
      { value: 'senior', label: 'Senior Parachutist', description: '30+ jumps with leadership jumps' },
      { value: 'master', label: 'Master Parachutist', description: '65+ jumps with combat equipment' },
      { value: 'halo', label: 'HALO/HAHO', description: 'High Altitude Low/High Opening' },
    ],
    required: true,
  },
  {
    id: 'jump_assigned',
    payType: 'parachutePay',
    inputType: 'boolean',
    question: 'Are you currently assigned to a jump billet/position?',
    showIf: { questionId: 'jump_qualified', operator: 'equals', value: true },
    required: true,
  },
  {
    id: 'jump_currency',
    payType: 'parachutePay',
    inputType: 'boolean',
    question: 'Have you completed at least one jump in the last 3 months?',
    showIf: { questionId: 'jump_assigned', operator: 'equals', value: true },
    required: true,
  },
];

export const HAZARD_PAY_QUESTIONS: EligibilityQuestion[] = [
  {
    id: 'hazard_duty_type',
    payType: 'hazardousDutyPay',
    inputType: 'multiselect',
    question: 'Which hazardous duties do you perform? (Select all that apply)',
    options: [
      { value: 'flight_deck', label: 'Flight Deck Operations', description: 'Aircraft carrier/ship flight deck' },
      { value: 'toxic_fuels', label: 'Toxic Fuel Handling', description: 'Handling toxic propellants or fuels' },
      { value: 'explosives', label: 'Explosives Handling', description: 'Working with explosives/munitions' },
      { value: 'laboratory', label: 'Laboratory Hazards', description: 'Chemical/biological lab work' },
    ],
    required: true,
  },
  {
    id: 'hazard_frequency',
    payType: 'hazardousDutyPay',
    inputType: 'select',
    question: 'How often do you perform this hazardous duty?',
    options: [
      { value: 'daily', label: 'Daily', description: 'Part of regular daily duties' },
      { value: 'weekly', label: 'Weekly', description: 'Several times per week' },
      { value: 'monthly', label: 'Monthly', description: 'At least once per month' },
      { value: 'occasional', label: 'Occasional', description: 'Less than monthly' },
    ],
    required: true,
  },
];

export const HOSTILE_FIRE_QUESTIONS: EligibilityQuestion[] = [
  {
    id: 'hfp_deployed',
    payType: 'hostileFirePay',
    inputType: 'boolean',
    question: 'Are you currently deployed to or have you recently served in a combat zone or hostile fire area?',
    required: true,
  },
  {
    id: 'hfp_location',
    payType: 'hostileFirePay',
    inputType: 'select',
    question: 'Which area did you serve in?',
    showIf: { questionId: 'hfp_deployed', operator: 'equals', value: true },
    options: [
      { value: 'afghanistan', label: 'Afghanistan' },
      { value: 'iraq', label: 'Iraq' },
      { value: 'syria', label: 'Syria' },
      { value: 'yemen', label: 'Yemen' },
      { value: 'somalia', label: 'Somalia' },
      { value: 'other', label: 'Other Designated Area' },
    ],
    required: true,
  },
  {
    id: 'hfp_days_served',
    payType: 'hostileFirePay',
    inputType: 'number',
    question: 'How many days did you serve in this area during the month?',
    helpText: 'Even 1 day qualifies for full month of HFP/IDP',
    showIf: { questionId: 'hfp_deployed', operator: 'equals', value: true },
    required: true,
    validation: { min: 1, max: 31 },
  },
];

export const LANGUAGE_PAY_QUESTIONS: EligibilityQuestion[] = [
  {
    id: 'flpp_language',
    payType: 'foreignLanguagePay',
    inputType: 'boolean',
    question: 'Do you speak a foreign language?',
    required: true,
  },
  {
    id: 'flpp_tested',
    payType: 'foreignLanguagePay',
    inputType: 'boolean',
    question: 'Have you taken the Defense Language Proficiency Test (DLPT) in this language?',
    showIf: { questionId: 'flpp_language', operator: 'equals', value: true },
    required: true,
  },
  {
    id: 'flpp_score',
    payType: 'foreignLanguagePay',
    inputType: 'select',
    question: 'What is your DLPT listening/reading score?',
    helpText: 'Format: Listening/Reading (e.g., 2/2)',
    showIf: { questionId: 'flpp_tested', operator: 'equals', value: true },
    options: [
      { value: '1+/1+', label: '1+/1+', description: 'Limited working proficiency' },
      { value: '2/2', label: '2/2', description: 'Limited working proficiency plus' },
      { value: '2+/2+', label: '2+/2+', description: 'General professional proficiency' },
      { value: '3/3', label: '3/3', description: 'General professional proficiency plus' },
      { value: '3+/3+', label: '3+/3+ or higher', description: 'Advanced professional proficiency' },
    ],
    required: true,
  },
  {
    id: 'flpp_strategic',
    payType: 'foreignLanguagePay',
    inputType: 'boolean',
    question: 'Is your language on the DoD Strategic Language List?',
    helpText: 'Strategic languages include Arabic, Chinese, Korean, Russian, Farsi, etc.',
    showIf: { questionId: 'flpp_tested', operator: 'equals', value: true },
    required: true,
  },
];

// ============================================================================
// WIZARD CONFIGURATIONS
// ============================================================================

export const COMPREHENSIVE_WIZARD: EligibilityWizardConfig = {
  id: 'comprehensive_eligibility',
  name: 'Special Pay Eligibility Assessment',
  description: 'Comprehensive assessment for all special pay types',
  payTypes: [
    'flightPay',
    'divePay',
    'parachutePay',
    'hazardousDutyPay',
    'hostileFirePay',
    'foreignLanguagePay',
  ],
  steps: [
    {
      id: 'general',
      title: 'Basic Information',
      description: 'Tell us about your service',
      questions: GENERAL_QUESTIONS,
      estimatedTimeMinutes: 2,
    },
    {
      id: 'flight',
      title: 'Aviation',
      description: 'Flight pay eligibility',
      questions: FLIGHT_PAY_QUESTIONS,
      isOptional: true,
      estimatedTimeMinutes: 2,
    },
    {
      id: 'dive',
      title: 'Diving',
      description: 'Dive pay eligibility',
      questions: DIVE_PAY_QUESTIONS,
      isOptional: true,
      estimatedTimeMinutes: 2,
    },
    {
      id: 'jump',
      title: 'Parachute',
      description: 'Jump pay eligibility',
      questions: JUMP_PAY_QUESTIONS,
      isOptional: true,
      estimatedTimeMinutes: 2,
    },
    {
      id: 'hazard',
      title: 'Hazardous Duty',
      description: 'Hazardous duty pay eligibility',
      questions: HAZARD_PAY_QUESTIONS,
      isOptional: true,
      estimatedTimeMinutes: 2,
    },
    {
      id: 'combat',
      title: 'Combat Zone',
      description: 'HFP/IDP and CZTE eligibility',
      questions: HOSTILE_FIRE_QUESTIONS,
      isOptional: true,
      estimatedTimeMinutes: 2,
    },
    {
      id: 'language',
      title: 'Language',
      description: 'Foreign language pay eligibility',
      questions: LANGUAGE_PAY_QUESTIONS,
      isOptional: true,
      estimatedTimeMinutes: 2,
    },
  ],
  rules: [],
  version: '1.0.0',
  effectiveDate: '2024-01-01',
};

// ============================================================================
// ELIGIBILITY RULES
// ============================================================================

export const ELIGIBILITY_RULES: EligibilityRule[] = [
  // Flight Pay Rules
  {
    id: 'flight_eligible_current',
    payType: 'flightPay',
    conditions: {
      type: 'and',
      conditions: [
        { questionId: 'flight_has_rating', operator: 'equals', value: true },
        { questionId: 'flight_status', operator: 'equals', value: 'current' },
        { questionId: 'flight_meets_minimums', operator: 'equals', value: true },
      ],
    },
    result: {
      status: 'eligible',
      reason: 'You are on current flying status and meeting flight hour requirements.',
      amountFormula: 'ACIP rate based on years of aviation service',
    },
    priority: 100,
  },
  {
    id: 'flight_eligible_grounded_medical',
    payType: 'flightPay',
    conditions: {
      type: 'and',
      conditions: [
        { questionId: 'flight_has_rating', operator: 'equals', value: true },
        { questionId: 'flight_status', operator: 'equals', value: 'grounded_medical' },
      ],
    },
    result: {
      status: 'potentially_eligible',
      reason: 'You may receive reduced flight pay while medically grounded. Check with your finance office.',
    },
    priority: 90,
  },
  {
    id: 'flight_not_eligible',
    payType: 'flightPay',
    conditions: {
      type: 'or',
      conditions: [
        { questionId: 'flight_has_rating', operator: 'equals', value: false },
        { questionId: 'flight_status', operator: 'equals', value: 'grounded_admin' },
      ],
    },
    result: {
      status: 'not_eligible',
      reason: 'Flight pay requires an aviation rating and current flight status.',
    },
    priority: 80,
  },

  // Dive Pay Rules
  {
    id: 'dive_eligible',
    payType: 'divePay',
    conditions: {
      type: 'and',
      conditions: [
        { questionId: 'dive_qualified', operator: 'equals', value: true },
        { questionId: 'dive_assigned', operator: 'equals', value: true },
        { questionId: 'dive_physical_current', operator: 'equals', value: true },
      ],
    },
    result: {
      status: 'eligible',
      reason: 'You meet all requirements for diving duty pay.',
    },
    priority: 100,
  },
  {
    id: 'dive_not_assigned',
    payType: 'divePay',
    conditions: {
      type: 'and',
      conditions: [
        { questionId: 'dive_qualified', operator: 'equals', value: true },
        { questionId: 'dive_assigned', operator: 'equals', value: false },
      ],
    },
    result: {
      status: 'not_eligible',
      reason: 'Dive pay requires assignment to a diving duty billet. You have the qualification but need diving orders.',
    },
    priority: 90,
  },

  // Jump Pay Rules
  {
    id: 'jump_eligible',
    payType: 'parachutePay',
    conditions: {
      type: 'and',
      conditions: [
        { questionId: 'jump_qualified', operator: 'equals', value: true },
        { questionId: 'jump_assigned', operator: 'equals', value: true },
        { questionId: 'jump_currency', operator: 'equals', value: true },
      ],
    },
    result: {
      status: 'eligible',
      reason: 'You meet all requirements for parachute duty pay.',
      amount: 150,
    },
    priority: 100,
  },
  {
    id: 'jump_halo_eligible',
    payType: 'parachutePay',
    conditions: {
      type: 'and',
      conditions: [
        { questionId: 'jump_type', operator: 'equals', value: 'halo' },
        { questionId: 'jump_assigned', operator: 'equals', value: true },
        { questionId: 'jump_currency', operator: 'equals', value: true },
      ],
    },
    result: {
      status: 'eligible',
      reason: 'You are eligible for HALO jump pay at the higher rate.',
      amount: 225,
    },
    priority: 110,
  },

  // HFP/IDP Rules
  {
    id: 'hfp_eligible',
    payType: 'hostileFirePay',
    conditions: {
      type: 'and',
      conditions: [
        { questionId: 'hfp_deployed', operator: 'equals', value: true },
        { questionId: 'hfp_days_served', operator: 'greater_than', value: 0 },
      ],
    },
    result: {
      status: 'eligible',
      reason: 'Service in a designated hostile fire area qualifies you for HFP/IDP.',
      amount: 225,
    },
    priority: 100,
  },

  // Language Pay Rules
  {
    id: 'flpp_eligible_strategic',
    payType: 'foreignLanguagePay',
    conditions: {
      type: 'and',
      conditions: [
        { questionId: 'flpp_tested', operator: 'equals', value: true },
        { questionId: 'flpp_strategic', operator: 'equals', value: true },
        { questionId: 'flpp_score', operator: 'in', value: ['2/2', '2+/2+', '3/3', '3+/3+'] },
      ],
    },
    result: {
      status: 'eligible',
      reason: 'Your DLPT score in a strategic language qualifies you for FLPP.',
    },
    priority: 100,
  },
  {
    id: 'flpp_not_strategic',
    payType: 'foreignLanguagePay',
    conditions: {
      type: 'and',
      conditions: [
        { questionId: 'flpp_tested', operator: 'equals', value: true },
        { questionId: 'flpp_strategic', operator: 'equals', value: false },
      ],
    },
    result: {
      status: 'not_eligible',
      reason: 'FLPP is only available for languages on the DoD Strategic Language List.',
    },
    priority: 90,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get pay type info by type
 */
export function getPayTypeInfo(payType: PayTypeIdentifier): PayTypeInfo | undefined {
  return PAY_TYPE_INFO[payType];
}

/**
 * Get all questions for a specific pay type
 */
export function getQuestionsForPayType(payType: PayTypeIdentifier): EligibilityQuestion[] {
  const allQuestions = [
    ...GENERAL_QUESTIONS,
    ...FLIGHT_PAY_QUESTIONS,
    ...DIVE_PAY_QUESTIONS,
    ...JUMP_PAY_QUESTIONS,
    ...HAZARD_PAY_QUESTIONS,
    ...HOSTILE_FIRE_QUESTIONS,
    ...LANGUAGE_PAY_QUESTIONS,
  ];

  return allQuestions.filter(
    (q) => q.payType === payType || q.payType === 'general'
  );
}

/**
 * Get rules for a specific pay type
 */
export function getRulesForPayType(payType: PayTypeIdentifier): EligibilityRule[] {
  return ELIGIBILITY_RULES.filter((r) => r.payType === payType).sort(
    (a, b) => b.priority - a.priority
  );
}

/**
 * Get all available pay types for assessment
 */
export function getAvailablePayTypes(): PayTypeIdentifier[] {
  return Object.keys(PAY_TYPE_INFO);
}
