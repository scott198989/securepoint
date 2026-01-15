/**
 * Benefits Calculator Component
 * VA disability and retirement pay projections
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks';
import { Card } from '../common';
import { typography, borderRadius, spacing } from '../../constants/theme';
import { useTransitionStore } from '../../store/transitionStore';
import { formatCurrency } from '../../utils/formatters';
import { getVACompensation, calculateRetirementPay } from '../../constants/transitionData';
import { RetirementSystem } from '../../types/transition';

interface BenefitsCalculatorProps {
  mode?: 'va' | 'retirement' | 'combined';
  compact?: boolean;
}

export function BenefitsCalculator({ mode = 'combined', compact = false }: BenefitsCalculatorProps) {
  const theme = useTheme();
  const { vaDisability, retirementResult, transitionInfo } = useTransitionStore();

  // Local state for calculator inputs
  const [vaRating, setVARating] = useState<string>(
    vaDisability?.combinedRating?.toString() || '0'
  );
  const [hasSpouse, setHasSpouse] = useState(vaDisability?.hasSpouse || false);
  const [dependentCount, setDependentCount] = useState<string>(
    vaDisability?.dependentCount?.toString() || '0'
  );
  const [yearsOfService, setYearsOfService] = useState<string>(
    transitionInfo?.activeYears?.toString() || '20'
  );
  const [highThreePay, setHighThreePay] = useState<string>('6000');
  const [retirementSystem, setRetirementSystem] = useState<RetirementSystem>(
    transitionInfo?.retirementSystem || 'legacy_high3'
  );

  // Calculate VA compensation
  const getVAEstimate = () => {
    const rating = parseInt(vaRating) || 0;
    const childCountNum = parseInt(dependentCount) || 0;
    return getVACompensation(rating, hasSpouse, childCountNum);
  };

  // Calculate retirement pay
  const getRetirementEstimate = () => {
    const years = parseInt(yearsOfService) || 0;
    const basePay = parseFloat(highThreePay) || 0;
    const monthlyPay = calculateRetirementPay(years, basePay, retirementSystem);
    // Calculate multiplier
    const multiplierRate = retirementSystem === 'brs' ? 0.02 : 0.025;
    const multiplier = Math.min(years * multiplierRate * 100, 75);
    return { grossMonthlyRetirement: monthlyPay, multiplier };
  };

  const vaEstimate = getVAEstimate();
  const retirementEstimate = getRetirementEstimate();
  const totalMonthly = vaEstimate + retirementEstimate.grossMonthlyRetirement;

  if (compact) {
    return (
      <Card style={styles.compactCard}>
        <View style={styles.compactRow}>
          {(mode === 'va' || mode === 'combined') && (
            <View style={styles.compactItem}>
              <View style={[styles.compactIcon, { backgroundColor: theme.colors.income + '20' }]}>
                <Ionicons name="shield-checkmark" size={20} color={theme.colors.income} />
              </View>
              <Text style={[styles.compactLabel, { color: theme.colors.textSecondary }]}>
                VA Compensation
              </Text>
              <Text style={[styles.compactValue, { color: theme.colors.income }]}>
                {formatCurrency(vaEstimate)}/mo
              </Text>
            </View>
          )}

          {(mode === 'retirement' || mode === 'combined') && (
            <View style={styles.compactItem}>
              <View style={[styles.compactIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                <Ionicons name="medal" size={20} color={theme.colors.primary} />
              </View>
              <Text style={[styles.compactLabel, { color: theme.colors.textSecondary }]}>
                Retirement Pay
              </Text>
              <Text style={[styles.compactValue, { color: theme.colors.primary }]}>
                {formatCurrency(retirementEstimate.grossMonthlyRetirement)}/mo
              </Text>
            </View>
          )}
        </View>

        {mode === 'combined' && (
          <View style={[styles.compactTotal, { borderTopColor: theme.colors.border }]}>
            <Text style={[styles.compactTotalLabel, { color: theme.colors.text }]}>
              Total Monthly Income
            </Text>
            <Text style={[styles.compactTotalValue, { color: theme.colors.income }]}>
              {formatCurrency(totalMonthly)}
            </Text>
          </View>
        )}
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      {/* VA Calculator */}
      {(mode === 'va' || mode === 'combined') && (
        <Card style={styles.calcCard}>
          <View style={styles.calcHeader}>
            <Ionicons name="shield-checkmark" size={24} color={theme.colors.income} />
            <Text style={[styles.calcTitle, { color: theme.colors.text }]}>
              VA Disability Compensation
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
              Combined Rating (%)
            </Text>
            <View style={styles.ratingButtons}>
              {[10, 30, 50, 70, 100].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.ratingButton,
                    {
                      backgroundColor:
                        parseInt(vaRating) === rating
                          ? theme.colors.primary
                          : theme.colors.surfaceVariant,
                    },
                  ]}
                  onPress={() => setVARating(rating.toString())}
                >
                  <Text
                    style={[
                      styles.ratingButtonText,
                      {
                        color:
                          parseInt(vaRating) === rating
                            ? '#fff'
                            : theme.colors.text,
                      },
                    ]}
                  >
                    {rating}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              value={vaRating}
              onChangeText={setVARating}
              keyboardType="numeric"
              placeholder="Enter custom rating"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={styles.dependentsRow}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setHasSpouse(!hasSpouse)}
            >
              <Ionicons
                name={hasSpouse ? 'checkbox' : 'square-outline'}
                size={24}
                color={theme.colors.primary}
              />
              <Text style={[styles.checkboxLabel, { color: theme.colors.text }]}>
                Spouse
              </Text>
            </TouchableOpacity>

            <View style={styles.dependentInput}>
              <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                Children
              </Text>
              <TextInput
                style={[
                  styles.smallInput,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                value={dependentCount}
                onChangeText={setDependentCount}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={[styles.resultRow, { borderTopColor: theme.colors.border }]}>
            <Text style={[styles.resultLabel, { color: theme.colors.textSecondary }]}>
              Monthly Compensation
            </Text>
            <Text style={[styles.resultValue, { color: theme.colors.income }]}>
              {formatCurrency(vaEstimate)}
            </Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={[styles.resultLabel, { color: theme.colors.textSecondary }]}>
              Annual Compensation
            </Text>
            <Text style={[styles.resultValue, { color: theme.colors.income }]}>
              {formatCurrency(vaEstimate * 12)}
            </Text>
          </View>

          <Text style={[styles.taxNote, { color: theme.colors.textSecondary }]}>
            * VA disability compensation is tax-free
          </Text>
        </Card>
      )}

      {/* Retirement Calculator */}
      {(mode === 'retirement' || mode === 'combined') && (
        <Card style={styles.calcCard}>
          <View style={styles.calcHeader}>
            <Ionicons name="medal" size={24} color={theme.colors.primary} />
            <Text style={[styles.calcTitle, { color: theme.colors.text }]}>
              Military Retirement Pay
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
              Retirement System
            </Text>
            <View style={styles.systemButtons}>
              <TouchableOpacity
                style={[
                  styles.systemButton,
                  {
                    backgroundColor:
                      retirementSystem === 'legacy_high3'
                        ? theme.colors.primary
                        : theme.colors.surfaceVariant,
                  },
                ]}
                onPress={() => setRetirementSystem('legacy_high3')}
              >
                <Text
                  style={[
                    styles.systemButtonText,
                    {
                      color:
                        retirementSystem === 'legacy_high3'
                          ? '#fff'
                          : theme.colors.text,
                    },
                  ]}
                >
                  High-3
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.systemButton,
                  {
                    backgroundColor:
                      retirementSystem === 'brs'
                        ? theme.colors.primary
                        : theme.colors.surfaceVariant,
                  },
                ]}
                onPress={() => setRetirementSystem('brs')}
              >
                <Text
                  style={[
                    styles.systemButtonText,
                    {
                      color:
                        retirementSystem === 'brs' ? '#fff' : theme.colors.text,
                    },
                  ]}
                >
                  BRS
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                Years of Service
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                value={yearsOfService}
                onChangeText={setYearsOfService}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputHalf}>
              <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                High-3 Base Pay
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                value={highThreePay}
                onChangeText={setHighThreePay}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={[styles.formulaRow, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Text style={[styles.formulaText, { color: theme.colors.textSecondary }]}>
              {retirementSystem === 'brs'
                ? `${yearsOfService} years × 2.0% = ${retirementEstimate.multiplier}% multiplier`
                : `${yearsOfService} years × 2.5% = ${retirementEstimate.multiplier}% multiplier`}
            </Text>
          </View>

          <View style={[styles.resultRow, { borderTopColor: theme.colors.border }]}>
            <Text style={[styles.resultLabel, { color: theme.colors.textSecondary }]}>
              Monthly Retirement
            </Text>
            <Text style={[styles.resultValue, { color: theme.colors.primary }]}>
              {formatCurrency(retirementEstimate.grossMonthlyRetirement)}
            </Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={[styles.resultLabel, { color: theme.colors.textSecondary }]}>
              Annual Retirement
            </Text>
            <Text style={[styles.resultValue, { color: theme.colors.primary }]}>
              {formatCurrency(retirementEstimate.grossMonthlyRetirement * 12)}
            </Text>
          </View>
        </Card>
      )}

      {/* Combined Total */}
      {mode === 'combined' && (
        <Card style={[styles.totalCard, { backgroundColor: theme.colors.income + '10' }]}>
          <View style={styles.totalHeader}>
            <Ionicons name="wallet" size={28} color={theme.colors.income} />
            <Text style={[styles.totalTitle, { color: theme.colors.text }]}>
              Total Post-Separation Income
            </Text>
          </View>

          <View style={styles.totalBreakdown}>
            <View style={styles.totalItem}>
              <Text style={[styles.totalItemLabel, { color: theme.colors.textSecondary }]}>
                VA Disability
              </Text>
              <Text style={[styles.totalItemValue, { color: theme.colors.text }]}>
                {formatCurrency(vaEstimate)}
              </Text>
            </View>
            <View style={styles.totalItem}>
              <Text style={[styles.totalItemLabel, { color: theme.colors.textSecondary }]}>
                Retirement Pay
              </Text>
              <Text style={[styles.totalItemValue, { color: theme.colors.text }]}>
                {formatCurrency(retirementEstimate.grossMonthlyRetirement)}
              </Text>
            </View>
          </View>

          <View style={[styles.totalFinal, { borderTopColor: theme.colors.border }]}>
            <View>
              <Text style={[styles.totalFinalLabel, { color: theme.colors.textSecondary }]}>
                Monthly Total
              </Text>
              <Text style={[styles.totalFinalValue, { color: theme.colors.income }]}>
                {formatCurrency(totalMonthly)}
              </Text>
            </View>
            <View>
              <Text style={[styles.totalFinalLabel, { color: theme.colors.textSecondary }]}>
                Annual Total
              </Text>
              <Text style={[styles.totalFinalValue, { color: theme.colors.income }]}>
                {formatCurrency(totalMonthly * 12)}
              </Text>
            </View>
          </View>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },

  // Compact styles
  compactCard: {},
  compactRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  compactItem: {
    alignItems: 'center',
  },
  compactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  compactLabel: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xs,
  },
  compactValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  compactTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  compactTotalLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  compactTotalValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },

  // Calculator card
  calcCard: {},
  calcHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  calcTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  // Inputs
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.sm,
  },
  textInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.md,
  },
  smallInput: {
    width: 60,
    height: 40,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    fontSize: typography.fontSize.md,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  inputHalf: {
    flex: 1,
  },

  // Rating buttons
  ratingButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  ratingButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  ratingButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },

  // System buttons
  systemButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  systemButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  systemButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },

  // Dependents
  dependentsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkboxLabel: {
    fontSize: typography.fontSize.md,
  },
  dependentInput: {},

  // Formula
  formulaRow: {
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
  formulaText: {
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },

  // Results
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'transparent',
  },
  resultLabel: {
    fontSize: typography.fontSize.md,
  },
  resultValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  taxNote: {
    fontSize: typography.fontSize.xs,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },

  // Total card
  totalCard: {
    padding: spacing.lg,
  },
  totalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  totalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  totalBreakdown: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  totalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalItemLabel: {
    fontSize: typography.fontSize.md,
  },
  totalItemValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  totalFinal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  totalFinalLabel: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xs,
  },
  totalFinalValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
});

export default BenefitsCalculator;
