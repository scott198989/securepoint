/**
 * Eligibility Types
 * Types for special pay eligibility determination wizard
 */

import { SpecialPayType } from './payProfile';

// ============================================================================
// QUESTION TYPES
// ============================================================================

/**
 * Types of input for eligibility questions
 */
export type QuestionInputType =
  | 'boolean'       // Yes/No question
  | 'select'        // Single selection from options
  | 'multiselect'   // Multiple selections
  | 'text'          // Free text input
  | 'number'        // Numeric input
  | 'date';         // Date selection

/**
 * A single option for select/multiselect questions
 */
export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
}

/**
 * Condition for showing/hiding questions or determining outcomes
 */
export interface EligibilityCondition {
  questionId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: string | string[] | number | boolean;
}

/**
 * Compound condition with AND/OR logic
 */
export interface CompoundCondition {
  type: 'and' | 'or';
  conditions: (EligibilityCondition | CompoundCondition)[];
}

/**
 * Pay type identifier - can be a strict SpecialPayType or a friendly string key
 */
export type PayTypeIdentifier = SpecialPayType | string;

/**
 * A question in the eligibility wizard
 */
export interface EligibilityQuestion {
  id: string;
  payType: PayTypeIdentifier | 'general'; // Which pay this question relates to
  inputType: QuestionInputType;
  question: string;
  helpText?: string;
  options?: QuestionOption[]; // For select/multiselect
  placeholder?: string; // For text/number inputs
  required: boolean;
  // Conditional display
  showIf?: EligibilityCondition | CompoundCondition;
  // Validation
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    errorMessage?: string;
  };
  // For branching logic
  nextQuestionId?: string;
  skipToQuestionId?: Record<string, string>; // value -> questionId mapping
}

/**
 * Answer to an eligibility question
 */
export interface EligibilityAnswer {
  questionId: string;
  value: string | string[] | number | boolean | null;
  timestamp: string;
}

// ============================================================================
// RESULT TYPES
// ============================================================================

/**
 * Eligibility status for a specific pay type
 */
export type EligibilityStatus =
  | 'eligible'           // Meets all requirements
  | 'potentially_eligible' // May be eligible, needs verification
  | 'not_eligible'       // Does not meet requirements
  | 'incomplete';        // Not enough information

/**
 * A specific requirement and whether it's met
 */
export interface RequirementResult {
  id: string;
  name: string;
  description: string;
  isMet: boolean;
  reason?: string;
  sourceRegulation?: string; // e.g., "37 U.S.C. 301"
}

/**
 * Result for a single pay type eligibility check
 */
export interface PayTypeEligibilityResult {
  payType: PayTypeIdentifier;
  status: EligibilityStatus;
  requirements: RequirementResult[];
  totalRequirements: number;
  metRequirements: number;
  // Pay info
  monthlyAmount?: number;
  annualAmount?: number;
  amountRange?: {
    min: number;
    max: number;
  };
  // Action items
  nextSteps?: string[];
  documentsNeeded?: string[];
  // Notes
  notes?: string[];
  caveats?: string[];
}

/**
 * Overall eligibility assessment result
 */
export interface EligibilityResult {
  id: string;
  userId?: string;
  // Assessment date
  assessedAt: string;
  // Answers that led to this result
  answers: EligibilityAnswer[];
  // Results by pay type
  payTypeResults: PayTypeEligibilityResult[];
  // Summary
  summary: {
    totalPayTypesChecked: number;
    eligibleCount: number;
    potentiallyEligibleCount: number;
    notEligibleCount: number;
    incompleteCount: number;
    estimatedMonthlyTotal: number;
    estimatedAnnualTotal: number;
  };
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// WIZARD FLOW TYPES
// ============================================================================

/**
 * A step in the eligibility wizard
 */
export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  questions: EligibilityQuestion[];
  // Progress
  isOptional?: boolean;
  estimatedTimeMinutes?: number;
}

/**
 * Complete wizard configuration
 */
export interface EligibilityWizardConfig {
  id: string;
  name: string;
  description: string;
  payTypes: PayTypeIdentifier[]; // Which pay types this wizard assesses
  steps: WizardStep[];
  // Rules for determining eligibility
  rules: EligibilityRule[];
  // Version for updates
  version: string;
  effectiveDate: string;
}

/**
 * Rule that determines eligibility outcome
 */
export interface EligibilityRule {
  id: string;
  payType: PayTypeIdentifier;
  conditions: CompoundCondition;
  result: {
    status: EligibilityStatus;
    reason: string;
    amount?: number;
    amountFormula?: string; // e.g., "basePay * 0.25"
  };
  priority: number; // Higher priority rules are evaluated first
}

// ============================================================================
// STORE TYPES
// ============================================================================

/**
 * Wizard session state
 */
export interface WizardSession {
  id: string;
  wizardConfigId: string;
  currentStepIndex: number;
  currentQuestionIndex: number;
  answers: EligibilityAnswer[];
  startedAt: string;
  lastActivityAt: string;
  isComplete: boolean;
  result?: EligibilityResult;
}

/**
 * Eligibility store state
 */
export interface EligibilityStoreState {
  // Active wizard session
  activeSession: WizardSession | null;
  // Past results
  savedResults: EligibilityResult[];
  // UI state
  isLoading: boolean;
  error: string | null;
}

/**
 * Eligibility store actions
 */
export interface EligibilityStoreActions {
  // Session management
  startWizard: (configId: string) => string;
  resumeSession: (sessionId: string) => void;
  abandonSession: () => void;

  // Navigation
  goToStep: (stepIndex: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;

  // Answers
  setAnswer: (questionId: string, value: EligibilityAnswer['value']) => void;
  clearAnswer: (questionId: string) => void;

  // Completion
  completeWizard: () => EligibilityResult | null;

  // Results
  saveResult: (result: EligibilityResult) => void;
  deleteResult: (resultId: string) => void;
  getResult: (resultId: string) => EligibilityResult | undefined;

  // Queries
  getEligiblePayTypes: () => PayTypeIdentifier[];
  getPotentialPayTypes: () => PayTypeIdentifier[];
  getLatestResult: () => EligibilityResult | null;

  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// ============================================================================
// PAY-SPECIFIC TYPES
// ============================================================================

/**
 * Categories of special pays
 */
export type PayCategory =
  | 'skill'          // Based on skills/certifications (e.g., Flight Pay, Dive Pay)
  | 'hazard'         // Hazardous duty (e.g., HDP, IDP)
  | 'assignment'     // Based on assignment (e.g., SDAP, Hardship Duty)
  | 'incentive'      // Retention/incentive (e.g., SRB, Bonus)
  | 'medical'        // Medical-related (e.g., BCP, Special Compensation)
  | 'location';      // Location-based (e.g., COLA, OHA)

/**
 * Information about a special pay type
 */
export interface PayTypeInfo {
  type: PayTypeIdentifier;
  category: PayCategory;
  name: string;
  shortName: string;
  description: string;
  // Eligibility overview
  generalRequirements: string[];
  disqualifyingFactors: string[];
  // Pay details
  payRange: {
    min: number;
    max: number;
  };
  isTaxable: boolean;
  frequency: 'monthly' | 'annual' | 'one_time' | 'per_event';
  // Application
  howToApply: string[];
  requiredDocuments: string[];
  approvalAuthority: string;
  typicalProcessingTime: string;
  // Reference
  regulation: string;
  learnMoreUrl?: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if a condition is met given answers
 */
export function evaluateCondition(
  condition: EligibilityCondition,
  answers: Map<string, EligibilityAnswer>
): boolean {
  const answer = answers.get(condition.questionId);
  if (!answer) return false;

  const answerValue = answer.value;
  const conditionValue = condition.value;

  switch (condition.operator) {
    case 'equals':
      return answerValue === conditionValue;

    case 'not_equals':
      return answerValue !== conditionValue;

    case 'contains':
      if (Array.isArray(answerValue) && typeof conditionValue === 'string') {
        return answerValue.includes(conditionValue);
      }
      return false;

    case 'greater_than':
      if (typeof answerValue === 'number' && typeof conditionValue === 'number') {
        return answerValue > conditionValue;
      }
      return false;

    case 'less_than':
      if (typeof answerValue === 'number' && typeof conditionValue === 'number') {
        return answerValue < conditionValue;
      }
      return false;

    case 'in':
      if (Array.isArray(conditionValue)) {
        return conditionValue.includes(answerValue as string);
      }
      return false;

    case 'not_in':
      if (Array.isArray(conditionValue)) {
        return !conditionValue.includes(answerValue as string);
      }
      return false;

    default:
      return false;
  }
}

/**
 * Evaluate a compound condition
 */
export function evaluateCompoundCondition(
  compound: CompoundCondition,
  answers: Map<string, EligibilityAnswer>
): boolean {
  const results = compound.conditions.map((condition) => {
    if ('type' in condition) {
      return evaluateCompoundCondition(condition, answers);
    }
    return evaluateCondition(condition, answers);
  });

  if (compound.type === 'and') {
    return results.every((r) => r);
  } else {
    return results.some((r) => r);
  }
}

/**
 * Calculate eligibility status from requirements
 */
export function calculateEligibilityStatus(
  requirements: RequirementResult[]
): EligibilityStatus {
  if (requirements.length === 0) {
    return 'incomplete';
  }

  const allMet = requirements.every((r) => r.isMet);
  const noneMet = requirements.every((r) => !r.isMet);
  const someMet = requirements.some((r) => r.isMet);

  if (allMet) {
    return 'eligible';
  } else if (noneMet) {
    return 'not_eligible';
  } else if (someMet) {
    return 'potentially_eligible';
  }

  return 'incomplete';
}
