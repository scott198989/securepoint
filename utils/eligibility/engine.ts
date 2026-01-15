/**
 * Eligibility Engine
 * Processes if/then logic for special pay eligibility determination
 */

import {
  EligibilityAnswer,
  EligibilityCondition,
  CompoundCondition,
  EligibilityQuestion,
  EligibilityResult,
  EligibilityRule,
  EligibilityStatus,
  PayTypeEligibilityResult,
  PayTypeIdentifier,
  RequirementResult,
  WizardSession,
  evaluateCondition,
  evaluateCompoundCondition,
  calculateEligibilityStatus,
} from '../../types/eligibility';
import {
  ELIGIBILITY_RULES,
  PAY_TYPE_INFO,
  getQuestionsForPayType,
  getRulesForPayType,
} from '../../constants/eligibilityRules';

// ============================================================================
// CONDITION EVALUATION
// ============================================================================

/**
 * Create an answer map from answer array
 */
export function createAnswerMap(answers: EligibilityAnswer[]): Map<string, EligibilityAnswer> {
  const map = new Map<string, EligibilityAnswer>();
  for (const answer of answers) {
    map.set(answer.questionId, answer);
  }
  return map;
}

/**
 * Check if a question should be shown based on conditions
 */
export function shouldShowQuestion(
  question: EligibilityQuestion,
  answers: EligibilityAnswer[]
): boolean {
  if (!question.showIf) {
    return true;
  }

  const answerMap = createAnswerMap(answers);

  if ('type' in question.showIf) {
    return evaluateCompoundCondition(question.showIf, answerMap);
  }

  return evaluateCondition(question.showIf, answerMap);
}

/**
 * Get the next question based on branching logic
 */
export function getNextQuestion(
  currentQuestion: EligibilityQuestion,
  currentAnswer: EligibilityAnswer['value'],
  allQuestions: EligibilityQuestion[]
): EligibilityQuestion | null {
  // Check for skip logic
  if (currentQuestion.skipToQuestionId && currentAnswer !== null) {
    const skipTo = currentQuestion.skipToQuestionId[String(currentAnswer)];
    if (skipTo) {
      return allQuestions.find((q) => q.id === skipTo) || null;
    }
  }

  // Check for explicit next question
  if (currentQuestion.nextQuestionId) {
    return allQuestions.find((q) => q.id === currentQuestion.nextQuestionId) || null;
  }

  // Default to next question in list
  const currentIndex = allQuestions.findIndex((q) => q.id === currentQuestion.id);
  if (currentIndex >= 0 && currentIndex < allQuestions.length - 1) {
    return allQuestions[currentIndex + 1];
  }

  return null;
}

// ============================================================================
// RULE EVALUATION
// ============================================================================

/**
 * Evaluate all rules for a pay type and return the best matching result
 */
export function evaluatePayTypeRules(
  payType: PayTypeIdentifier,
  answers: EligibilityAnswer[]
): PayTypeEligibilityResult {
  const rules = getRulesForPayType(payType);
  const payInfo = PAY_TYPE_INFO[payType];
  const answerMap = createAnswerMap(answers);

  // Check each rule in priority order
  for (const rule of rules) {
    const conditionMet = evaluateCompoundCondition(rule.conditions, answerMap);

    if (conditionMet) {
      // Found matching rule
      const requirements = buildRequirementsFromRule(rule, answers);

      return {
        payType,
        status: rule.result.status,
        requirements,
        totalRequirements: requirements.length,
        metRequirements: requirements.filter((r) => r.isMet).length,
        monthlyAmount: rule.result.amount,
        amountRange: payInfo?.payRange,
        nextSteps: getNextStepsForStatus(rule.result.status, payType),
        documentsNeeded: payInfo?.requiredDocuments,
        notes: [rule.result.reason],
      };
    }
  }

  // No rules matched - return incomplete status
  return {
    payType,
    status: 'incomplete',
    requirements: [],
    totalRequirements: 0,
    metRequirements: 0,
    amountRange: payInfo?.payRange,
    notes: ['Not enough information to determine eligibility. Please complete all questions.'],
  };
}

/**
 * Build requirements list from a matched rule
 */
function buildRequirementsFromRule(
  rule: EligibilityRule,
  answers: EligibilityAnswer[]
): RequirementResult[] {
  const requirements: RequirementResult[] = [];
  const answerMap = createAnswerMap(answers);

  // Extract conditions and create requirements
  const conditions = flattenConditions(rule.conditions);

  for (const condition of conditions) {
    const answer = answerMap.get(condition.questionId);
    const isMet = answer ? evaluateCondition(condition, answerMap) : false;

    requirements.push({
      id: condition.questionId,
      name: getRequirementName(condition.questionId),
      description: getRequirementDescription(condition),
      isMet,
      reason: isMet ? 'Requirement met' : 'Requirement not met',
    });
  }

  return requirements;
}

/**
 * Flatten compound conditions into simple conditions
 */
function flattenConditions(
  compound: CompoundCondition
): EligibilityCondition[] {
  const conditions: EligibilityCondition[] = [];

  for (const condition of compound.conditions) {
    if ('type' in condition) {
      conditions.push(...flattenConditions(condition));
    } else {
      conditions.push(condition);
    }
  }

  return conditions;
}

/**
 * Get human-readable requirement name from question ID
 */
function getRequirementName(questionId: string): string {
  const nameMap: Record<string, string> = {
    flight_has_rating: 'Aviation Rating',
    flight_status: 'Flight Status',
    flight_meets_minimums: 'Flight Hour Minimums',
    dive_qualified: 'Diving Qualification',
    dive_assigned: 'Diving Duty Assignment',
    dive_physical_current: 'Current Diving Physical',
    jump_qualified: 'Parachutist Qualification',
    jump_assigned: 'Jump Duty Assignment',
    jump_currency: 'Jump Currency',
    hfp_deployed: 'Deployment to Hostile Area',
    hfp_days_served: 'Days in Hostile Area',
    flpp_tested: 'DLPT Tested',
    flpp_strategic: 'Strategic Language',
    flpp_score: 'DLPT Score',
  };

  return nameMap[questionId] || questionId.replace(/_/g, ' ');
}

/**
 * Get requirement description from condition
 */
function getRequirementDescription(condition: EligibilityCondition): string {
  const { questionId, operator, value } = condition;

  switch (operator) {
    case 'equals':
      return value === true
        ? `Must have ${getRequirementName(questionId).toLowerCase()}`
        : `${getRequirementName(questionId)} must be ${value}`;
    case 'greater_than':
      return `${getRequirementName(questionId)} must be greater than ${value}`;
    case 'in':
      return `${getRequirementName(questionId)} must be one of: ${(value as string[]).join(', ')}`;
    default:
      return `${getRequirementName(questionId)} condition`;
  }
}

/**
 * Get recommended next steps based on eligibility status
 */
function getNextStepsForStatus(
  status: EligibilityStatus,
  payType: PayTypeIdentifier
): string[] {
  const payInfo = PAY_TYPE_INFO[payType];

  switch (status) {
    case 'eligible':
      return [
        'Verify this pay is reflected on your LES',
        'If not receiving, contact your finance office',
        ...(payInfo?.howToApply || []),
      ];
    case 'potentially_eligible':
      return [
        'Schedule a meeting with your personnel office',
        'Gather required documentation',
        'Request official eligibility determination',
      ];
    case 'not_eligible':
      return [
        'Review requirements to see if future qualification is possible',
        'Consider pursuing required certifications or assignments',
      ];
    default:
      return ['Complete remaining eligibility questions'];
  }
}

// ============================================================================
// FULL ELIGIBILITY ASSESSMENT
// ============================================================================

/**
 * Run a complete eligibility assessment
 */
export function runEligibilityAssessment(
  payTypes: PayTypeIdentifier[],
  answers: EligibilityAnswer[]
): EligibilityResult {
  const payTypeResults: PayTypeEligibilityResult[] = [];

  for (const payType of payTypes) {
    const result = evaluatePayTypeRules(payType, answers);
    payTypeResults.push(result);
  }

  // Calculate summary
  const eligibleCount = payTypeResults.filter((r) => r.status === 'eligible').length;
  const potentiallyEligibleCount = payTypeResults.filter(
    (r) => r.status === 'potentially_eligible'
  ).length;
  const notEligibleCount = payTypeResults.filter(
    (r) => r.status === 'not_eligible'
  ).length;
  const incompleteCount = payTypeResults.filter(
    (r) => r.status === 'incomplete'
  ).length;

  // Estimate totals from eligible pay types
  let estimatedMonthlyTotal = 0;
  for (const result of payTypeResults) {
    if (result.status === 'eligible' && result.monthlyAmount) {
      estimatedMonthlyTotal += result.monthlyAmount;
    }
  }

  const now = new Date().toISOString();

  return {
    id: generateId(),
    assessedAt: now,
    answers,
    payTypeResults,
    summary: {
      totalPayTypesChecked: payTypes.length,
      eligibleCount,
      potentiallyEligibleCount,
      notEligibleCount,
      incompleteCount,
      estimatedMonthlyTotal,
      estimatedAnnualTotal: estimatedMonthlyTotal * 12,
    },
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Get filtered questions based on current answers
 */
export function getVisibleQuestions(
  allQuestions: EligibilityQuestion[],
  answers: EligibilityAnswer[]
): EligibilityQuestion[] {
  return allQuestions.filter((q) => shouldShowQuestion(q, answers));
}

/**
 * Check if all required questions are answered
 */
export function areRequiredQuestionsAnswered(
  questions: EligibilityQuestion[],
  answers: EligibilityAnswer[]
): boolean {
  const visibleQuestions = getVisibleQuestions(questions, answers);
  const answerMap = createAnswerMap(answers);

  for (const question of visibleQuestions) {
    if (question.required) {
      const answer = answerMap.get(question.id);
      if (!answer || answer.value === null || answer.value === '') {
        return false;
      }
    }
  }

  return true;
}

/**
 * Get progress percentage for a set of questions
 */
export function getQuestionProgress(
  questions: EligibilityQuestion[],
  answers: EligibilityAnswer[]
): number {
  const visibleQuestions = getVisibleQuestions(questions, answers);
  const answerMap = createAnswerMap(answers);

  if (visibleQuestions.length === 0) {
    return 100;
  }

  const answered = visibleQuestions.filter((q) => {
    const answer = answerMap.get(q.id);
    return answer && answer.value !== null && answer.value !== '';
  }).length;

  return Math.round((answered / visibleQuestions.length) * 100);
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate an answer against question constraints
 */
export function validateAnswer(
  question: EligibilityQuestion,
  value: EligibilityAnswer['value']
): { isValid: boolean; error?: string } {
  // Check required
  if (question.required && (value === null || value === '')) {
    return { isValid: false, error: 'This field is required' };
  }

  // Check validation rules
  if (question.validation) {
    const { min, max, pattern, errorMessage } = question.validation;

    if (typeof value === 'number') {
      if (min !== undefined && value < min) {
        return {
          isValid: false,
          error: errorMessage || `Value must be at least ${min}`,
        };
      }
      if (max !== undefined && value > max) {
        return {
          isValid: false,
          error: errorMessage || `Value must be at most ${max}`,
        };
      }
    }

    if (typeof value === 'string' && pattern) {
      const regex = new RegExp(pattern);
      if (!regex.test(value)) {
        return {
          isValid: false,
          error: errorMessage || 'Invalid format',
        };
      }
    }
  }

  // Check options for select/multiselect
  if (question.options && value !== null) {
    const validValues = question.options.map((o) => o.value);

    if (question.inputType === 'select' && typeof value === 'string') {
      if (!validValues.includes(value)) {
        return { isValid: false, error: 'Invalid selection' };
      }
    }

    if (question.inputType === 'multiselect' && Array.isArray(value)) {
      for (const v of value) {
        if (!validValues.includes(v)) {
          return { isValid: false, error: 'Invalid selection' };
        }
      }
    }
  }

  return { isValid: true };
}

// ============================================================================
// WIZARD SESSION HELPERS
// ============================================================================

/**
 * Create a new wizard session
 */
export function createWizardSession(configId: string): WizardSession {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    wizardConfigId: configId,
    currentStepIndex: 0,
    currentQuestionIndex: 0,
    answers: [],
    startedAt: now,
    lastActivityAt: now,
    isComplete: false,
  };
}

/**
 * Update session with new answer
 */
export function updateSessionAnswer(
  session: WizardSession,
  questionId: string,
  value: EligibilityAnswer['value']
): WizardSession {
  const existingIndex = session.answers.findIndex(
    (a) => a.questionId === questionId
  );

  const newAnswer: EligibilityAnswer = {
    questionId,
    value,
    timestamp: new Date().toISOString(),
  };

  const newAnswers = [...session.answers];
  if (existingIndex >= 0) {
    newAnswers[existingIndex] = newAnswer;
  } else {
    newAnswers.push(newAnswer);
  }

  return {
    ...session,
    answers: newAnswers,
    lastActivityAt: new Date().toISOString(),
  };
}

/**
 * Complete the wizard session
 */
export function completeWizardSession(
  session: WizardSession,
  payTypes: PayTypeIdentifier[]
): WizardSession {
  const result = runEligibilityAssessment(payTypes, session.answers);

  return {
    ...session,
    isComplete: true,
    result,
    lastActivityAt: new Date().toISOString(),
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format eligibility status for display
 */
export function formatEligibilityStatus(status: EligibilityStatus): string {
  const statusMap: Record<EligibilityStatus, string> = {
    eligible: 'Eligible',
    potentially_eligible: 'Potentially Eligible',
    not_eligible: 'Not Eligible',
    incomplete: 'Incomplete',
  };
  return statusMap[status];
}

/**
 * Get status color for display
 */
export function getStatusColor(status: EligibilityStatus): string {
  const colorMap: Record<EligibilityStatus, string> = {
    eligible: '#22c55e', // green
    potentially_eligible: '#f59e0b', // amber
    not_eligible: '#ef4444', // red
    incomplete: '#6b7280', // gray
  };
  return colorMap[status];
}

/**
 * Get status icon name
 */
export function getStatusIcon(status: EligibilityStatus): string {
  const iconMap: Record<EligibilityStatus, string> = {
    eligible: 'checkmark-circle',
    potentially_eligible: 'help-circle',
    not_eligible: 'close-circle',
    incomplete: 'ellipse-outline',
  };
  return iconMap[status];
}

/**
 * Calculate estimated pay range summary
 */
export function calculatePayRangeSummary(
  results: PayTypeEligibilityResult[]
): { min: number; max: number } {
  let min = 0;
  let max = 0;

  for (const result of results) {
    if (result.status === 'eligible' || result.status === 'potentially_eligible') {
      if (result.monthlyAmount) {
        min += result.monthlyAmount;
        max += result.monthlyAmount;
      } else if (result.amountRange) {
        min += result.amountRange.min;
        max += result.amountRange.max;
      }
    }
  }

  return { min, max };
}
