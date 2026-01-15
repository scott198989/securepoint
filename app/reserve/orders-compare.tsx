/**
 * Orders Comparison Screen
 * Compare military orders pay with civilian income
 */

import React, { useState } from 'react';
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
import { OrdersCivilianComparison } from '../../types/reserve';

// ============================================================================
// CONSTANTS
// ============================================================================

const PAY_GRADES: PayGrade[] = [
  'E-1', 'E-2', 'E-3', 'E-4', 'E-5', 'E-6', 'E-7', 'E-8', 'E-9',
  'W-1', 'W-2', 'W-3', 'W-4', 'W-5',
  'O-1', 'O-2', 'O-3', 'O-4', 'O-5', 'O-6', 'O-7', 'O-8', 'O-9', 'O-10',
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function OrdersCompareScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { calculateATPay, civilianJob, setCivilianJob } = useReserveStore();
  const payProfile = usePayProfileStore((state) => state.payProfile);

  // Military inputs
  const [payGrade, setPayGrade] = useState<PayGrade>(payProfile?.payGrade || 'E-4');
  const [yearsOfService, setYearsOfService] = useState(payProfile?.yearsOfService || 4);
  const [ordersDays, setOrdersDays] = useState('30');
  const [bahAmount, setBahAmount] = useState('1500');

  // Civilian inputs
  const [civilianSalary, setCivilianSalary] = useState(
    civilianJob?.annualSalary ? String(civilianJob.annualSalary) : '50000'
  );
  const [hasDifferentialPay, setHasDifferentialPay] = useState(
    civilianJob?.differentialPayPolicy || false
  );

  // Calculate military pay
  const days = parseInt(ordersDays, 10) || 30;
  const militaryPay = calculateATPay({
    payGrade,
    yearsOfService,
    days,
    includeBAH: true,
    bahAmount: parseFloat(bahAmount) || 1500,
    includeBAS: true,
    includePerDiem: true,
    perDiemRate: 178,
  });

  // Calculate civilian pay for same period
  const annualSalary = parseFloat(civilianSalary) || 50000;
  const workingDaysPerYear = 260;
  const civilianDailyRate = annualSalary / workingDaysPerYear;
  const civilianPay = civilianDailyRate * days;

  // Calculate comparison
  const payDifference = militaryPay.grossPay - civilianPay;
  const percentDifference = ((payDifference / civilianPay) * 100);
  const taxAdvantage = militaryPay.taxFreeAmount;

  // Determine recommendation
  let recommendation: 'take' | 'decline' | 'neutral' = 'neutral';
  let recommendationColor = theme.colors.textSecondary;
  let recommendationIcon = 'help-circle';

  if (payDifference > 500) {
    recommendation = 'take';
    recommendationColor = theme.colors.income;
    recommendationIcon = 'checkmark-circle';
  } else if (payDifference < -500 && !hasDifferentialPay) {
    recommendation = 'decline';
    recommendationColor = theme.colors.warning;
    recommendationIcon = 'warning';
  }

  // Differential pay calculation
  const differentialAmount = hasDifferentialPay && payDifference < 0
    ? Math.abs(payDifference)
    : 0;

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
          Compare your military orders pay with what you'd earn at your civilian job to make informed decisions.
        </Text>
      </Card>

      {/* Military Orders Section */}
      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="shield" size={24} color={theme.colors.primary} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Military Orders
          </Text>
        </View>

        {/* Pay Grade */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
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

        {/* Days and BAH */}
        <View style={styles.inputRow}>
          <View style={styles.inputHalf}>
            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
              Days on Orders
            </Text>
            <TextInput
              style={[styles.textInput, { color: theme.colors.text, borderColor: theme.colors.border }]}
              value={ordersDays}
              onChangeText={setOrdersDays}
              keyboardType="numeric"
              placeholder="30"
              placeholderTextColor={theme.colors.textTertiary}
            />
          </View>
          <View style={styles.inputHalf}>
            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
              Monthly BAH
            </Text>
            <TextInput
              style={[styles.textInput, { color: theme.colors.text, borderColor: theme.colors.border }]}
              value={bahAmount}
              onChangeText={setBahAmount}
              keyboardType="numeric"
              placeholder="1500"
              placeholderTextColor={theme.colors.textTertiary}
            />
          </View>
        </View>

        {/* Military Pay Summary */}
        <View style={[styles.paySummary, { backgroundColor: theme.colors.primary + '10' }]}>
          <Text style={[styles.paySummaryLabel, { color: theme.colors.textSecondary }]}>
            Total Military Pay
          </Text>
          <Text style={[styles.paySummaryValue, { color: theme.colors.primary }]}>
            {formatCurrency(militaryPay.grossPay)}
          </Text>
          <Text style={[styles.paySummaryNote, { color: theme.colors.income }]}>
            Includes {formatCurrency(taxAdvantage)} tax-free
          </Text>
        </View>
      </Card>

      {/* Civilian Job Section */}
      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="briefcase" size={24} color={theme.colors.warning} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Civilian Job
          </Text>
        </View>

        {/* Annual Salary */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
            Annual Salary
          </Text>
          <View style={styles.salaryInput}>
            <Text style={[styles.currencyPrefix, { color: theme.colors.textSecondary }]}>$</Text>
            <TextInput
              style={[styles.textInput, styles.salaryTextInput, { color: theme.colors.text, borderColor: theme.colors.border }]}
              value={civilianSalary}
              onChangeText={setCivilianSalary}
              keyboardType="numeric"
              placeholder="50000"
              placeholderTextColor={theme.colors.textTertiary}
            />
          </View>
        </View>

        {/* Differential Pay Toggle */}
        <TouchableOpacity
          style={[styles.toggleRow, { borderTopColor: theme.colors.border }]}
          onPress={() => setHasDifferentialPay(!hasDifferentialPay)}
        >
          <View style={styles.toggleInfo}>
            <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>
              Employer Differential Pay
            </Text>
            <Text style={[styles.toggleHint, { color: theme.colors.textSecondary }]}>
              USERRA - employer makes up the difference
            </Text>
          </View>
          <View
            style={[
              styles.toggle,
              { backgroundColor: hasDifferentialPay ? theme.colors.primary : theme.colors.surfaceVariant },
            ]}
          >
            <View style={[styles.toggleKnob, hasDifferentialPay && styles.toggleKnobActive]} />
          </View>
        </TouchableOpacity>

        {/* Civilian Pay Summary */}
        <View style={[styles.paySummary, { backgroundColor: theme.colors.warning + '10' }]}>
          <Text style={[styles.paySummaryLabel, { color: theme.colors.textSecondary }]}>
            Civilian Pay for {days} Days
          </Text>
          <Text style={[styles.paySummaryValue, { color: theme.colors.warning }]}>
            {formatCurrency(civilianPay)}
          </Text>
          <Text style={[styles.paySummaryNote, { color: theme.colors.textSecondary }]}>
            {formatCurrency(civilianDailyRate)}/day
          </Text>
        </View>
      </Card>

      {/* Comparison Results */}
      <Card style={[styles.comparisonCard, { backgroundColor: recommendationColor + '15' }]}>
        <View style={styles.comparisonHeader}>
          <Ionicons name={recommendationIcon as any} size={32} color={recommendationColor} />
          <View style={styles.comparisonHeaderText}>
            <Text style={[styles.comparisonTitle, { color: theme.colors.text }]}>
              {recommendation === 'take' && 'Military Orders Pay More'}
              {recommendation === 'decline' && 'Consider Carefully'}
              {recommendation === 'neutral' && 'Similar Pay'}
            </Text>
            <Text style={[styles.comparisonSubtitle, { color: recommendationColor }]}>
              {payDifference >= 0 ? '+' : ''}{formatCurrency(payDifference)} difference
            </Text>
          </View>
        </View>

        <View style={[styles.comparisonDetails, { borderTopColor: theme.colors.border }]}>
          <View style={styles.comparisonRow}>
            <Text style={[styles.comparisonLabel, { color: theme.colors.textSecondary }]}>
              Military Pay
            </Text>
            <Text style={[styles.comparisonValue, { color: theme.colors.primary }]}>
              {formatCurrency(militaryPay.grossPay)}
            </Text>
          </View>
          <View style={styles.comparisonRow}>
            <Text style={[styles.comparisonLabel, { color: theme.colors.textSecondary }]}>
              Civilian Pay
            </Text>
            <Text style={[styles.comparisonValue, { color: theme.colors.warning }]}>
              {formatCurrency(civilianPay)}
            </Text>
          </View>
          <View style={styles.comparisonRow}>
            <Text style={[styles.comparisonLabel, { color: theme.colors.textSecondary }]}>
              Difference
            </Text>
            <Text
              style={[
                styles.comparisonValue,
                { color: payDifference >= 0 ? theme.colors.income : theme.colors.expense },
              ]}
            >
              {payDifference >= 0 ? '+' : ''}{formatCurrency(payDifference)}
            </Text>
          </View>
          <View style={styles.comparisonRow}>
            <Text style={[styles.comparisonLabel, { color: theme.colors.textSecondary }]}>
              Percent Difference
            </Text>
            <Text
              style={[
                styles.comparisonValue,
                { color: percentDifference >= 0 ? theme.colors.income : theme.colors.expense },
              ]}
            >
              {percentDifference >= 0 ? '+' : ''}{percentDifference.toFixed(1)}%
            </Text>
          </View>
          <View style={styles.comparisonRow}>
            <Text style={[styles.comparisonLabel, { color: theme.colors.textSecondary }]}>
              Tax-Free Benefits
            </Text>
            <Text style={[styles.comparisonValue, { color: theme.colors.income }]}>
              {formatCurrency(taxAdvantage)}
            </Text>
          </View>
          {differentialAmount > 0 && (
            <View style={styles.comparisonRow}>
              <Text style={[styles.comparisonLabel, { color: theme.colors.textSecondary }]}>
                Employer Differential
              </Text>
              <Text style={[styles.comparisonValue, { color: theme.colors.income }]}>
                +{formatCurrency(differentialAmount)}
              </Text>
            </View>
          )}
        </View>
      </Card>

      {/* Considerations */}
      <Card style={styles.considerationsCard}>
        <Text style={[styles.considerationsTitle, { color: theme.colors.text }]}>
          Other Considerations
        </Text>
        <View style={styles.considerationsList}>
          <View style={styles.considerationItem}>
            <Ionicons name="checkmark-circle" size={18} color={theme.colors.income} />
            <Text style={[styles.considerationText, { color: theme.colors.textSecondary }]}>
              Military service counts toward retirement
            </Text>
          </View>
          <View style={styles.considerationItem}>
            <Ionicons name="checkmark-circle" size={18} color={theme.colors.income} />
            <Text style={[styles.considerationText, { color: theme.colors.textSecondary }]}>
              TRICARE health coverage benefits
            </Text>
          </View>
          <View style={styles.considerationItem}>
            <Ionicons name="checkmark-circle" size={18} color={theme.colors.income} />
            <Text style={[styles.considerationText, { color: theme.colors.textSecondary }]}>
              USERRA job protection rights
            </Text>
          </View>
          <View style={styles.considerationItem}>
            <Ionicons name="alert-circle" size={18} color={theme.colors.warning} />
            <Text style={[styles.considerationText, { color: theme.colors.textSecondary }]}>
              Impact on civilian career progression
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

  // Section Card
  sectionCard: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },

  // Input Groups
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xs,
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
  inputRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  inputHalf: {
    flex: 1,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.md,
  },
  salaryInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyPrefix: {
    fontSize: typography.fontSize.lg,
    marginRight: spacing.xs,
  },
  salaryTextInput: {
    flex: 1,
  },

  // Toggle
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    marginBottom: spacing.md,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  toggleHint: {
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

  // Pay Summary
  paySummary: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  paySummaryLabel: {
    fontSize: typography.fontSize.sm,
  },
  paySummaryValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    marginVertical: spacing.xs,
  },
  paySummaryNote: {
    fontSize: typography.fontSize.sm,
  },

  // Comparison Card
  comparisonCard: {
    marginBottom: spacing.md,
  },
  comparisonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  comparisonHeaderText: {
    flex: 1,
  },
  comparisonTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  comparisonSubtitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginTop: 2,
  },
  comparisonDetails: {
    borderTopWidth: 1,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: typography.fontSize.md,
  },
  comparisonValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  // Considerations
  considerationsCard: {
    marginBottom: spacing.md,
  },
  considerationsTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },
  considerationsList: {
    gap: spacing.sm,
  },
  considerationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  considerationText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
});
