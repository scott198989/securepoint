/**
 * AT (Annual Training) Pay Calculator Screen
 * Calculate pay for Annual Training periods
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks';
import { useReserveStore } from '../../store/reserveStore';
import { usePayProfileStore } from '../../store/payProfileStore';
import { Card } from '../../components/common';
import { typography, borderRadius, spacing } from '../../constants/theme';
import { formatCurrency } from '../../utils/formatters';
import { PayGrade } from '../../types/user';

// ============================================================================
// CONSTANTS
// ============================================================================

const PAY_GRADES: PayGrade[] = [
  'E-1', 'E-2', 'E-3', 'E-4', 'E-5', 'E-6', 'E-7', 'E-8', 'E-9',
  'W-1', 'W-2', 'W-3', 'W-4', 'W-5',
  'O-1', 'O-2', 'O-3', 'O-4', 'O-5', 'O-6', 'O-7', 'O-8', 'O-9', 'O-10',
];

const YOS_OPTIONS = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30];

const DAYS_OPTIONS = [7, 10, 14, 15, 21, 28, 29, 30];

const DEFAULT_PER_DIEM = 178; // Standard CONUS per diem rate 2024

// ============================================================================
// COMPONENT
// ============================================================================

export default function ATCalculatorScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { calculateATPay } = useReserveStore();
  const payProfile = usePayProfileStore((state) => state.payProfile);

  // State
  const [payGrade, setPayGrade] = useState<PayGrade>(payProfile?.payGrade || 'E-4');
  const [yearsOfService, setYearsOfService] = useState(payProfile?.yearsOfService || 4);
  const [days, setDays] = useState(15);
  const [customDays, setCustomDays] = useState('');
  const [includeBAH, setIncludeBAH] = useState(true);
  const [bahAmount, setBahAmount] = useState(1500);
  const [includeBAS, setIncludeBAS] = useState(true);
  const [includePerDiem, setIncludePerDiem] = useState(true);
  const [perDiemRate, setPerDiemRate] = useState(DEFAULT_PER_DIEM);

  // Handle custom days input
  const actualDays = customDays ? parseInt(customDays, 10) || days : days;

  // Calculate result
  const result = useMemo(() => {
    return calculateATPay({
      payGrade,
      yearsOfService,
      days: actualDays,
      includeBAH,
      bahAmount,
      includeBAS,
      includePerDiem,
      perDiemRate,
    });
  }, [payGrade, yearsOfService, actualDays, includeBAH, bahAmount, includeBAS, includePerDiem, perDiemRate, calculateATPay]);

  const handleDaysSelect = (d: number) => {
    setDays(d);
    setCustomDays('');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      {/* Info Banner */}
      <Card style={[styles.infoBanner, { backgroundColor: theme.colors.info + '15' }]}>
        <Ionicons name="information-circle" size={20} color={theme.colors.info} />
        <Text style={[styles.infoText, { color: theme.colors.info }]}>
          Annual Training (AT) pay is calculated at daily active duty rates. Standard AT is 15 days.
        </Text>
      </Card>

      {/* Pay Grade Selector */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Pay Grade
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.optionsRow}
        >
          {PAY_GRADES.map((grade) => (
            <TouchableOpacity
              key={grade}
              style={[
                styles.optionChip,
                { borderColor: theme.colors.border },
                payGrade === grade && {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.primary,
                },
              ]}
              onPress={() => setPayGrade(grade)}
            >
              <Text
                style={[
                  styles.optionChipText,
                  { color: payGrade === grade ? '#fff' : theme.colors.text },
                ]}
              >
                {grade}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Years of Service Selector */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Years of Service
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.optionsRow}
        >
          {YOS_OPTIONS.map((yos) => (
            <TouchableOpacity
              key={yos}
              style={[
                styles.optionChip,
                { borderColor: theme.colors.border },
                yearsOfService === yos && {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.primary,
                },
              ]}
              onPress={() => setYearsOfService(yos)}
            >
              <Text
                style={[
                  styles.optionChipText,
                  { color: yearsOfService === yos ? '#fff' : theme.colors.text },
                ]}
              >
                {yos}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Days Selector */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Number of Days
        </Text>
        <View style={styles.daysRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.optionsRow}
          >
            {DAYS_OPTIONS.map((d) => (
              <TouchableOpacity
                key={d}
                style={[
                  styles.optionChip,
                  { borderColor: theme.colors.border },
                  days === d && !customDays && {
                    backgroundColor: theme.colors.primary,
                    borderColor: theme.colors.primary,
                  },
                ]}
                onPress={() => handleDaysSelect(d)}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    { color: days === d && !customDays ? '#fff' : theme.colors.text },
                  ]}
                >
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View style={styles.customInput}>
          <Text style={[styles.customLabel, { color: theme.colors.textSecondary }]}>
            Or enter custom:
          </Text>
          <TextInput
            style={[
              styles.customTextInput,
              {
                color: theme.colors.text,
                borderColor: customDays ? theme.colors.primary : theme.colors.border,
              },
            ]}
            value={customDays}
            onChangeText={setCustomDays}
            placeholder="Days"
            placeholderTextColor={theme.colors.textTertiary}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Allowances Section */}
      <Card style={styles.allowancesCard}>
        <Text style={[styles.allowancesTitle, { color: theme.colors.text }]}>
          Allowances
        </Text>

        {/* BAH Toggle */}
        <TouchableOpacity
          style={[styles.allowanceRow, { borderBottomColor: theme.colors.border }]}
          onPress={() => setIncludeBAH(!includeBAH)}
        >
          <View style={styles.allowanceInfo}>
            <Text style={[styles.allowanceLabel, { color: theme.colors.text }]}>
              BAH (Housing)
            </Text>
            {includeBAH && (
              <Text style={[styles.allowanceAmount, { color: theme.colors.income }]}>
                ${bahAmount}/mo
              </Text>
            )}
          </View>
          <View
            style={[
              styles.toggle,
              { backgroundColor: includeBAH ? theme.colors.primary : theme.colors.surfaceVariant },
            ]}
          >
            <View style={[styles.toggleKnob, includeBAH && styles.toggleKnobActive]} />
          </View>
        </TouchableOpacity>

        {/* BAS Toggle */}
        <TouchableOpacity
          style={[styles.allowanceRow, { borderBottomColor: theme.colors.border }]}
          onPress={() => setIncludeBAS(!includeBAS)}
        >
          <View style={styles.allowanceInfo}>
            <Text style={[styles.allowanceLabel, { color: theme.colors.text }]}>
              BAS (Subsistence)
            </Text>
            {includeBAS && (
              <Text style={[styles.allowanceAmount, { color: theme.colors.income }]}>
                ~$460/mo
              </Text>
            )}
          </View>
          <View
            style={[
              styles.toggle,
              { backgroundColor: includeBAS ? theme.colors.primary : theme.colors.surfaceVariant },
            ]}
          >
            <View style={[styles.toggleKnob, includeBAS && styles.toggleKnobActive]} />
          </View>
        </TouchableOpacity>

        {/* Per Diem Toggle */}
        <TouchableOpacity
          style={styles.allowanceRow}
          onPress={() => setIncludePerDiem(!includePerDiem)}
        >
          <View style={styles.allowanceInfo}>
            <Text style={[styles.allowanceLabel, { color: theme.colors.text }]}>
              Per Diem
            </Text>
            {includePerDiem && (
              <Text style={[styles.allowanceAmount, { color: theme.colors.income }]}>
                ${perDiemRate}/day
              </Text>
            )}
          </View>
          <View
            style={[
              styles.toggle,
              { backgroundColor: includePerDiem ? theme.colors.primary : theme.colors.surfaceVariant },
            ]}
          >
            <View style={[styles.toggleKnob, includePerDiem && styles.toggleKnobActive]} />
          </View>
        </TouchableOpacity>
      </Card>

      {/* Results */}
      <Card style={[styles.resultCard, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.resultLabel}>Annual Training Pay</Text>
        <Text style={styles.resultValue}>
          {formatCurrency(result.grossPay)}
        </Text>
        <Text style={styles.resultSubtext}>
          {actualDays} days total
        </Text>
      </Card>

      {/* Breakdown */}
      <Card style={styles.breakdownCard}>
        <Text style={[styles.breakdownTitle, { color: theme.colors.text }]}>
          Pay Breakdown
        </Text>

        {result.breakdown.map((item, index) => (
          <View
            key={index}
            style={[styles.breakdownRow, { borderBottomColor: theme.colors.border }]}
          >
            <View style={styles.breakdownLeft}>
              <Text style={[styles.breakdownItem, { color: theme.colors.text }]}>
                {item.item}
              </Text>
              <View style={styles.taxBadgeRow}>
                {item.taxable ? (
                  <View style={[styles.taxBadge, { backgroundColor: theme.colors.warning + '20' }]}>
                    <Text style={[styles.taxBadgeText, { color: theme.colors.warning }]}>
                      Taxable
                    </Text>
                  </View>
                ) : (
                  <View style={[styles.taxBadge, { backgroundColor: theme.colors.income + '20' }]}>
                    <Text style={[styles.taxBadgeText, { color: theme.colors.income }]}>
                      Tax-Free
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <Text style={[styles.breakdownAmount, { color: theme.colors.income }]}>
              {formatCurrency(item.amount)}
            </Text>
          </View>
        ))}

        <View style={styles.breakdownDivider} />

        <View style={styles.breakdownSummary}>
          <View style={styles.breakdownRow}>
            <Text style={[styles.breakdownItem, { color: theme.colors.textSecondary }]}>
              Taxable Amount
            </Text>
            <Text style={[styles.breakdownAmount, { color: theme.colors.text }]}>
              {formatCurrency(result.taxableAmount)}
            </Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={[styles.breakdownItem, { color: theme.colors.textSecondary }]}>
              Tax-Free Amount
            </Text>
            <Text style={[styles.breakdownAmount, { color: theme.colors.income }]}>
              {formatCurrency(result.taxFreeAmount)}
            </Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={[styles.breakdownItem, { color: theme.colors.textSecondary }]}>
              Est. Taxes (~22%)
            </Text>
            <Text style={[styles.breakdownAmount, { color: theme.colors.expense }]}>
              -{formatCurrency(result.estimatedTaxes)}
            </Text>
          </View>
        </View>

        <View style={[styles.netPayRow, { borderTopColor: theme.colors.border }]}>
          <Text style={[styles.netPayLabel, { color: theme.colors.text }]}>
            Estimated Net Pay
          </Text>
          <Text style={[styles.netPayValue, { color: theme.colors.primary }]}>
            {formatCurrency(result.estimatedNetPay)}
          </Text>
        </View>
      </Card>

      {/* Daily Rates Reference */}
      <Card style={styles.referenceCard}>
        <Text style={[styles.referenceTitle, { color: theme.colors.text }]}>
          Daily Rates
        </Text>
        <View style={styles.referenceGrid}>
          <View style={styles.referenceItem}>
            <Text style={[styles.referenceLabel, { color: theme.colors.textSecondary }]}>
              Base Pay
            </Text>
            <Text style={[styles.referenceValue, { color: theme.colors.text }]}>
              {formatCurrency(result.dailyBasePay)}/day
            </Text>
          </View>
          <View style={styles.referenceItem}>
            <Text style={[styles.referenceLabel, { color: theme.colors.textSecondary }]}>
              BAH
            </Text>
            <Text style={[styles.referenceValue, { color: theme.colors.text }]}>
              {formatCurrency(result.dailyBAH)}/day
            </Text>
          </View>
          <View style={styles.referenceItem}>
            <Text style={[styles.referenceLabel, { color: theme.colors.textSecondary }]}>
              BAS
            </Text>
            <Text style={[styles.referenceValue, { color: theme.colors.text }]}>
              {formatCurrency(result.dailyBAS)}/day
            </Text>
          </View>
          <View style={styles.referenceItem}>
            <Text style={[styles.referenceLabel, { color: theme.colors.textSecondary }]}>
              Per Diem
            </Text>
            <Text style={[styles.referenceValue, { color: theme.colors.text }]}>
              {formatCurrency(result.dailyPerDiem)}/day
            </Text>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },

  // Info Banner
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },

  // Section
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  optionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  optionChipText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },

  // Days
  daysRow: {
    marginBottom: spacing.sm,
  },
  customInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  customLabel: {
    fontSize: typography.fontSize.sm,
  },
  customTextInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 80,
    fontSize: typography.fontSize.md,
  },

  // Allowances Card
  allowancesCard: {
    marginBottom: spacing.md,
  },
  allowancesTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },
  allowanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  allowanceInfo: {
    flex: 1,
  },
  allowanceLabel: {
    fontSize: typography.fontSize.md,
  },
  allowanceAmount: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
    justifyContent: 'center',
  },
  toggleKnob: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },

  // Result Card
  resultCard: {
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  resultLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.fontSize.sm,
  },
  resultValue: {
    color: '#fff',
    fontSize: typography.fontSize.display,
    fontWeight: typography.fontWeight.bold,
    marginVertical: spacing.xs,
  },
  resultSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.fontSize.sm,
  },

  // Breakdown Card
  breakdownCard: {
    marginBottom: spacing.md,
  },
  breakdownTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  breakdownLeft: {
    flex: 1,
  },
  breakdownItem: {
    fontSize: typography.fontSize.md,
  },
  taxBadgeRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  taxBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  taxBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  breakdownAmount: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  breakdownDivider: {
    height: spacing.sm,
  },
  breakdownSummary: {
    gap: spacing.xs,
  },
  netPayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    marginTop: spacing.md,
    borderTopWidth: 1,
  },
  netPayLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  netPayValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },

  // Reference Card
  referenceCard: {
    marginBottom: spacing.md,
  },
  referenceTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },
  referenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  referenceItem: {
    width: '45%',
  },
  referenceLabel: {
    fontSize: typography.fontSize.sm,
  },
  referenceValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginTop: 2,
  },
});
