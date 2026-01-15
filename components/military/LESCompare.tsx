/**
 * LES Compare Component
 * Visual diff view for comparing two LES entries
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks';
import { typography, borderRadius, spacing } from '../../constants/theme';
import { LESComparison, LESChange, LESEntry } from '../../types/les';
import { formatCurrency } from '../../utils';

// ============================================================================
// TYPES
// ============================================================================

interface LESCompareProps {
  comparison: LESComparison;
  showAllChanges?: boolean;
  compact?: boolean;
}

interface ChangeSummaryProps {
  comparison: LESComparison;
}

interface ChangeListProps {
  changes: LESChange[];
  showAll?: boolean;
}

interface PeriodHeaderProps {
  entry: LESEntry;
  label: string;
  isOld?: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatPeriod(entry: LESEntry): string {
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const month = monthNames[entry.payPeriod.month - 1];
  const periodType = entry.payPeriod.type === 'mid_month' ? '(Mid)' : '(EOM)';
  return `${month} ${entry.payPeriod.year} ${periodType}`;
}

function getChangeIcon(change: LESChange): keyof typeof Ionicons.glyphMap {
  switch (change.changeType) {
    case 'added':
      return 'add-circle';
    case 'removed':
      return 'remove-circle';
    case 'increased':
      return 'arrow-up-circle';
    case 'decreased':
      return 'arrow-down-circle';
    default:
      return 'ellipse';
  }
}

function getChangeColor(change: LESChange, colors: any): string {
  // For entitlements: increase is good, decrease is bad
  // For deductions: increase is bad, decrease is good
  if (change.category === 'entitlement') {
    switch (change.changeType) {
      case 'added':
      case 'increased':
        return colors.income;
      case 'removed':
      case 'decreased':
        return colors.expense;
      default:
        return colors.text;
    }
  } else {
    switch (change.changeType) {
      case 'added':
      case 'increased':
        return colors.expense;
      case 'removed':
      case 'decreased':
        return colors.income;
      default:
        return colors.text;
    }
  }
}

function getCategoryLabel(category: string): string {
  switch (category) {
    case 'entitlement':
      return 'Entitlements';
    case 'deduction':
      return 'Deductions';
    case 'allotment':
      return 'Allotments';
    default:
      return category;
  }
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function PeriodHeader({ entry, label, isOld }: PeriodHeaderProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.periodHeader,
        {
          backgroundColor: isOld
            ? `${theme.colors.textSecondary}15`
            : `${theme.colors.primary}15`,
        },
      ]}
    >
      <Text
        style={[
          styles.periodLabel,
          { color: isOld ? theme.colors.textSecondary : theme.colors.primary },
        ]}
      >
        {label}
      </Text>
      <Text style={[styles.periodDate, { color: theme.colors.text }]}>
        {formatPeriod(entry)}
      </Text>
      <Text
        style={[
          styles.periodAmount,
          { color: isOld ? theme.colors.textSecondary : theme.colors.income },
        ]}
      >
        Net: {formatCurrency(entry.totals.netPay)}
      </Text>
    </View>
  );
}

function ChangeSummary({ comparison }: ChangeSummaryProps) {
  const theme = useTheme();
  const { summary } = comparison;

  const isPositiveChange = summary.netPayDifference > 0;
  const changeColor = isPositiveChange ? theme.colors.income : theme.colors.expense;

  return (
    <View style={[styles.summaryCard, { backgroundColor: theme.colors.card }]}>
      {/* Net Pay Change */}
      <View style={styles.summaryMainRow}>
        <View style={styles.summaryLeft}>
          <Ionicons
            name={isPositiveChange ? 'trending-up' : 'trending-down'}
            size={32}
            color={changeColor}
          />
          <View style={styles.summaryTextContainer}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
              Net Pay Change
            </Text>
            <Text style={[styles.summaryAmount, { color: changeColor }]}>
              {isPositiveChange ? '+' : ''}
              {formatCurrency(summary.netPayDifference)}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.percentBadge,
            { backgroundColor: `${changeColor}20` },
          ]}
        >
          <Text style={[styles.percentText, { color: changeColor }]}>
            {isPositiveChange ? '+' : ''}
            {summary.netPayPercentChange.toFixed(1)}%
          </Text>
        </View>
      </View>

      {/* Change Stats */}
      <View style={styles.summaryStats}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {summary.totalChanges}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Total Changes
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.warning }]}>
            {summary.significantChanges.length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Significant
          </Text>
        </View>
      </View>
    </View>
  );
}

function ChangeList({ changes, showAll = false }: ChangeListProps) {
  const theme = useTheme();

  if (changes.length === 0) {
    return (
      <View style={[styles.noChanges, { backgroundColor: theme.colors.card }]}>
        <Ionicons name="checkmark-circle" size={24} color={theme.colors.income} />
        <Text style={[styles.noChangesText, { color: theme.colors.textSecondary }]}>
          No changes detected
        </Text>
      </View>
    );
  }

  // Group changes by category
  const grouped = changes.reduce((acc, change) => {
    if (!acc[change.category]) {
      acc[change.category] = [];
    }
    acc[change.category].push(change);
    return acc;
  }, {} as Record<string, LESChange[]>);

  return (
    <View style={styles.changeList}>
      {Object.entries(grouped).map(([category, categoryChanges]) => (
        <View key={category} style={styles.categorySection}>
          <Text style={[styles.categoryTitle, { color: theme.colors.textSecondary }]}>
            {getCategoryLabel(category)}
          </Text>
          {categoryChanges.map((change, index) => (
            <ChangeRow key={`${change.type}-${index}`} change={change} />
          ))}
        </View>
      ))}
    </View>
  );
}

function ChangeRow({ change }: { change: LESChange }) {
  const theme = useTheme();
  const changeColor = getChangeColor(change, theme.colors);
  const icon = getChangeIcon(change);

  return (
    <View style={[styles.changeRow, { backgroundColor: theme.colors.card }]}>
      <View style={styles.changeLeft}>
        <Ionicons name={icon} size={20} color={changeColor} />
        <View style={styles.changeInfo}>
          <Text style={[styles.changeDescription, { color: theme.colors.text }]}>
            {change.description}
          </Text>
          <Text style={[styles.changeType, { color: theme.colors.textSecondary }]}>
            {change.changeType.charAt(0).toUpperCase() + change.changeType.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.changeRight}>
        {/* Amount Change */}
        <View style={styles.amountChange}>
          {change.changeType !== 'added' && (
            <Text style={[styles.oldAmount, { color: theme.colors.textSecondary }]}>
              {formatCurrency(change.previousAmount)}
            </Text>
          )}
          <Ionicons
            name="arrow-forward"
            size={12}
            color={theme.colors.textSecondary}
            style={styles.arrowIcon}
          />
          <Text style={[styles.newAmount, { color: changeColor }]}>
            {change.changeType === 'removed' ? '$0.00' : formatCurrency(change.currentAmount)}
          </Text>
        </View>

        {/* Difference Badge */}
        <View
          style={[
            styles.diffBadge,
            { backgroundColor: `${changeColor}15` },
          ]}
        >
          <Text style={[styles.diffText, { color: changeColor }]}>
            {change.difference > 0 ? '+' : ''}
            {formatCurrency(change.difference)}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function LESCompare({
  comparison,
  showAllChanges = true,
  compact = false,
}: LESCompareProps) {
  const theme = useTheme();

  const displayChanges = showAllChanges
    ? comparison.changes
    : comparison.summary.significantChanges;

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <ChangeSummary comparison={comparison} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Period Headers */}
      <View style={styles.periodHeaders}>
        <PeriodHeader
          entry={comparison.previousEntry}
          label="Previous"
          isOld
        />
        <View style={styles.periodArrow}>
          <Ionicons
            name="arrow-forward"
            size={24}
            color={theme.colors.textSecondary}
          />
        </View>
        <PeriodHeader
          entry={comparison.currentEntry}
          label="Current"
        />
      </View>

      {/* Summary Card */}
      <ChangeSummary comparison={comparison} />

      {/* Possible Reason */}
      {comparison.summary.significantChanges.length > 0 && (
        <View style={[styles.reasonCard, { backgroundColor: `${theme.colors.warning}15` }]}>
          <Ionicons name="bulb-outline" size={20} color={theme.colors.warning} />
          <View style={styles.reasonContent}>
            <Text style={[styles.reasonTitle, { color: theme.colors.warning }]}>
              Possible Reason
            </Text>
            <Text style={[styles.reasonText, { color: theme.colors.text }]}>
              {comparison.summary.significantChanges[0].possibleReason ||
                'Check your LES remarks for details'}
            </Text>
          </View>
        </View>
      )}

      {/* Changes List */}
      <View style={styles.changesSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {showAllChanges ? 'All Changes' : 'Significant Changes'}
        </Text>
        <ChangeList changes={displayChanges} showAll={showAllChanges} />
      </View>

      {/* Side by Side Totals */}
      <View style={styles.totalsSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Summary Comparison
        </Text>
        <View style={[styles.totalsCard, { backgroundColor: theme.colors.card }]}>
          <TotalsRow
            label="Gross Pay"
            previous={comparison.previousEntry.totals.grossPay}
            current={comparison.currentEntry.totals.grossPay}
          />
          <TotalsRow
            label="Deductions"
            previous={comparison.previousEntry.totals.totalDeductions}
            current={comparison.currentEntry.totals.totalDeductions}
            isDeduction
          />
          <TotalsRow
            label="Allotments"
            previous={comparison.previousEntry.totals.totalAllotments}
            current={comparison.currentEntry.totals.totalAllotments}
            isDeduction
          />
          <View style={[styles.totalsDivider, { backgroundColor: theme.colors.border }]} />
          <TotalsRow
            label="Net Pay"
            previous={comparison.previousEntry.totals.netPay}
            current={comparison.currentEntry.totals.netPay}
            isBold
          />
        </View>
      </View>
    </ScrollView>
  );
}

function TotalsRow({
  label,
  previous,
  current,
  isDeduction = false,
  isBold = false,
}: {
  label: string;
  previous: number;
  current: number;
  isDeduction?: boolean;
  isBold?: boolean;
}) {
  const theme = useTheme();
  const diff = current - previous;
  const isPositive = isDeduction ? diff < 0 : diff > 0;

  return (
    <View style={styles.totalsRow}>
      <Text
        style={[
          styles.totalsLabel,
          { color: theme.colors.text },
          isBold && styles.totalsBold,
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.totalsValue,
          { color: theme.colors.textSecondary },
        ]}
      >
        {formatCurrency(previous)}
      </Text>
      <Text
        style={[
          styles.totalsValue,
          { color: theme.colors.text },
          isBold && styles.totalsBold,
        ]}
      >
        {formatCurrency(current)}
      </Text>
      <Text
        style={[
          styles.totalsDiff,
          {
            color: diff === 0
              ? theme.colors.textSecondary
              : isPositive
              ? theme.colors.income
              : theme.colors.expense,
          },
        ]}
      >
        {diff === 0 ? '-' : `${diff > 0 ? '+' : ''}${formatCurrency(diff)}`}
      </Text>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  compactContainer: {
    padding: spacing.md,
  },

  // Period Headers
  periodHeaders: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  periodHeader: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  periodLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  periodDate: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  periodAmount: {
    fontSize: typography.fontSize.sm,
  },
  periodArrow: {
    paddingHorizontal: spacing.xs,
  },

  // Summary Card
  summaryCard: {
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  summaryMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  summaryTextContainer: {},
  summaryLabel: {
    fontSize: typography.fontSize.sm,
    marginBottom: 2,
  },
  summaryAmount: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
  },
  percentBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  percentText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  summaryStats: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '100%',
  },

  // Reason Card
  reasonCard: {
    flexDirection: 'row',
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  reasonContent: {
    flex: 1,
  },
  reasonTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    marginBottom: 2,
  },
  reasonText: {
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },

  // Changes Section
  changesSection: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.md,
  },
  changeList: {},
  categorySection: {
    marginBottom: spacing.md,
  },
  categoryTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
  },
  changeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  changeInfo: {
    flex: 1,
  },
  changeDescription: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  changeType: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
  changeRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  amountChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  oldAmount: {
    fontSize: typography.fontSize.sm,
    textDecorationLine: 'line-through',
  },
  arrowIcon: {
    marginHorizontal: spacing.xs,
  },
  newAmount: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  diffBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  diffText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  noChanges: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  noChangesText: {
    fontSize: typography.fontSize.md,
  },

  // Totals Section
  totalsSection: {
    padding: spacing.md,
    paddingTop: 0,
  },
  totalsCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  totalsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  totalsLabel: {
    flex: 2,
    fontSize: typography.fontSize.sm,
  },
  totalsValue: {
    flex: 1.5,
    fontSize: typography.fontSize.sm,
    textAlign: 'right',
  },
  totalsDiff: {
    flex: 1.5,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'right',
  },
  totalsBold: {
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.md,
  },
  totalsDivider: {
    height: 1,
    marginVertical: spacing.sm,
  },
});
