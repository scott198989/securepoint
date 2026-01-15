/**
 * EligibilityWizard Component
 * Interactive question flow for determining special pay eligibility
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks';
import {
  EligibilityQuestion,
  EligibilityAnswer,
  EligibilityResult,
  PayTypeEligibilityResult,
  PayTypeIdentifier,
  WizardStep,
} from '../../types/eligibility';
import {
  shouldShowQuestion,
  validateAnswer,
  getVisibleQuestions,
  getQuestionProgress,
  runEligibilityAssessment,
  formatEligibilityStatus,
  getStatusColor,
  getStatusIcon,
} from '../../utils/eligibility/engine';
import { Button, Card } from '../common';
import { typography, borderRadius, spacing } from '../../constants/theme';

// ============================================================================
// TYPES
// ============================================================================

interface EligibilityWizardProps {
  steps: WizardStep[];
  payTypes: PayTypeIdentifier[];
  onComplete: (result: EligibilityResult) => void;
  onCancel?: () => void;
}

interface QuestionRendererProps {
  question: EligibilityQuestion;
  value: EligibilityAnswer['value'];
  onChange: (value: EligibilityAnswer['value']) => void;
  error?: string;
}

// ============================================================================
// QUESTION RENDERERS
// ============================================================================

function BooleanQuestion({ question, value, onChange }: QuestionRendererProps) {
  const theme = useTheme();

  return (
    <View style={styles.booleanContainer}>
      <TouchableOpacity
        style={[
          styles.booleanOption,
          { borderColor: theme.colors.border },
          value === true && { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '10' },
        ]}
        onPress={() => onChange(true)}
      >
        <Ionicons
          name={value === true ? 'checkmark-circle' : 'ellipse-outline'}
          size={24}
          color={value === true ? theme.colors.primary : theme.colors.textSecondary}
        />
        <Text style={[styles.booleanText, { color: theme.colors.text }]}>Yes</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.booleanOption,
          { borderColor: theme.colors.border },
          value === false && { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '10' },
        ]}
        onPress={() => onChange(false)}
      >
        <Ionicons
          name={value === false ? 'checkmark-circle' : 'ellipse-outline'}
          size={24}
          color={value === false ? theme.colors.primary : theme.colors.textSecondary}
        />
        <Text style={[styles.booleanText, { color: theme.colors.text }]}>No</Text>
      </TouchableOpacity>
    </View>
  );
}

function SelectQuestion({ question, value, onChange }: QuestionRendererProps) {
  const theme = useTheme();

  return (
    <View style={styles.selectContainer}>
      {question.options?.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.selectOption,
            { borderColor: theme.colors.border },
            value === option.value && {
              borderColor: theme.colors.primary,
              backgroundColor: theme.colors.primary + '10',
            },
          ]}
          onPress={() => onChange(option.value)}
        >
          <View style={styles.selectContent}>
            <Text style={[styles.selectLabel, { color: theme.colors.text }]}>
              {option.label}
            </Text>
            {option.description && (
              <Text style={[styles.selectDescription, { color: theme.colors.textSecondary }]}>
                {option.description}
              </Text>
            )}
          </View>
          <Ionicons
            name={value === option.value ? 'checkmark-circle' : 'ellipse-outline'}
            size={24}
            color={value === option.value ? theme.colors.primary : theme.colors.textTertiary}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

function MultiSelectQuestion({ question, value, onChange }: QuestionRendererProps) {
  const theme = useTheme();
  const selectedValues = Array.isArray(value) ? value : [];

  const toggleOption = (optionValue: string) => {
    if (selectedValues.includes(optionValue)) {
      onChange(selectedValues.filter(v => v !== optionValue));
    } else {
      onChange([...selectedValues, optionValue]);
    }
  };

  return (
    <View style={styles.selectContainer}>
      {question.options?.map((option) => {
        const isSelected = selectedValues.includes(option.value);
        return (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.selectOption,
              { borderColor: theme.colors.border },
              isSelected && {
                borderColor: theme.colors.primary,
                backgroundColor: theme.colors.primary + '10',
              },
            ]}
            onPress={() => toggleOption(option.value)}
          >
            <View style={styles.selectContent}>
              <Text style={[styles.selectLabel, { color: theme.colors.text }]}>
                {option.label}
              </Text>
              {option.description && (
                <Text style={[styles.selectDescription, { color: theme.colors.textSecondary }]}>
                  {option.description}
                </Text>
              )}
            </View>
            <Ionicons
              name={isSelected ? 'checkbox' : 'square-outline'}
              size={24}
              color={isSelected ? theme.colors.primary : theme.colors.textTertiary}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function NumberQuestion({ question, value, onChange, error }: QuestionRendererProps) {
  const theme = useTheme();

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={[
          styles.textInput,
          { color: theme.colors.text, borderColor: error ? theme.colors.expense : theme.colors.border },
        ]}
        value={value !== null ? String(value) : ''}
        onChangeText={(text) => {
          const num = parseInt(text, 10);
          onChange(isNaN(num) ? null : num);
        }}
        placeholder={question.placeholder || 'Enter a number'}
        placeholderTextColor={theme.colors.textTertiary}
        keyboardType="numeric"
      />
      {error && (
        <Text style={[styles.errorText, { color: theme.colors.expense }]}>{error}</Text>
      )}
    </View>
  );
}

function TextQuestion({ question, value, onChange, error }: QuestionRendererProps) {
  const theme = useTheme();

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={[
          styles.textInput,
          { color: theme.colors.text, borderColor: error ? theme.colors.expense : theme.colors.border },
        ]}
        value={typeof value === 'string' ? value : ''}
        onChangeText={onChange}
        placeholder={question.placeholder || 'Enter your answer'}
        placeholderTextColor={theme.colors.textTertiary}
      />
      {error && (
        <Text style={[styles.errorText, { color: theme.colors.expense }]}>{error}</Text>
      )}
    </View>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EligibilityWizard({
  steps,
  payTypes,
  onComplete,
  onCancel,
}: EligibilityWizardProps) {
  const theme = useTheme();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<EligibilityAnswer[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentStep = steps[currentStepIndex];
  const allQuestions = useMemo(() => steps.flatMap(s => s.questions), [steps]);

  const visibleQuestions = useMemo(
    () => getVisibleQuestions(currentStep.questions, answers),
    [currentStep, answers]
  );

  const progress = useMemo(
    () => getQuestionProgress(allQuestions, answers),
    [allQuestions, answers]
  );

  const getAnswerValue = useCallback(
    (questionId: string): EligibilityAnswer['value'] => {
      return answers.find(a => a.questionId === questionId)?.value ?? null;
    },
    [answers]
  );

  const setAnswer = useCallback((questionId: string, value: EligibilityAnswer['value']) => {
    setAnswers(prev => {
      const existing = prev.findIndex(a => a.questionId === questionId);
      const newAnswer: EligibilityAnswer = {
        questionId,
        value,
        timestamp: new Date().toISOString(),
      };

      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = newAnswer;
        return updated;
      }
      return [...prev, newAnswer];
    });

    // Clear error when answer changes
    setErrors(prev => {
      const { [questionId]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const validateStep = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    for (const question of visibleQuestions) {
      const value = getAnswerValue(question.id);
      const validation = validateAnswer(question, value);

      if (!validation.isValid && validation.error) {
        newErrors[question.id] = validation.error;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [visibleQuestions, getAnswerValue]);

  const goToNextStep = () => {
    if (!validateStep()) return;

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Complete wizard
      const result = runEligibilityAssessment(payTypes, answers);
      onComplete(result);
    }
  };

  const goToPrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const renderQuestion = (question: EligibilityQuestion) => {
    const value = getAnswerValue(question.id);
    const error = errors[question.id];

    const commonProps: QuestionRendererProps = {
      question,
      value,
      onChange: (v) => setAnswer(question.id, v),
      error,
    };

    switch (question.inputType) {
      case 'boolean':
        return <BooleanQuestion {...commonProps} />;
      case 'select':
        return <SelectQuestion {...commonProps} />;
      case 'multiselect':
        return <MultiSelectQuestion {...commonProps} />;
      case 'number':
        return <NumberQuestion {...commonProps} />;
      case 'text':
        return <TextQuestion {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Progress Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <View style={styles.progressInfo}>
          <Text style={[styles.stepLabel, { color: theme.colors.textSecondary }]}>
            Step {currentStepIndex + 1} of {steps.length}
          </Text>
          <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
            {currentStep.title}
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                { backgroundColor: theme.colors.primary, width: `${progress}%` },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
            {progress}% complete
          </Text>
        </View>
      </View>

      {/* Questions */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {currentStep.description && (
          <Text style={[styles.stepDescription, { color: theme.colors.textSecondary }]}>
            {currentStep.description}
          </Text>
        )}

        {visibleQuestions.map((question, index) => (
          <View key={question.id} style={styles.questionContainer}>
            <View style={styles.questionHeader}>
              <Text style={[styles.questionNumber, { color: theme.colors.primary }]}>
                {index + 1}
              </Text>
              <View style={styles.questionTextContainer}>
                <Text style={[styles.questionText, { color: theme.colors.text }]}>
                  {question.question}
                </Text>
                {question.helpText && (
                  <Text style={[styles.helpText, { color: theme.colors.textSecondary }]}>
                    {question.helpText}
                  </Text>
                )}
              </View>
            </View>
            {renderQuestion(question)}
          </View>
        ))}
      </ScrollView>

      {/* Navigation Footer */}
      <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
        <View style={styles.footerButtons}>
          {currentStepIndex > 0 ? (
            <Button
              title="Back"
              variant="outline"
              onPress={goToPrevStep}
              style={styles.backButton}
            />
          ) : onCancel ? (
            <Button
              title="Cancel"
              variant="outline"
              onPress={onCancel}
              style={styles.backButton}
            />
          ) : (
            <View style={styles.backButton} />
          )}

          <Button
            title={currentStepIndex === steps.length - 1 ? 'See Results' : 'Continue'}
            onPress={goToNextStep}
            style={styles.nextButton}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// ============================================================================
// RESULTS DISPLAY COMPONENT
// ============================================================================

interface EligibilityResultsProps {
  result: EligibilityResult;
  onDismiss?: () => void;
  onStartOver?: () => void;
}

export function EligibilityResults({
  result,
  onDismiss,
  onStartOver,
}: EligibilityResultsProps) {
  const theme = useTheme();

  return (
    <ScrollView style={styles.resultsContainer}>
      {/* Summary Card */}
      <Card style={[styles.summaryCard, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.summaryTitle}>Your Results</Text>
        <View style={styles.summaryStats}>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryStatValue}>{result.summary.eligibleCount}</Text>
            <Text style={styles.summaryStatLabel}>Eligible</Text>
          </View>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryStatValue}>
              {result.summary.potentiallyEligibleCount}
            </Text>
            <Text style={styles.summaryStatLabel}>Potential</Text>
          </View>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryStatValue}>
              ${result.summary.estimatedMonthlyTotal}
            </Text>
            <Text style={styles.summaryStatLabel}>Monthly Est.</Text>
          </View>
        </View>
      </Card>

      {/* Pay Type Results */}
      {result.payTypeResults.map((payResult) => (
        <PayTypeResultCard key={payResult.payType} result={payResult} />
      ))}

      {/* Actions */}
      <View style={styles.resultsActions}>
        {onStartOver && (
          <Button title="Start Over" variant="outline" onPress={onStartOver} />
        )}
        {onDismiss && <Button title="Done" onPress={onDismiss} />}
      </View>
    </ScrollView>
  );
}

function PayTypeResultCard({ result }: { result: PayTypeEligibilityResult }) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(result.status === 'eligible');

  const statusColor = getStatusColor(result.status);
  const statusIcon = getStatusIcon(result.status);

  return (
    <Card style={styles.payTypeCard}>
      <TouchableOpacity
        style={styles.payTypeHeader}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={styles.payTypeInfo}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Ionicons name={statusIcon as any} size={16} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {formatEligibilityStatus(result.status)}
            </Text>
          </View>
          <Text style={[styles.payTypeName, { color: theme.colors.text }]}>
            {result.payType}
          </Text>
          {result.monthlyAmount && (
            <Text style={[styles.payTypeAmount, { color: theme.colors.income }]}>
              ${result.monthlyAmount}/mo
            </Text>
          )}
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={theme.colors.textSecondary}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.payTypeDetails}>
          {/* Requirements */}
          {result.requirements.length > 0 && (
            <View style={styles.requirementsList}>
              {result.requirements.map((req) => (
                <View key={req.id} style={styles.requirementItem}>
                  <Ionicons
                    name={req.isMet ? 'checkmark-circle' : 'close-circle'}
                    size={16}
                    color={req.isMet ? theme.colors.income : theme.colors.expense}
                  />
                  <Text style={[styles.requirementText, { color: theme.colors.text }]}>
                    {req.name}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Notes */}
          {result.notes && result.notes.length > 0 && (
            <View style={styles.notesList}>
              {result.notes.map((note, i) => (
                <Text
                  key={i}
                  style={[styles.noteText, { color: theme.colors.textSecondary }]}
                >
                  {note}
                </Text>
              ))}
            </View>
          )}

          {/* Next Steps */}
          {result.nextSteps && result.nextSteps.length > 0 && (
            <View style={[styles.nextStepsList, { borderTopColor: theme.colors.border }]}>
              <Text style={[styles.nextStepsTitle, { color: theme.colors.text }]}>
                Next Steps:
              </Text>
              {result.nextSteps.map((step, i) => (
                <View key={i} style={styles.nextStepItem}>
                  <Text style={[styles.nextStepNumber, { color: theme.colors.primary }]}>
                    {i + 1}.
                  </Text>
                  <Text style={[styles.nextStepText, { color: theme.colors.textSecondary }]}>
                    {step}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </Card>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  progressInfo: {
    marginBottom: spacing.sm,
  },
  stepLabel: {
    fontSize: typography.fontSize.sm,
  },
  stepTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  progressBarContainer: {
    gap: spacing.xs,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: typography.fontSize.xs,
    textAlign: 'right',
  },

  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  stepDescription: {
    fontSize: typography.fontSize.md,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },

  // Question
  questionContainer: {
    marginBottom: spacing.lg,
  },
  questionHeader: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  questionNumber: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginRight: spacing.sm,
    minWidth: 24,
  },
  questionTextContainer: {
    flex: 1,
  },
  questionText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: 22,
  },
  helpText: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
    lineHeight: 20,
  },

  // Boolean
  booleanContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  booleanOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderWidth: 2,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  booleanText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  // Select
  selectContainer: {
    gap: spacing.sm,
  },
  selectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 2,
    borderRadius: borderRadius.lg,
  },
  selectContent: {
    flex: 1,
  },
  selectLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  selectDescription: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },

  // Input
  inputContainer: {
    gap: spacing.xs,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
  },

  // Footer
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },

  // Results
  resultsContainer: {
    flex: 1,
    padding: spacing.md,
  },
  summaryCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  summaryTitle: {
    color: '#fff',
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryStat: {
    alignItems: 'center',
  },
  summaryStatValue: {
    color: '#fff',
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
  },
  summaryStatLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.fontSize.sm,
  },
  resultsActions: {
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },

  // Pay Type Card
  payTypeCard: {
    marginBottom: spacing.sm,
  },
  payTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  payTypeInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  payTypeName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  payTypeAmount: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  payTypeDetails: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  requirementsList: {
    gap: spacing.xs,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  requirementText: {
    fontSize: typography.fontSize.sm,
  },
  notesList: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  noteText: {
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
  nextStepsList: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  nextStepsTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  nextStepItem: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  nextStepNumber: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    minWidth: 16,
  },
  nextStepText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
});
