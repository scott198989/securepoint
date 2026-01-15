/**
 * TSP Options Screen
 * TSP withdrawal and rollover strategies
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
import { useTransitionStore } from '../../store/transitionStore';
import { Card } from '../../components/common';
import { typography, borderRadius, spacing } from '../../constants/theme';
import { formatCurrency } from '../../utils/formatters';
import { TSPWithdrawalOption } from '../../types/transition';

type IoniconsName = keyof typeof Ionicons.glyphMap;

const WITHDRAWAL_OPTIONS: {
  option: TSPWithdrawalOption;
  title: string;
  description: string;
  icon: IoniconsName;
  pros: string[];
  cons: string[];
}[] = [
  {
    option: 'leave_in_place',
    title: 'Leave in TSP',
    description: 'Keep your money in TSP after separation',
    icon: 'lock-closed-outline',
    pros: ['Low expense ratios (0.04%)', 'No taxes or penalties', 'Can still manage online'],
    cons: ['No new contributions', 'Limited investment options'],
  },
  {
    option: 'rollover_ira',
    title: 'Rollover to IRA',
    description: 'Transfer to a traditional or Roth IRA',
    icon: 'arrow-redo-outline',
    pros: ['More investment options', 'Consolidate accounts', 'No taxes if done correctly'],
    cons: ['May have higher fees', 'Lose TSP G Fund access', 'More complex'],
  },
  {
    option: 'rollover_401k',
    title: 'Rollover to New 401(k)',
    description: 'Transfer to new employer retirement plan',
    icon: 'business-outline',
    pros: ['Consolidate with new employer', 'May have good options', 'No taxes if direct'],
    cons: ['Depends on new plan quality', 'Limited to plan options'],
  },
  {
    option: 'partial_withdrawal',
    title: 'Partial Withdrawal',
    description: 'Take some money out, leave the rest',
    icon: 'card-outline',
    pros: ['Access some funds', 'Rest continues growing', 'Flexible amounts'],
    cons: ['Taxes on withdrawal', 'Possible 10% penalty if under 59½'],
  },
  {
    option: 'annuity',
    title: 'TSP Annuity',
    description: 'Convert to guaranteed monthly income',
    icon: 'calendar-outline',
    pros: ['Guaranteed lifetime income', 'Predictable payments', 'Survivor options'],
    cons: ['Lose control of principal', 'Inflation may erode value', 'Irrevocable'],
  },
];

export default function TSPOptionsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { tspSummary, setTSPSummary } = useTransitionStore();

  const [traditionalBalance, setTraditionalBalance] = useState(
    tspSummary?.traditionalBalance?.toString() || '50000'
  );
  const [rothBalance, setRothBalance] = useState(
    tspSummary?.rothBalance?.toString() || '20000'
  );
  const [selectedOption, setSelectedOption] = useState<TSPWithdrawalOption | null>(null);

  // Calculate totals
  const traditional = parseFloat(traditionalBalance) || 0;
  const roth = parseFloat(rothBalance) || 0;
  const totalBalance = traditional + roth;

  // Withdrawal penalty calculation (simplified)
  const earlyWithdrawalPenalty = totalBalance * 0.1;
  const estimatedTaxes = traditional * 0.22; // 22% tax rate estimate

  const handleSaveBalances = () => {
    setTSPSummary({
      traditionalBalance: traditional,
      rothBalance: roth,
      totalBalance: traditional + roth,
    });
  };

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
        <Ionicons name="trending-up" size={32} color="#fff" />
        <Text style={styles.headerTitle}>TSP Options</Text>
        <Text style={styles.headerSubtitle}>
          Understand your Thrift Savings Plan options after separation
        </Text>
      </Card>

      {/* Balance input */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Your TSP Balance
      </Text>

      <Card style={styles.balanceCard}>
        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
              Traditional TSP
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
              value={traditionalBalance}
              onChangeText={setTraditionalBalance}
              onBlur={handleSaveBalances}
              keyboardType="numeric"
              placeholder="50000"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
              Roth TSP
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
              value={rothBalance}
              onChangeText={setRothBalance}
              onBlur={handleSaveBalances}
              keyboardType="numeric"
              placeholder="20000"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
        </View>

        <View style={[styles.totalRow, { borderTopColor: theme.colors.border }]}>
          <Text style={[styles.totalLabel, { color: theme.colors.text }]}>
            Total Balance
          </Text>
          <Text style={[styles.totalValue, { color: theme.colors.income }]}>
            {formatCurrency(totalBalance)}
          </Text>
        </View>
      </Card>

      {/* Options */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Your Options
      </Text>

      {WITHDRAWAL_OPTIONS.map((option) => (
        <TouchableOpacity
          key={option.option}
          onPress={() =>
            setSelectedOption(
              selectedOption === option.option ? null : option.option
            )
          }
        >
          <Card
            style={[
              styles.optionCard,
              selectedOption === option.option && {
                borderColor: theme.colors.primary,
                borderWidth: 2,
              },
            ]}
          >
            <View style={styles.optionHeader}>
              <View style={[styles.optionIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                <Ionicons name={option.icon} size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.optionInfo}>
                <Text style={[styles.optionTitle, { color: theme.colors.text }]}>
                  {option.title}
                </Text>
                <Text style={[styles.optionDesc, { color: theme.colors.textSecondary }]}>
                  {option.description}
                </Text>
              </View>
              <Ionicons
                name={selectedOption === option.option ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={theme.colors.textSecondary}
              />
            </View>

            {selectedOption === option.option && (
              <View style={styles.optionDetails}>
                <View style={styles.prosConsRow}>
                  <View style={styles.prosCol}>
                    <View style={styles.prosHeader}>
                      <Ionicons name="checkmark-circle" size={16} color={theme.colors.income} />
                      <Text style={[styles.prosTitle, { color: theme.colors.income }]}>
                        Pros
                      </Text>
                    </View>
                    {option.pros.map((pro, i) => (
                      <Text
                        key={i}
                        style={[styles.proConText, { color: theme.colors.textSecondary }]}
                      >
                        • {pro}
                      </Text>
                    ))}
                  </View>
                  <View style={styles.consCol}>
                    <View style={styles.prosHeader}>
                      <Ionicons name="close-circle" size={16} color={theme.colors.expense} />
                      <Text style={[styles.prosTitle, { color: theme.colors.expense }]}>
                        Cons
                      </Text>
                    </View>
                    {option.cons.map((con, i) => (
                      <Text
                        key={i}
                        style={[styles.proConText, { color: theme.colors.textSecondary }]}
                      >
                        • {con}
                      </Text>
                    ))}
                  </View>
                </View>
              </View>
            )}
          </Card>
        </TouchableOpacity>
      ))}

      {/* Penalty warning */}
      <Card style={[styles.warningCard, { backgroundColor: theme.colors.expense + '10' }]}>
        <View style={styles.warningHeader}>
          <Ionicons name="warning" size={24} color={theme.colors.expense} />
          <Text style={[styles.warningTitle, { color: theme.colors.expense }]}>
            Early Withdrawal Warning
          </Text>
        </View>
        <Text style={[styles.warningText, { color: theme.colors.textSecondary }]}>
          If you withdraw before age 59½, you may owe:
        </Text>
        <View style={styles.penaltyList}>
          <View style={styles.penaltyRow}>
            <Text style={[styles.penaltyLabel, { color: theme.colors.text }]}>
              10% Early Withdrawal Penalty
            </Text>
            <Text style={[styles.penaltyValue, { color: theme.colors.expense }]}>
              {formatCurrency(earlyWithdrawalPenalty)}
            </Text>
          </View>
          <View style={styles.penaltyRow}>
            <Text style={[styles.penaltyLabel, { color: theme.colors.text }]}>
              Estimated Federal Tax (22%)
            </Text>
            <Text style={[styles.penaltyValue, { color: theme.colors.expense }]}>
              {formatCurrency(estimatedTaxes)}
            </Text>
          </View>
          <View style={[styles.penaltyRow, { borderTopColor: theme.colors.border, borderTopWidth: 1 }]}>
            <Text style={[styles.penaltyLabel, { color: theme.colors.text, fontWeight: typography.fontWeight.bold }]}>
              Total Potential Cost
            </Text>
            <Text style={[styles.penaltyValue, { color: theme.colors.expense, fontWeight: typography.fontWeight.bold }]}>
              {formatCurrency(earlyWithdrawalPenalty + estimatedTaxes)}
            </Text>
          </View>
        </View>
        <Text style={[styles.warningNote, { color: theme.colors.textSecondary }]}>
          *Exceptions may apply. Consult a financial advisor.
        </Text>
      </Card>

      {/* Tips */}
      <Card style={[styles.tipsCard, { backgroundColor: theme.colors.primary + '10' }]}>
        <View style={styles.tipsHeader}>
          <Ionicons name="bulb" size={24} color={theme.colors.primary} />
          <Text style={[styles.tipsTitle, { color: theme.colors.text }]}>
            Pro Tips
          </Text>
        </View>
        <View style={styles.tipsList}>
          <View style={styles.tipRow}>
            <Text style={[styles.tipBullet, { color: theme.colors.primary }]}>1.</Text>
            <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
              The TSP G Fund is unique - no other fund offers the same risk/return profile.
            </Text>
          </View>
          <View style={styles.tipRow}>
            <Text style={[styles.tipBullet, { color: theme.colors.primary }]}>2.</Text>
            <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
              You can do partial rollovers - leave some in TSP, roll some to IRA.
            </Text>
          </View>
          <View style={styles.tipRow}>
            <Text style={[styles.tipBullet, { color: theme.colors.primary }]}>3.</Text>
            <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
              If you leave federal service at 55+, you can access TSP without the 10% penalty.
            </Text>
          </View>
          <View style={styles.tipRow}>
            <Text style={[styles.tipBullet, { color: theme.colors.primary }]}>4.</Text>
            <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
              Roth TSP contributions have already been taxed - no tax on qualified withdrawals.
            </Text>
          </View>
        </View>
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

  // Balance card
  balanceCard: {},
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
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  totalValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },

  // Option card
  optionCard: {
    marginBottom: spacing.sm,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  optionDesc: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  optionDetails: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  prosConsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  prosCol: {
    flex: 1,
  },
  consCol: {
    flex: 1,
  },
  prosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  prosTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  proConText: {
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
    marginBottom: 2,
  },

  // Warning card
  warningCard: {
    marginTop: spacing.md,
    padding: spacing.md,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  warningTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  warningText: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.md,
  },
  penaltyList: {
    gap: spacing.sm,
  },
  penaltyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  penaltyLabel: {
    fontSize: typography.fontSize.sm,
  },
  penaltyValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  warningNote: {
    fontSize: typography.fontSize.xs,
    fontStyle: 'italic',
    marginTop: spacing.md,
  },

  // Tips card
  tipsCard: {
    marginTop: spacing.md,
    padding: spacing.md,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tipsTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  tipsList: {
    gap: spacing.sm,
  },
  tipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tipBullet: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  tipText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
});
