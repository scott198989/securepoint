/**
 * SavingsAccelerator Component
 * Track and visualize deployment savings progress
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
import { Card } from '../common';
import { typography, borderRadius, spacing } from '../../constants/theme';
import { formatCurrency } from '../../utils/formatters';
import {
  DeploymentSavingsTracker,
  DeploymentSavingsSnapshot,
  SavingsMilestone,
} from '../../types/deployment';

// ============================================================================
// TYPES
// ============================================================================

interface SavingsAcceleratorProps {
  tracker: DeploymentSavingsTracker;
  projectedMonthlySavings: number;
  additionalMonthlyPay: number;
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const ProgressBar: React.FC<{
  progress: number;
  color?: string;
  height?: number;
}> = ({ progress, color, height = 8 }) => {
  const theme = useTheme();
  const barColor = color || theme.colors.primary;
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View style={[styles.progressBarContainer, { height }]}>
      <View
        style={[
          styles.progressBarFill,
          {
            backgroundColor: barColor,
            width: `${clampedProgress}%`,
            height,
          },
        ]}
      />
    </View>
  );
};

const MilestoneItem: React.FC<{
  milestone: SavingsMilestone;
  currentSavings: number;
}> = ({ milestone, currentSavings }) => {
  const theme = useTheme();
  const progress = Math.min(100, (currentSavings / milestone.targetAmount) * 100);

  return (
    <View style={styles.milestoneItem}>
      <View style={styles.milestoneHeader}>
        <View style={styles.milestoneLeft}>
          <View
            style={[
              styles.milestoneIcon,
              {
                backgroundColor: milestone.isAchieved
                  ? theme.colors.income + '20'
                  : theme.colors.surfaceVariant,
              },
            ]}
          >
            <Ionicons
              name={milestone.isAchieved ? 'checkmark-circle' : 'flag-outline'}
              size={20}
              color={milestone.isAchieved ? theme.colors.income : theme.colors.textSecondary}
            />
          </View>
          <View>
            <Text style={[styles.milestoneName, { color: theme.colors.text }]}>
              {milestone.name}
            </Text>
            <Text style={[styles.milestoneTarget, { color: theme.colors.textSecondary }]}>
              {formatCurrency(milestone.targetAmount)}
            </Text>
          </View>
        </View>
        {milestone.isAchieved ? (
          <View style={[styles.achievedBadge, { backgroundColor: theme.colors.income + '20' }]}>
            <Text style={[styles.achievedText, { color: theme.colors.income }]}>Achieved!</Text>
          </View>
        ) : (
          <Text style={[styles.milestoneProgress, { color: theme.colors.textSecondary }]}>
            {Math.round(progress)}%
          </Text>
        )}
      </View>
      {!milestone.isAchieved && (
        <ProgressBar
          progress={progress}
          color={progress >= 100 ? theme.colors.income : theme.colors.primary}
          height={4}
        />
      )}
    </View>
  );
};

const MonthlyBreakdown: React.FC<{
  snapshot: DeploymentSavingsSnapshot;
}> = ({ snapshot }) => {
  const theme = useTheme();

  return (
    <View style={[styles.monthCard, { backgroundColor: theme.colors.surfaceVariant }]}>
      <Text style={[styles.monthLabel, { color: theme.colors.text }]}>
        {new Date(snapshot.month + '-01').toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        })}
      </Text>
      <View style={styles.monthStats}>
        <View style={styles.monthStat}>
          <Text style={[styles.monthStatLabel, { color: theme.colors.textSecondary }]}>
            Income
          </Text>
          <Text style={[styles.monthStatValue, { color: theme.colors.income }]}>
            +{formatCurrency(snapshot.militaryIncome + snapshot.deploymentBonusPay)}
          </Text>
        </View>
        <View style={styles.monthStat}>
          <Text style={[styles.monthStatLabel, { color: theme.colors.textSecondary }]}>
            Expenses
          </Text>
          <Text style={[styles.monthStatValue, { color: theme.colors.expense }]}>
            -{formatCurrency(snapshot.totalExpenses)}
          </Text>
        </View>
        <View style={styles.monthStat}>
          <Text style={[styles.monthStatLabel, { color: theme.colors.textSecondary }]}>
            Saved
          </Text>
          <Text style={[styles.monthStatValue, { color: theme.colors.primary }]}>
            {formatCurrency(snapshot.netSavings)}
          </Text>
        </View>
      </View>
    </View>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const SavingsAccelerator: React.FC<SavingsAcceleratorProps> = ({
  tracker,
  projectedMonthlySavings,
  additionalMonthlyPay,
}) => {
  const theme = useTheme();

  const remainingToGoal = Math.max(0, tracker.savingsGoal - tracker.currentSavings);
  const monthsToGoal = projectedMonthlySavings > 0
    ? Math.ceil(remainingToGoal / projectedMonthlySavings)
    : 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Main Progress Card */}
      <Card style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressTitle, { color: theme.colors.text }]}>
            Deployment Savings Goal
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: tracker.onTrack
                  ? theme.colors.income + '20'
                  : theme.colors.warning + '20',
              },
            ]}
          >
            <Ionicons
              name={tracker.onTrack ? 'trending-up' : 'warning-outline'}
              size={14}
              color={tracker.onTrack ? theme.colors.income : theme.colors.warning}
            />
            <Text
              style={[
                styles.statusText,
                { color: tracker.onTrack ? theme.colors.income : theme.colors.warning },
              ]}
            >
              {tracker.onTrack ? 'On Track' : 'Behind'}
            </Text>
          </View>
        </View>

        {/* Large progress display */}
        <View style={styles.largeProgress}>
          <Text style={[styles.currentSavings, { color: theme.colors.income }]}>
            {formatCurrency(tracker.currentSavings)}
          </Text>
          <Text style={[styles.goalText, { color: theme.colors.textSecondary }]}>
            of {formatCurrency(tracker.savingsGoal)} goal
          </Text>
        </View>

        <ProgressBar progress={tracker.progressPercent} height={12} />

        <View style={styles.progressStats}>
          <View style={styles.progressStat}>
            <Text style={[styles.progressStatValue, { color: theme.colors.text }]}>
              {Math.round(tracker.progressPercent)}%
            </Text>
            <Text style={[styles.progressStatLabel, { color: theme.colors.textSecondary }]}>
              Complete
            </Text>
          </View>
          <View style={styles.progressStat}>
            <Text style={[styles.progressStatValue, { color: theme.colors.text }]}>
              {formatCurrency(remainingToGoal)}
            </Text>
            <Text style={[styles.progressStatLabel, { color: theme.colors.textSecondary }]}>
              Remaining
            </Text>
          </View>
          <View style={styles.progressStat}>
            <Text style={[styles.progressStatValue, { color: theme.colors.text }]}>
              {tracker.daysRemaining}
            </Text>
            <Text style={[styles.progressStatLabel, { color: theme.colors.textSecondary }]}>
              Days Left
            </Text>
          </View>
        </View>
      </Card>

      {/* Deployment Boost Card */}
      <Card style={[styles.boostCard, { backgroundColor: theme.colors.income + '10' }]}>
        <View style={styles.boostHeader}>
          <Ionicons name="rocket-outline" size={24} color={theme.colors.income} />
          <Text style={[styles.boostTitle, { color: theme.colors.text }]}>
            Deployment Savings Boost
          </Text>
        </View>
        <Text style={[styles.boostDescription, { color: theme.colors.textSecondary }]}>
          You&apos;re saving extra money during deployment thanks to:
        </Text>
        <View style={styles.boostItems}>
          <View style={styles.boostItem}>
            <Ionicons name="checkmark-circle" size={18} color={theme.colors.income} />
            <Text style={[styles.boostItemText, { color: theme.colors.text }]}>
              Hostile Fire Pay: {formatCurrency(225)}/mo
            </Text>
          </View>
          <View style={styles.boostItem}>
            <Ionicons name="checkmark-circle" size={18} color={theme.colors.income} />
            <Text style={[styles.boostItemText, { color: theme.colors.text }]}>
              Family Separation: {formatCurrency(250)}/mo
            </Text>
          </View>
          <View style={styles.boostItem}>
            <Ionicons name="checkmark-circle" size={18} color={theme.colors.income} />
            <Text style={[styles.boostItemText, { color: theme.colors.text }]}>
              Tax-Free Income (CZTE)
            </Text>
          </View>
          <View style={styles.boostItem}>
            <Ionicons name="checkmark-circle" size={18} color={theme.colors.income} />
            <Text style={[styles.boostItemText, { color: theme.colors.text }]}>
              Reduced Expenses
            </Text>
          </View>
        </View>
        <View style={styles.boostTotal}>
          <Text style={[styles.boostTotalLabel, { color: theme.colors.textSecondary }]}>
            Extra Monthly Savings
          </Text>
          <Text style={[styles.boostTotalValue, { color: theme.colors.income }]}>
            +{formatCurrency(additionalMonthlyPay + projectedMonthlySavings * 0.3)}
          </Text>
        </View>
      </Card>

      {/* Milestones */}
      <Card style={styles.milestonesCard}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Milestones</Text>
        <View style={styles.milestonesList}>
          {tracker.milestones.map((milestone) => (
            <MilestoneItem
              key={milestone.id}
              milestone={milestone}
              currentSavings={tracker.currentSavings}
            />
          ))}
        </View>
      </Card>

      {/* Monthly History */}
      {tracker.monthlySnapshots.length > 0 && (
        <Card style={styles.historyCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Monthly History</Text>
          <View style={styles.monthsList}>
            {tracker.monthlySnapshots.slice(-3).reverse().map((snapshot, index) => (
              <MonthlyBreakdown key={index} snapshot={snapshot} />
            ))}
          </View>
        </Card>
      )}

      {/* Projection */}
      <Card style={styles.projectionCard}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Projection</Text>
        <View style={styles.projectionContent}>
          <View style={styles.projectionRow}>
            <Text style={[styles.projectionLabel, { color: theme.colors.textSecondary }]}>
              Monthly savings rate
            </Text>
            <Text style={[styles.projectionValue, { color: theme.colors.text }]}>
              {formatCurrency(projectedMonthlySavings)}
            </Text>
          </View>
          <View style={styles.projectionRow}>
            <Text style={[styles.projectionLabel, { color: theme.colors.textSecondary }]}>
              Months to goal
            </Text>
            <Text style={[styles.projectionValue, { color: theme.colors.text }]}>
              {monthsToGoal} months
            </Text>
          </View>
          <View style={styles.projectionRow}>
            <Text style={[styles.projectionLabel, { color: theme.colors.textSecondary }]}>
              Projected end total
            </Text>
            <Text style={[styles.projectionValue, { color: theme.colors.income }]}>
              {formatCurrency(tracker.projectedEndTotal || tracker.savingsGoal)}
            </Text>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Progress Card
  progressCard: {
    marginBottom: spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  largeProgress: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  currentSavings: {
    fontSize: typography.fontSize.display,
    fontWeight: typography.fontWeight.bold,
  },
  goalText: {
    fontSize: typography.fontSize.md,
    marginTop: spacing.xs,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
  },
  progressStat: {
    alignItems: 'center',
  },
  progressStatValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  progressStatLabel: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },

  // Progress Bar
  progressBarContainer: {
    width: '100%',
    backgroundColor: '#e5e5e5',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    borderRadius: borderRadius.full,
  },

  // Boost Card
  boostCard: {
    marginBottom: spacing.md,
  },
  boostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  boostTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  boostDescription: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.md,
  },
  boostItems: {
    gap: spacing.sm,
  },
  boostItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  boostItemText: {
    fontSize: typography.fontSize.sm,
  },
  boostTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  boostTotalLabel: {
    fontSize: typography.fontSize.sm,
  },
  boostTotalValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },

  // Milestones Card
  milestonesCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },
  milestonesList: {
    gap: spacing.md,
  },
  milestoneItem: {
    gap: spacing.sm,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  milestoneLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  milestoneIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  milestoneTarget: {
    fontSize: typography.fontSize.sm,
  },
  milestoneProgress: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  achievedBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  achievedText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },

  // History Card
  historyCard: {
    marginBottom: spacing.md,
  },
  monthsList: {
    gap: spacing.sm,
  },
  monthCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  monthLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.sm,
  },
  monthStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  monthStat: {},
  monthStatLabel: {
    fontSize: typography.fontSize.xs,
  },
  monthStatValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  // Projection Card
  projectionCard: {
    marginBottom: spacing.xl,
  },
  projectionContent: {
    gap: spacing.sm,
  },
  projectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  projectionLabel: {
    fontSize: typography.fontSize.sm,
  },
  projectionValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
});

export default SavingsAccelerator;
