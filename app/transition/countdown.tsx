/**
 * Transition Countdown Screen
 * Detailed countdown to ETS with milestones
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks';
import { useTransitionStore } from '../../store/transitionStore';
import { Card } from '../../components/common';
import { TransitionTimeline } from '../../components/transition';
import { typography, borderRadius, spacing } from '../../constants/theme';

export default function TransitionCountdownScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { transitionInfo, getDaysUntilETS, getUpcomingMilestones } = useTransitionStore();

  const daysUntilETS = getDaysUntilETS();
  const milestones = getUpcomingMilestones();

  if (!transitionInfo) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.noData, { color: theme.colors.textSecondary }]}>
          No transition info set up
        </Text>
      </View>
    );
  }

  // Calculate additional stats
  const weeksUntil = Math.floor(daysUntilETS / 7);
  const monthsUntil = Math.floor(daysUntilETS / 30);
  const weekendsUntil = Math.floor(daysUntilETS / 7);
  const paydaysUntil = Math.floor(daysUntilETS / 15);

  // Get separation type label
  const getSeparationLabel = () => {
    switch (transitionInfo.separationType) {
      case 'retirement':
      case 'medical_retirement':
      case 'disability_retirement':
        return 'Retirement';
      default:
        return 'Separation';
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      {/* Main timeline */}
      <TransitionTimeline />

      {/* Additional stats */}
      <Card style={styles.statsCard}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Time Breakdown
        </Text>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Ionicons name="calendar" size={24} color={theme.colors.primary} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {monthsUntil}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Months
            </Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="today" size={24} color={theme.colors.primary} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {weeksUntil}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Weeks
            </Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="sunny" size={24} color={theme.colors.warning} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {weekendsUntil}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Weekends
            </Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="cash" size={24} color={theme.colors.income} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {paydaysUntil}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Paydays
            </Text>
          </View>
        </View>
      </Card>

      {/* Key dates detail */}
      <Card style={styles.datesCard}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Key Dates
        </Text>

        <View style={styles.dateRow}>
          <View style={[styles.dateIcon, { backgroundColor: theme.colors.expense + '20' }]}>
            <Ionicons name="flag" size={20} color={theme.colors.expense} />
          </View>
          <View style={styles.dateInfo}>
            <Text style={[styles.dateLabel, { color: theme.colors.text }]}>
              {getSeparationLabel()} Date
            </Text>
            <Text style={[styles.dateValue, { color: theme.colors.textSecondary }]}>
              {new Date(transitionInfo.etsDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <View style={styles.dateDays}>
            <Text style={[styles.dateDaysValue, { color: theme.colors.expense }]}>
              {daysUntilETS}
            </Text>
            <Text style={[styles.dateDaysLabel, { color: theme.colors.textSecondary }]}>
              days
            </Text>
          </View>
        </View>

        {transitionInfo.terminalLeaveStartDate && (
          <View style={styles.dateRow}>
            <View style={[styles.dateIcon, { backgroundColor: theme.colors.income + '20' }]}>
              <Ionicons name="airplane" size={20} color={theme.colors.income} />
            </View>
            <View style={styles.dateInfo}>
              <Text style={[styles.dateLabel, { color: theme.colors.text }]}>
                Terminal Leave Starts
              </Text>
              <Text style={[styles.dateValue, { color: theme.colors.textSecondary }]}>
                {new Date(transitionInfo.terminalLeaveStartDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </View>
        )}

        {transitionInfo.lastDayOfWork && (
          <View style={styles.dateRow}>
            <View style={[styles.dateIcon, { backgroundColor: theme.colors.warning + '20' }]}>
              <Ionicons name="briefcase" size={20} color={theme.colors.warning} />
            </View>
            <View style={styles.dateInfo}>
              <Text style={[styles.dateLabel, { color: theme.colors.text }]}>
                Last Day of Work
              </Text>
              <Text style={[styles.dateValue, { color: theme.colors.textSecondary }]}>
                {new Date(transitionInfo.lastDayOfWork).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </View>
        )}
      </Card>

      {/* Leave info */}
      {transitionInfo.leaveBalance > 0 && (
        <Card style={styles.leaveCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Leave Balance
          </Text>

          <View style={styles.leaveStats}>
            <View style={styles.leaveStat}>
              <Text style={[styles.leaveValue, { color: theme.colors.primary }]}>
                {transitionInfo.leaveBalance}
              </Text>
              <Text style={[styles.leaveLabel, { color: theme.colors.textSecondary }]}>
                Days Accrued
              </Text>
            </View>

            {transitionInfo.sellLeaveOption === 'sell' && (
              <View style={styles.leaveStat}>
                <Text style={[styles.leaveValue, { color: theme.colors.income }]}>
                  {transitionInfo.leaveBalance}
                </Text>
                <Text style={[styles.leaveLabel, { color: theme.colors.textSecondary }]}>
                  Days to Sell
                </Text>
              </View>
            )}

            {transitionInfo.sellLeaveOption === 'take' && (
              <View style={styles.leaveStat}>
                <Text style={[styles.leaveValue, { color: theme.colors.income }]}>
                  {transitionInfo.leaveBalance}
                </Text>
                <Text style={[styles.leaveLabel, { color: theme.colors.textSecondary }]}>
                  Terminal Days
                </Text>
              </View>
            )}
          </View>
        </Card>
      )}

      {/* Motivation */}
      <Card style={[styles.motivationCard, { backgroundColor: theme.colors.primary + '10' }]}>
        <Ionicons name="ribbon" size={32} color={theme.colors.primary} />
        <Text style={[styles.motivationText, { color: theme.colors.text }]}>
          {daysUntilETS > 365
            ? "You have time to prepare. Start your transition checklist early!"
            : daysUntilETS > 180
            ? "6 months is a good timeline. Focus on your VA claims and resume."
            : daysUntilETS > 90
            ? "Time to finalize your plans. Have you scheduled your final out?"
            : daysUntilETS > 30
            ? "The finish line is in sight. Make sure all paperwork is complete."
            : "Almost there! You've got this. Thank you for your service."}
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
  noData: {
    textAlign: 'center',
    marginTop: spacing.xl,
    fontSize: typography.fontSize.md,
  },

  // Section
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },

  // Stats card
  statsCard: {
    marginTop: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },

  // Dates card
  datesCard: {
    marginTop: spacing.md,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  dateIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  dateInfo: {
    flex: 1,
  },
  dateLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  dateValue: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  dateDays: {
    alignItems: 'center',
  },
  dateDaysValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  dateDaysLabel: {
    fontSize: typography.fontSize.xs,
  },

  // Leave card
  leaveCard: {
    marginTop: spacing.md,
  },
  leaveStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  leaveStat: {
    alignItems: 'center',
  },
  leaveValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
  },
  leaveLabel: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },

  // Motivation card
  motivationCard: {
    marginTop: spacing.md,
    alignItems: 'center',
    padding: spacing.lg,
  },
  motivationText: {
    fontSize: typography.fontSize.md,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: spacing.md,
  },
});
