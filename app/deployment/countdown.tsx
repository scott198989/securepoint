/**
 * Deployment Countdown Screen
 * Visual countdown to return date
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
import { useDeploymentStore } from '../../store/deploymentStore';
import { Card } from '../../components/common';
import { typography, borderRadius, spacing } from '../../constants/theme';

export default function DeploymentCountdownScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { getCountdown, activeDeployment } = useDeploymentStore();

  const countdown = getCountdown();

  if (!countdown || !activeDeployment) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.noData, { color: theme.colors.textSecondary }]}>
          No active deployment
        </Text>
      </View>
    );
  }

  // Calculate weeks and months
  const weeksRemaining = Math.floor(countdown.daysRemaining / 7);
  const monthsRemaining = Math.floor(countdown.daysRemaining / 30);

  // Format dates
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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
      {/* Main countdown ring */}
      <Card style={[styles.countdownCard, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.ringContainer}>
          <View style={styles.ringOuter}>
            <View style={styles.ringInner}>
              <Text style={styles.daysNumber}>{countdown.daysRemaining}</Text>
              <Text style={styles.daysLabel}>days left</Text>
            </View>
          </View>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${countdown.percentComplete}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {Math.round(countdown.percentComplete)}% complete
        </Text>
      </Card>

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Ionicons name="calendar" size={24} color={theme.colors.primary} />
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {weeksRemaining}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Weeks Left
          </Text>
        </Card>

        <Card style={styles.statCard}>
          <Ionicons name="time" size={24} color={theme.colors.primary} />
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {monthsRemaining}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Months Left
          </Text>
        </Card>

        <Card style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={24} color={theme.colors.income} />
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {countdown.daysComplete}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Days Done
          </Text>
        </Card>

        <Card style={styles.statCard}>
          <Ionicons name="sunny" size={24} color={theme.colors.warning} />
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {countdown.weekendsRemaining}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Weekends Left
          </Text>
        </Card>
      </View>

      {/* Key dates */}
      <Card style={styles.datesCard}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Key Dates
        </Text>

        <View style={styles.dateRow}>
          <View style={[styles.dateIcon, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Ionicons name="airplane-outline" size={20} color={theme.colors.primary} />
          </View>
          <View style={styles.dateContent}>
            <Text style={[styles.dateLabel, { color: theme.colors.textSecondary }]}>
              Departure
            </Text>
            <Text style={[styles.dateValue, { color: theme.colors.text }]}>
              {formatDate(countdown.departureDate)}
            </Text>
          </View>
        </View>

        {countdown.midtourDate && (
          <View style={styles.dateRow}>
            <View style={[styles.dateIcon, { backgroundColor: theme.colors.warning + '20' }]}>
              <Ionicons name="flag-outline" size={20} color={theme.colors.warning} />
            </View>
            <View style={styles.dateContent}>
              <Text style={[styles.dateLabel, { color: theme.colors.textSecondary }]}>
                Midtour
              </Text>
              <Text style={[styles.dateValue, { color: theme.colors.text }]}>
                {formatDate(countdown.midtourDate)}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.dateRow}>
          <View style={[styles.dateIcon, { backgroundColor: theme.colors.income + '20' }]}>
            <Ionicons name="home-outline" size={20} color={theme.colors.income} />
          </View>
          <View style={styles.dateContent}>
            <Text style={[styles.dateLabel, { color: theme.colors.textSecondary }]}>
              Expected Return
            </Text>
            <Text style={[styles.dateValue, { color: theme.colors.text }]}>
              {formatDate(countdown.expectedReturnDate)}
            </Text>
          </View>
        </View>
      </Card>

      {/* Motivation */}
      <Card style={[styles.motivationCard, { backgroundColor: theme.colors.income + '10' }]}>
        <Ionicons name="heart" size={32} color={theme.colors.income} />
        <Text style={[styles.motivationText, { color: theme.colors.text }]}>
          You&apos;re doing great! {countdown.daysComplete} days down, {countdown.daysRemaining} to go.
          Your family is proud of you!
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

  // Countdown card
  countdownCard: {
    alignItems: 'center',
    padding: spacing.xl,
    marginBottom: spacing.md,
  },
  ringContainer: {
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
  ringInner: {
    alignItems: 'center',
  },
  daysNumber: {
    color: '#fff',
    fontSize: 56,
    fontWeight: typography.fontWeight.bold,
  },
  daysLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: typography.fontSize.lg,
    marginTop: spacing.xs,
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
  },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: spacing.md,
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
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
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
  dateContent: {
    flex: 1,
  },
  dateLabel: {
    fontSize: typography.fontSize.sm,
  },
  dateValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    marginTop: 2,
  },

  // Motivation
  motivationCard: {
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
