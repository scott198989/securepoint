/**
 * Transition Timeline Component
 * Visual countdown to ETS with milestones
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks';
import { Card } from '../common';
import { typography, borderRadius, spacing } from '../../constants/theme';
import { useTransitionStore } from '../../store/transitionStore';

interface TransitionTimelineProps {
  compact?: boolean;
}

export function TransitionTimeline({ compact = false }: TransitionTimelineProps) {
  const theme = useTheme();
  const {
    transitionInfo,
    getDaysUntilETS,
    getDaysUntilTerminalLeave,
    getTransitionProgress,
    getUpcomingMilestones,
    getChecklistProgress,
  } = useTransitionStore();

  if (!transitionInfo) {
    return null;
  }

  const daysUntilETS = getDaysUntilETS();
  const daysUntilTerminal = getDaysUntilTerminalLeave();
  const progress = getTransitionProgress();
  const milestones = getUpcomingMilestones();
  const checklistProgress = getChecklistProgress();

  // Calculate weeks and months
  const weeksUntilETS = Math.floor(daysUntilETS / 7);
  const monthsUntilETS = Math.floor(daysUntilETS / 30);

  // Format separation type for display
  const getSeparationTypeLabel = () => {
    switch (transitionInfo.separationType) {
      case 'ets':
        return 'ETS';
      case 'retirement':
        return 'Retirement';
      case 'medical_retirement':
        return 'Medical Retirement';
      case 'medical_separation':
        return 'Medical Separation';
      case 'voluntary_separation':
        return 'Voluntary Separation';
      case 'involuntary_separation':
        return 'Involuntary Separation';
      case 'disability_retirement':
        return 'Disability Retirement';
      default:
        return 'Separation';
    }
  };

  // Get icon for separation type
  const getSeparationIcon = () => {
    switch (transitionInfo.separationType) {
      case 'retirement':
      case 'medical_retirement':
      case 'disability_retirement':
        return 'medal-outline';
      case 'ets':
        return 'calendar-outline';
      default:
        return 'exit-outline';
    }
  };

  if (compact) {
    return (
      <Card style={[styles.compactCard, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.compactContent}>
          <View style={styles.compactLeft}>
            <Ionicons name={getSeparationIcon()} size={24} color="#fff" />
            <View style={styles.compactInfo}>
              <Text style={styles.compactLabel}>{getSeparationTypeLabel()}</Text>
              <Text style={styles.compactDays}>{daysUntilETS} days</Text>
            </View>
          </View>
          <View style={styles.compactProgress}>
            <View style={styles.compactProgressBar}>
              <View
                style={[styles.compactProgressFill, { width: `${progress}%` }]}
              />
            </View>
            <Text style={styles.compactProgressText}>
              {Math.round(progress)}%
            </Text>
          </View>
        </View>
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      {/* Main countdown card */}
      <Card style={[styles.countdownCard, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.countdownHeader}>
          <Ionicons name={getSeparationIcon()} size={32} color="#fff" />
          <Text style={styles.countdownType}>{getSeparationTypeLabel()}</Text>
        </View>

        <View style={styles.countdownRing}>
          <View style={styles.ringOuter}>
            <Text style={styles.daysNumber}>{daysUntilETS}</Text>
            <Text style={styles.daysLabel}>days until</Text>
            <Text style={styles.daysLabel}>{getSeparationTypeLabel()}</Text>
          </View>
        </View>

        <View style={styles.countdownStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{weeksUntilETS}</Text>
            <Text style={styles.statLabel}>Weeks</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{monthsUntilETS}</Text>
            <Text style={styles.statLabel}>Months</Text>
          </View>
          {daysUntilTerminal > 0 && (
            <>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{daysUntilTerminal}</Text>
                <Text style={styles.statLabel}>To Terminal</Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${progress}%` }]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(progress)}% of transition timeline complete
          </Text>
        </View>
      </Card>

      {/* Milestones */}
      {milestones.length > 0 && (
        <Card style={styles.milestonesCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Upcoming Milestones
          </Text>

          {milestones.slice(0, 3).map((milestone, index) => (
            <View
              key={index}
              style={[
                styles.milestoneRow,
                index < milestones.length - 1 && styles.milestoneRowBorder,
              ]}
            >
              <View style={[styles.milestoneIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                <Ionicons
                  name={
                    milestone.name.includes('Terminal')
                      ? 'airplane-outline'
                      : milestone.name.includes('Last Day')
                      ? 'briefcase-outline'
                      : 'flag-outline'
                  }
                  size={20}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.milestoneContent}>
                <Text style={[styles.milestoneName, { color: theme.colors.text }]}>
                  {milestone.name}
                </Text>
                <Text style={[styles.milestoneDate, { color: theme.colors.textSecondary }]}>
                  {new Date(milestone.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </View>
              <View style={styles.milestoneDays}>
                <Text style={[styles.milestoneDaysValue, { color: theme.colors.primary }]}>
                  {milestone.daysUntil}
                </Text>
                <Text style={[styles.milestoneDaysLabel, { color: theme.colors.textSecondary }]}>
                  days
                </Text>
              </View>
            </View>
          ))}
        </Card>
      )}

      {/* Checklist progress */}
      <Card style={styles.checklistCard}>
        <View style={styles.checklistHeader}>
          <Ionicons name="checkbox-outline" size={24} color={theme.colors.primary} />
          <View style={styles.checklistInfo}>
            <Text style={[styles.checklistTitle, { color: theme.colors.text }]}>
              Transition Checklist
            </Text>
            <Text style={[styles.checklistSubtitle, { color: theme.colors.textSecondary }]}>
              {checklistProgress.completed} of {checklistProgress.total} items complete
            </Text>
          </View>
          <View style={styles.checklistPercent}>
            <Text style={[styles.checklistPercentValue, { color: theme.colors.income }]}>
              {checklistProgress.percent}%
            </Text>
          </View>
        </View>
        <View style={[styles.checklistProgressBar, { backgroundColor: theme.colors.surfaceVariant }]}>
          <View
            style={[
              styles.checklistProgressFill,
              { width: `${checklistProgress.percent}%`, backgroundColor: theme.colors.income },
            ]}
          />
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },

  // Compact styles
  compactCard: {
    padding: spacing.md,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  compactInfo: {},
  compactLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.fontSize.sm,
  },
  compactDays: {
    color: '#fff',
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  compactProgress: {
    alignItems: 'flex-end',
  },
  compactProgressBar: {
    width: 80,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  compactProgressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: borderRadius.full,
  },
  compactProgressText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: typography.fontSize.xs,
  },

  // Full countdown card
  countdownCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  countdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  countdownType: {
    color: '#fff',
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  countdownRing: {
    marginBottom: spacing.lg,
  },
  ringOuter: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 12,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  daysNumber: {
    color: '#fff',
    fontSize: 56,
    fontWeight: typography.fontWeight.bold,
    lineHeight: 60,
  },
  daysLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: typography.fontSize.sm,
  },
  countdownStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  statValue: {
    color: '#fff',
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressContainer: {
    width: '100%',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: borderRadius.full,
  },
  progressText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },

  // Milestones card
  milestonesCard: {},
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  milestoneRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  milestoneIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  milestoneDate: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  milestoneDays: {
    alignItems: 'center',
  },
  milestoneDaysValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  milestoneDaysLabel: {
    fontSize: typography.fontSize.xs,
  },

  // Checklist card
  checklistCard: {},
  checklistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  checklistInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  checklistTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  checklistSubtitle: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  checklistPercent: {},
  checklistPercentValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  checklistProgressBar: {
    height: 8,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  checklistProgressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
});

export default TransitionTimeline;
