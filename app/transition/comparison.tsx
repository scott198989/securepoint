/**
 * Income Comparison Screen
 * Compare military vs civilian compensation
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks';
import { useTransitionStore } from '../../store/transitionStore';
import { Card } from '../../components/common';
import { typography, borderRadius, spacing } from '../../constants/theme';
import { formatCurrency } from '../../utils/formatters';

export default function IncomeComparisonScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { vaDisability, retirementResult } = useTransitionStore();

  // Input state
  const [militaryBasePay, setMilitaryBasePay] = useState('5000');
  const [militaryBAH, setMilitaryBAH] = useState('2000');
  const [militaryBAS, setMilitaryBAS] = useState('400');
  const [civilianSalary, setCivilianSalary] = useState('80000');
  const [civilianHealthcare, setCivilianHealthcare] = useState('500');

  // Calculate values
  const basePay = parseFloat(militaryBasePay) || 0;
  const bah = parseFloat(militaryBAH) || 0;
  const bas = parseFloat(militaryBAS) || 0;
  const civilianAnnual = parseFloat(civilianSalary) || 0;
  const healthcareCost = parseFloat(civilianHealthcare) || 0;

  // Military total
  const militaryMonthly = basePay + bah + bas;
  const militaryAnnual = militaryMonthly * 12;

  // Tax-adjusted value (allowances are tax-free)
  const taxRate = 0.22; // Approximate effective rate
  const taxFreeValue = (bah + bas) / (1 - taxRate);
  const militaryTaxEquivalent = (basePay + taxFreeValue) * 12;

  // Civilian costs
  const civilianMonthly = civilianAnnual / 12;
  const civilianAfterHealthcare = civilianAnnual - healthcareCost * 12;

  // Post-separation income
  const retirementMonthly = retirementResult?.netMonthlyRetirement || 0;
  const vaMonthly = vaDisability?.monthlyCompensation || 0;
  const postSeparationMonthly = retirementMonthly + vaMonthly;
  const postSeparationAnnual = postSeparationMonthly * 12;

  // Total civilian + post-separation
  const totalCivilianPackage = civilianAnnual + postSeparationAnnual;

  // Difference
  const difference = totalCivilianPackage - militaryTaxEquivalent;
  const isPositive = difference >= 0;

  // Break-even calculation
  const breakEvenSalary = militaryTaxEquivalent - postSeparationAnnual;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      {/* Header */}
      <Card style={[styles.headerCard, { backgroundColor: theme.colors.primary }]}>
        <Ionicons name="git-compare" size={32} color="#fff" />
        <Text style={styles.headerTitle}>Income Comparison</Text>
        <Text style={styles.headerSubtitle}>
          Compare your military compensation to civilian opportunities
        </Text>
      </Card>

      {/* Military income section */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Current Military Compensation
      </Text>

      <Card style={styles.inputCard}>
        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
              Base Pay (Monthly)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              value={militaryBasePay}
              onChangeText={setMilitaryBasePay}
              keyboardType="numeric"
              placeholder="5000"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
              BAH (Monthly)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              value={militaryBAH}
              onChangeText={setMilitaryBAH}
              keyboardType="numeric"
              placeholder="2000"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
              BAS (Monthly)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              value={militaryBAS}
              onChangeText={setMilitaryBAS}
              keyboardType="numeric"
              placeholder="400"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
        </View>

        <View style={[styles.summaryRow, { borderTopColor: theme.colors.border }]}>
          <Text style={[styles.summaryLabel, { color: theme.colors.text }]}>
            Military Annual (Gross)
          </Text>
          <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
            {formatCurrency(militaryAnnual)}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.colors.text }]}>
            Tax-Equivalent Value*
          </Text>
          <Text style={[styles.summaryValue, { color: theme.colors.income }]}>
            {formatCurrency(militaryTaxEquivalent)}
          </Text>
        </View>

        <Text style={[styles.footnote, { color: theme.colors.textSecondary }]}>
          *Includes tax-free value of BAH/BAS at ~22% tax rate
        </Text>
      </Card>

      {/* Civilian income section */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Civilian Opportunity
      </Text>

      <Card style={styles.inputCard}>
        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
              Annual Salary
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              value={civilianSalary}
              onChangeText={setCivilianSalary}
              keyboardType="numeric"
              placeholder="80000"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
              Healthcare (Monthly)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              value={civilianHealthcare}
              onChangeText={setCivilianHealthcare}
              keyboardType="numeric"
              placeholder="500"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
        </View>

        <View style={[styles.summaryRow, { borderTopColor: theme.colors.border }]}>
          <Text style={[styles.summaryLabel, { color: theme.colors.text }]}>
            Civilian Salary
          </Text>
          <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
            {formatCurrency(civilianAnnual)}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.colors.text }]}>
            After Healthcare
          </Text>
          <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
            {formatCurrency(civilianAfterHealthcare)}
          </Text>
        </View>
      </Card>

      {/* Post-separation benefits */}
      {(retirementMonthly > 0 || vaMonthly > 0) && (
        <>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Post-Separation Benefits
          </Text>

          <Card style={styles.benefitsCard}>
            {retirementMonthly > 0 && (
              <View style={styles.benefitRow}>
                <View style={[styles.benefitIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Ionicons name="medal" size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.benefitInfo}>
                  <Text style={[styles.benefitLabel, { color: theme.colors.text }]}>
                    Retirement Pay
                  </Text>
                  <Text style={[styles.benefitAmount, { color: theme.colors.primary }]}>
                    {formatCurrency(retirementMonthly)}/mo
                  </Text>
                </View>
                <Text style={[styles.benefitAnnual, { color: theme.colors.textSecondary }]}>
                  {formatCurrency(retirementMonthly * 12)}/yr
                </Text>
              </View>
            )}

            {vaMonthly > 0 && (
              <View style={styles.benefitRow}>
                <View style={[styles.benefitIcon, { backgroundColor: theme.colors.income + '20' }]}>
                  <Ionicons name="shield-checkmark" size={20} color={theme.colors.income} />
                </View>
                <View style={styles.benefitInfo}>
                  <Text style={[styles.benefitLabel, { color: theme.colors.text }]}>
                    VA Disability
                  </Text>
                  <Text style={[styles.benefitAmount, { color: theme.colors.income }]}>
                    {formatCurrency(vaMonthly)}/mo
                  </Text>
                </View>
                <Text style={[styles.benefitAnnual, { color: theme.colors.textSecondary }]}>
                  {formatCurrency(vaMonthly * 12)}/yr (tax-free)
                </Text>
              </View>
            )}

            <View style={[styles.benefitTotal, { borderTopColor: theme.colors.border }]}>
              <Text style={[styles.benefitTotalLabel, { color: theme.colors.text }]}>
                Total Post-Separation
              </Text>
              <Text style={[styles.benefitTotalValue, { color: theme.colors.income }]}>
                {formatCurrency(postSeparationAnnual)}/yr
              </Text>
            </View>
          </Card>
        </>
      )}

      {/* Comparison result */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Bottom Line
      </Text>

      <Card
        style={[
          styles.resultCard,
          {
            backgroundColor: isPositive
              ? theme.colors.income + '10'
              : theme.colors.expense + '10',
          },
        ]}
      >
        <View style={styles.resultHeader}>
          <Ionicons
            name={isPositive ? 'trending-up' : 'trending-down'}
            size={32}
            color={isPositive ? theme.colors.income : theme.colors.expense}
          />
          <Text
            style={[
              styles.resultTitle,
              { color: isPositive ? theme.colors.income : theme.colors.expense },
            ]}
          >
            {isPositive ? 'Net Gain' : 'Net Loss'}
          </Text>
        </View>

        <Text
          style={[
            styles.resultAmount,
            { color: isPositive ? theme.colors.income : theme.colors.expense },
          ]}
        >
          {isPositive ? '+' : ''}{formatCurrency(difference)}/year
        </Text>

        <View style={styles.resultBreakdown}>
          <View style={styles.breakdownRow}>
            <Text style={[styles.breakdownLabel, { color: theme.colors.textSecondary }]}>
              Civilian + Benefits
            </Text>
            <Text style={[styles.breakdownValue, { color: theme.colors.text }]}>
              {formatCurrency(totalCivilianPackage)}
            </Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={[styles.breakdownLabel, { color: theme.colors.textSecondary }]}>
              Military Tax-Equiv
            </Text>
            <Text style={[styles.breakdownValue, { color: theme.colors.text }]}>
              {formatCurrency(militaryTaxEquivalent)}
            </Text>
          </View>
        </View>

        {breakEvenSalary > 0 && (
          <View style={[styles.breakEvenRow, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.breakEvenLabel, { color: theme.colors.textSecondary }]}>
              Break-even civilian salary:
            </Text>
            <Text style={[styles.breakEvenValue, { color: theme.colors.primary }]}>
              {formatCurrency(breakEvenSalary)}
            </Text>
          </View>
        )}
      </Card>

      {/* Notes */}
      <Card style={[styles.notesCard, { backgroundColor: theme.colors.warning + '10' }]}>
        <Ionicons name="information-circle" size={24} color={theme.colors.warning} />
        <Text style={[styles.notesText, { color: theme.colors.textSecondary }]}>
          This comparison does not include: state taxes, civilian retirement benefits (401k), paid time off value, or other benefits. Consider the full compensation package when evaluating opportunities.
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },

  // Header
  headerCard: {
    alignItems: 'center',
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  headerTitle: {
    color: '#fff',
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginTop: spacing.md,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: typography.fontSize.md,
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  // Section
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  // Input card
  inputCard: {},
  inputRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xs,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'transparent',
  },
  summaryLabel: {
    fontSize: typography.fontSize.md,
  },
  summaryValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  footnote: {
    fontSize: typography.fontSize.xs,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },

  // Benefits card
  benefitsCard: {},
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  benefitInfo: {
    flex: 1,
  },
  benefitLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  benefitAmount: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  benefitAnnual: {
    fontSize: typography.fontSize.sm,
  },
  benefitTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  benefitTotalLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  benefitTotalValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },

  // Result card
  resultCard: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  resultTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  resultAmount: {
    fontSize: 36,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.lg,
  },
  resultBreakdown: {
    width: '100%',
    gap: spacing.sm,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownLabel: {
    fontSize: typography.fontSize.md,
  },
  breakdownValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  breakEvenRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  breakEvenLabel: {
    fontSize: typography.fontSize.sm,
  },
  breakEvenValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },

  // Notes
  notesCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  notesText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
});
