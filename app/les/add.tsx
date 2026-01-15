/**
 * Add LES Entry Screen
 * Manual entry form for LES data
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks';
import { usePayProfileStore } from '../../store';
import { useLESStore } from '../../store/lesStore';
import { Button, Card } from '../../components/common';
import { typography, borderRadius, spacing } from '../../constants/theme';
import { generateId } from '../../utils';
import {
  LESEntry,
  LESEntitlement,
  LESDeduction,
  EntitlementType,
  DeductionType,
  PayPeriodType,
} from '../../types/les';
import { COMMON_LES_ITEMS, ENTITLEMENT_DESCRIPTIONS, DEDUCTION_DESCRIPTIONS } from '../../constants/lesDescriptions';

// ============================================================================
// TYPES
// ============================================================================

type Step = 'period' | 'entitlements' | 'deductions' | 'review';

interface FormState {
  // Period
  year: number;
  month: number;
  periodType: PayPeriodType;
  payDate: string;

  // Amounts
  entitlements: Array<{
    type: EntitlementType;
    amount: string;
    isTaxable: boolean;
  }>;
  deductions: Array<{
    type: DeductionType;
    amount: string;
  }>;

  // Summary
  notes: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const COMMON_ENTITLEMENTS: Array<{ type: EntitlementType; label: string; taxFree: boolean }> = [
  { type: 'base_pay', label: 'Base Pay', taxFree: false },
  { type: 'bah', label: 'BAH', taxFree: true },
  { type: 'bas', label: 'BAS', taxFree: true },
  { type: 'hostile_fire_pay', label: 'Hostile Fire Pay', taxFree: true },
  { type: 'fsa', label: 'Family Separation', taxFree: true },
  { type: 'cola', label: 'COLA', taxFree: false },
  { type: 'flight_pay', label: 'Flight Pay', taxFree: false },
  { type: 'parachute_duty_pay', label: 'Jump Pay', taxFree: false },
  { type: 'special_duty_assignment_pay', label: 'SDAP', taxFree: false },
];

const COMMON_DEDUCTIONS: Array<{ type: DeductionType; label: string }> = [
  { type: 'federal_tax', label: 'Federal Tax' },
  { type: 'state_tax', label: 'State Tax' },
  { type: 'fica_social_security', label: 'Social Security' },
  { type: 'fica_medicare', label: 'Medicare' },
  { type: 'sgli', label: 'SGLI' },
  { type: 'tsp_traditional', label: 'TSP Traditional' },
  { type: 'tsp_roth', label: 'TSP Roth' },
  { type: 'tricare_dental', label: 'TRICARE Dental' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function AddLESScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { payProfile } = usePayProfileStore();
  const { addEntry } = useLESStore();

  // Current date for defaults
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Form state
  const [step, setStep] = useState<Step>('period');
  const [form, setForm] = useState<FormState>({
    year: currentYear,
    month: currentMonth,
    periodType: now.getDate() > 20 ? 'end_month' : 'mid_month',
    payDate: now.toISOString().split('T')[0],
    entitlements: [
      { type: 'base_pay', amount: '', isTaxable: true },
      { type: 'bah', amount: '', isTaxable: false },
      { type: 'bas', amount: '', isTaxable: false },
    ],
    deductions: [
      { type: 'federal_tax', amount: '' },
      { type: 'fica_social_security', amount: '' },
      { type: 'fica_medicare', amount: '' },
    ],
    notes: '',
  });

  // Update form
  const updateForm = (updates: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  };

  // Update entitlement
  const updateEntitlement = (index: number, amount: string) => {
    const updated = [...form.entitlements];
    updated[index] = { ...updated[index], amount };
    updateForm({ entitlements: updated });
  };

  // Update deduction
  const updateDeduction = (index: number, amount: string) => {
    const updated = [...form.deductions];
    updated[index] = { ...updated[index], amount };
    updateForm({ deductions: updated });
  };

  // Add entitlement
  const addEntitlement = (type: EntitlementType, taxFree: boolean) => {
    const exists = form.entitlements.find((e) => e.type === type);
    if (exists) return;

    updateForm({
      entitlements: [
        ...form.entitlements,
        { type, amount: '', isTaxable: !taxFree },
      ],
    });
  };

  // Add deduction
  const addDeduction = (type: DeductionType) => {
    const exists = form.deductions.find((d) => d.type === type);
    if (exists) return;

    updateForm({
      deductions: [...form.deductions, { type, amount: '' }],
    });
  };

  // Remove entitlement
  const removeEntitlement = (index: number) => {
    const updated = form.entitlements.filter((_, i) => i !== index);
    updateForm({ entitlements: updated });
  };

  // Remove deduction
  const removeDeduction = (index: number) => {
    const updated = form.deductions.filter((_, i) => i !== index);
    updateForm({ deductions: updated });
  };

  // Calculate totals
  const totals = {
    gross: form.entitlements.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0),
    deductions: form.deductions.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0),
    get net() {
      return this.gross - this.deductions;
    },
  };

  // Handle save
  const handleSave = () => {
    // Build LES entry
    const entitlements: LESEntitlement[] = form.entitlements
      .filter((e) => parseFloat(e.amount) > 0)
      .map((e) => ({
        id: generateId(),
        type: e.type,
        description: ENTITLEMENT_DESCRIPTIONS[e.type]?.name || e.type,
        amount: parseFloat(e.amount),
        isTaxable: e.isTaxable,
      }));

    const deductions: LESDeduction[] = form.deductions
      .filter((d) => parseFloat(d.amount) > 0)
      .map((d) => ({
        id: generateId(),
        type: d.type,
        description: DEDUCTION_DESCRIPTIONS[d.type]?.name || d.type,
        amount: parseFloat(d.amount),
        isMandatory: ['federal_tax', 'state_tax', 'fica_social_security', 'fica_medicare'].includes(d.type),
      }));

    const payDate = new Date(form.year, form.month - 1, form.periodType === 'mid_month' ? 15 : 1);
    if (form.periodType === 'end_month') {
      payDate.setMonth(payDate.getMonth() + 1);
      payDate.setDate(1);
    }

    const entry: Omit<LESEntry, 'id' | 'createdAt' | 'updatedAt'> = {
      payPeriod: {
        type: form.periodType,
        startDate: new Date(form.year, form.month - 1, 1).toISOString(),
        endDate: new Date(form.year, form.month, 0).toISOString(),
        payDate: payDate.toISOString(),
        month: form.month,
        year: form.year,
      },
      serviceMember: {
        payGrade: payProfile?.payGrade || 'E-5',
        yearsOfService: payProfile?.yearsOfService || 0,
        branch: payProfile?.branch || 'army',
        dutyStation: payProfile?.dutyStationName,
      },
      entitlements,
      deductions,
      allotments: [],
      leave: [],
      totals: {
        grossPay: totals.gross,
        totalDeductions: totals.deductions,
        totalAllotments: 0,
        netPay: totals.net,
      },
      entryMethod: 'manual',
      isVerified: false,
      notes: form.notes || undefined,
    };

    addEntry(entry);
    router.back();
  };

  // Navigation
  const canProceed = () => {
    switch (step) {
      case 'period':
        return form.year && form.month && form.periodType;
      case 'entitlements':
        return form.entitlements.some((e) => parseFloat(e.amount) > 0);
      case 'deductions':
        return true; // Deductions can be zero
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const goNext = () => {
    const steps: Step[] = ['period', 'entitlements', 'deductions', 'review'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const goBack = () => {
    const steps: Step[] = ['period', 'entitlements', 'deductions', 'review'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    } else {
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Progress */}
      <View style={[styles.progress, { backgroundColor: theme.colors.card }]}>
        {['period', 'entitlements', 'deductions', 'review'].map((s, i) => (
          <View
            key={s}
            style={[
              styles.progressDot,
              {
                backgroundColor:
                  step === s
                    ? theme.colors.primary
                    : ['period', 'entitlements', 'deductions', 'review'].indexOf(step) > i
                    ? theme.colors.income
                    : theme.colors.border,
              },
            ]}
          />
        ))}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Period Step */}
        {step === 'period' && (
          <View>
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
              Pay Period
            </Text>
            <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
              Which pay period is this LES for?
            </Text>

            {/* Year */}
            <Card style={styles.section}>
              <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Year</Text>
              <View style={styles.yearRow}>
                {[currentYear - 1, currentYear].map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.yearButton,
                      {
                        backgroundColor: form.year === year ? theme.colors.primary : theme.colors.card,
                        borderColor: form.year === year ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                    onPress={() => updateForm({ year })}
                  >
                    <Text
                      style={[
                        styles.yearText,
                        { color: form.year === year ? '#fff' : theme.colors.text },
                      ]}
                    >
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>

            {/* Month */}
            <Card style={styles.section}>
              <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Month</Text>
              <View style={styles.monthGrid}>
                {MONTHS.map((month, index) => (
                  <TouchableOpacity
                    key={month}
                    style={[
                      styles.monthButton,
                      {
                        backgroundColor: form.month === index + 1 ? theme.colors.primary : theme.colors.card,
                        borderColor: form.month === index + 1 ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                    onPress={() => updateForm({ month: index + 1 })}
                  >
                    <Text
                      style={[
                        styles.monthText,
                        { color: form.month === index + 1 ? '#fff' : theme.colors.text },
                      ]}
                    >
                      {month.substring(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>

            {/* Period Type */}
            <Card style={styles.section}>
              <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Pay Period</Text>
              <View style={styles.periodRow}>
                <TouchableOpacity
                  style={[
                    styles.periodButton,
                    {
                      backgroundColor: form.periodType === 'mid_month' ? theme.colors.primary : theme.colors.card,
                      borderColor: form.periodType === 'mid_month' ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                  onPress={() => updateForm({ periodType: 'mid_month' })}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={form.periodType === 'mid_month' ? '#fff' : theme.colors.text}
                  />
                  <Text
                    style={[
                      styles.periodText,
                      { color: form.periodType === 'mid_month' ? '#fff' : theme.colors.text },
                    ]}
                  >
                    Mid-Month (15th)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.periodButton,
                    {
                      backgroundColor: form.periodType === 'end_month' ? theme.colors.primary : theme.colors.card,
                      borderColor: form.periodType === 'end_month' ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                  onPress={() => updateForm({ periodType: 'end_month' })}
                >
                  <Ionicons
                    name="calendar"
                    size={20}
                    color={form.periodType === 'end_month' ? '#fff' : theme.colors.text}
                  />
                  <Text
                    style={[
                      styles.periodText,
                      { color: form.periodType === 'end_month' ? '#fff' : theme.colors.text },
                    ]}
                  >
                    End of Month (1st)
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          </View>
        )}

        {/* Entitlements Step */}
        {step === 'entitlements' && (
          <View>
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
              Entitlements
            </Text>
            <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
              Enter your pay items from your LES
            </Text>

            {form.entitlements.map((entitlement, index) => {
              const info = ENTITLEMENT_DESCRIPTIONS[entitlement.type];
              return (
                <View
                  key={`${entitlement.type}-${index}`}
                  style={[styles.amountRow, { backgroundColor: theme.colors.card }]}
                >
                  <View style={styles.amountInfo}>
                    <Text style={[styles.amountLabel, { color: theme.colors.text }]}>
                      {info?.name || entitlement.type}
                    </Text>
                    {!entitlement.isTaxable && (
                      <View style={[styles.taxFreeBadge, { backgroundColor: theme.colors.income + '20' }]}>
                        <Text style={[styles.taxFreeText, { color: theme.colors.income }]}>
                          TAX-FREE
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.amountInputRow}>
                    <Text style={[styles.dollarSign, { color: theme.colors.textSecondary }]}>$</Text>
                    <TextInput
                      style={[
                        styles.amountInput,
                        { color: theme.colors.text, borderColor: theme.colors.border },
                      ]}
                      value={entitlement.amount}
                      onChangeText={(text) => updateEntitlement(index, text.replace(/[^0-9.]/g, ''))}
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                    <TouchableOpacity
                      onPress={() => removeEntitlement(index)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="close-circle" size={24} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            {/* Add More */}
            <Card style={styles.addMoreSection}>
              <Text style={[styles.addMoreTitle, { color: theme.colors.text }]}>
                Add More Entitlements
              </Text>
              <View style={styles.addMoreGrid}>
                {COMMON_ENTITLEMENTS.filter(
                  (e) => !form.entitlements.find((f) => f.type === e.type)
                ).map((item) => (
                  <TouchableOpacity
                    key={item.type}
                    style={[styles.addMoreChip, { borderColor: theme.colors.border }]}
                    onPress={() => addEntitlement(item.type, item.taxFree)}
                  >
                    <Ionicons name="add" size={16} color={theme.colors.primary} />
                    <Text style={[styles.addMoreText, { color: theme.colors.text }]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>

            {/* Running Total */}
            <View style={[styles.runningTotal, { backgroundColor: theme.colors.income + '15' }]}>
              <Text style={[styles.runningTotalLabel, { color: theme.colors.text }]}>
                Gross Pay
              </Text>
              <Text style={[styles.runningTotalAmount, { color: theme.colors.income }]}>
                ${totals.gross.toFixed(2)}
              </Text>
            </View>
          </View>
        )}

        {/* Deductions Step */}
        {step === 'deductions' && (
          <View>
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
              Deductions
            </Text>
            <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
              Enter deductions from your LES
            </Text>

            {form.deductions.map((deduction, index) => {
              const info = DEDUCTION_DESCRIPTIONS[deduction.type];
              return (
                <View
                  key={`${deduction.type}-${index}`}
                  style={[styles.amountRow, { backgroundColor: theme.colors.card }]}
                >
                  <View style={styles.amountInfo}>
                    <Text style={[styles.amountLabel, { color: theme.colors.text }]}>
                      {info?.name || deduction.type}
                    </Text>
                  </View>
                  <View style={styles.amountInputRow}>
                    <Text style={[styles.dollarSign, { color: theme.colors.textSecondary }]}>$</Text>
                    <TextInput
                      style={[
                        styles.amountInput,
                        { color: theme.colors.text, borderColor: theme.colors.border },
                      ]}
                      value={deduction.amount}
                      onChangeText={(text) => updateDeduction(index, text.replace(/[^0-9.]/g, ''))}
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                    <TouchableOpacity
                      onPress={() => removeDeduction(index)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="close-circle" size={24} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            {/* Add More */}
            <Card style={styles.addMoreSection}>
              <Text style={[styles.addMoreTitle, { color: theme.colors.text }]}>
                Add More Deductions
              </Text>
              <View style={styles.addMoreGrid}>
                {COMMON_DEDUCTIONS.filter(
                  (d) => !form.deductions.find((f) => f.type === d.type)
                ).map((item) => (
                  <TouchableOpacity
                    key={item.type}
                    style={[styles.addMoreChip, { borderColor: theme.colors.border }]}
                    onPress={() => addDeduction(item.type)}
                  >
                    <Ionicons name="add" size={16} color={theme.colors.primary} />
                    <Text style={[styles.addMoreText, { color: theme.colors.text }]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>

            {/* Running Total */}
            <View style={[styles.runningTotal, { backgroundColor: theme.colors.expense + '15' }]}>
              <Text style={[styles.runningTotalLabel, { color: theme.colors.text }]}>
                Total Deductions
              </Text>
              <Text style={[styles.runningTotalAmount, { color: theme.colors.expense }]}>
                -${totals.deductions.toFixed(2)}
              </Text>
            </View>
          </View>
        )}

        {/* Review Step */}
        {step === 'review' && (
          <View>
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
              Review
            </Text>
            <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
              Confirm your LES entry
            </Text>

            {/* Period Summary */}
            <Card style={styles.reviewCard}>
              <Text style={[styles.reviewCardTitle, { color: theme.colors.textSecondary }]}>
                Pay Period
              </Text>
              <Text style={[styles.reviewCardValue, { color: theme.colors.text }]}>
                {MONTHS[form.month - 1]} {form.year} -{' '}
                {form.periodType === 'mid_month' ? 'Mid-Month' : 'End of Month'}
              </Text>
            </Card>

            {/* Entitlements Summary */}
            <Card style={styles.reviewCard}>
              <Text style={[styles.reviewCardTitle, { color: theme.colors.textSecondary }]}>
                Entitlements
              </Text>
              {form.entitlements
                .filter((e) => parseFloat(e.amount) > 0)
                .map((e, i) => (
                  <View key={i} style={styles.reviewLine}>
                    <Text style={[styles.reviewLineLabel, { color: theme.colors.text }]}>
                      {ENTITLEMENT_DESCRIPTIONS[e.type]?.name || e.type}
                    </Text>
                    <Text style={[styles.reviewLineAmount, { color: theme.colors.income }]}>
                      ${parseFloat(e.amount).toFixed(2)}
                    </Text>
                  </View>
                ))}
              <View style={[styles.reviewTotal, { borderTopColor: theme.colors.border }]}>
                <Text style={[styles.reviewTotalLabel, { color: theme.colors.text }]}>
                  Gross Pay
                </Text>
                <Text style={[styles.reviewTotalAmount, { color: theme.colors.income }]}>
                  ${totals.gross.toFixed(2)}
                </Text>
              </View>
            </Card>

            {/* Deductions Summary */}
            <Card style={styles.reviewCard}>
              <Text style={[styles.reviewCardTitle, { color: theme.colors.textSecondary }]}>
                Deductions
              </Text>
              {form.deductions
                .filter((d) => parseFloat(d.amount) > 0)
                .map((d, i) => (
                  <View key={i} style={styles.reviewLine}>
                    <Text style={[styles.reviewLineLabel, { color: theme.colors.text }]}>
                      {DEDUCTION_DESCRIPTIONS[d.type]?.name || d.type}
                    </Text>
                    <Text style={[styles.reviewLineAmount, { color: theme.colors.expense }]}>
                      -${parseFloat(d.amount).toFixed(2)}
                    </Text>
                  </View>
                ))}
              <View style={[styles.reviewTotal, { borderTopColor: theme.colors.border }]}>
                <Text style={[styles.reviewTotalLabel, { color: theme.colors.text }]}>
                  Total Deductions
                </Text>
                <Text style={[styles.reviewTotalAmount, { color: theme.colors.expense }]}>
                  -${totals.deductions.toFixed(2)}
                </Text>
              </View>
            </Card>

            {/* Net Pay */}
            <Card style={[styles.netPayReview, { backgroundColor: theme.colors.income + '15' }]}>
              <Text style={[styles.netPayLabel, { color: theme.colors.text }]}>
                Net Pay
              </Text>
              <Text style={[styles.netPayAmount, { color: theme.colors.income }]}>
                ${totals.net.toFixed(2)}
              </Text>
            </Card>

            {/* Notes */}
            <Card style={styles.reviewCard}>
              <Text style={[styles.reviewCardTitle, { color: theme.colors.textSecondary }]}>
                Notes (Optional)
              </Text>
              <TextInput
                style={[
                  styles.notesInput,
                  {
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.background,
                  },
                ]}
                value={form.notes}
                onChangeText={(text) => updateForm({ notes: text })}
                placeholder="Add any notes about this LES..."
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </Card>
          </View>
        )}
      </ScrollView>

      {/* Navigation */}
      <View
        style={[
          styles.navBar,
          {
            backgroundColor: theme.colors.background,
            paddingBottom: insets.bottom + spacing.md,
          },
        ]}
      >
        <Button
          title={step === 'period' ? 'Cancel' : 'Back'}
          variant="outline"
          onPress={goBack}
          style={styles.navButton}
        />
        <Button
          title={step === 'review' ? 'Save LES' : 'Next'}
          onPress={step === 'review' ? handleSave : goNext}
          disabled={!canProceed()}
          style={styles.navButton}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Progress
  progress: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Content
  content: {
    flex: 1,
    padding: spacing.md,
  },
  stepTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  stepSubtitle: {
    fontSize: typography.fontSize.md,
    marginBottom: spacing.lg,
  },

  // Section
  section: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.sm,
  },

  // Year
  yearRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  yearButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  yearText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },

  // Month
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  monthButton: {
    width: '23%',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  monthText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },

  // Period
  periodRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  periodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  periodText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },

  // Amount Input
  amountRow: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  amountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  amountLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  taxFreeBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  taxFreeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dollarSign: {
    fontSize: typography.fontSize.lg,
  },
  amountInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.lg,
  },

  // Add More
  addMoreSection: {
    marginTop: spacing.md,
  },
  addMoreTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  addMoreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  addMoreChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  addMoreText: {
    fontSize: typography.fontSize.sm,
  },

  // Running Total
  runningTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  runningTotalLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  runningTotalAmount: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },

  // Review
  reviewCard: {
    marginBottom: spacing.md,
  },
  reviewCardTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  reviewCardValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
  },
  reviewLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  reviewLineLabel: {
    fontSize: typography.fontSize.md,
  },
  reviewLineAmount: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  reviewTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    marginTop: spacing.sm,
    borderTopWidth: 1,
  },
  reviewTotalLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  reviewTotalAmount: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  netPayReview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  netPayLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  netPayAmount: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // Nav Bar
  navBar: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  navButton: {
    flex: 1,
  },
});
