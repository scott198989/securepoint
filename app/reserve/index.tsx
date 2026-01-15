/**
 * Reserve Hub Screen
 * Main dashboard for Guard/Reserve members
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks';
import { useReserveStore } from '../../store/reserveStore';
import { Card, StatCard } from '../../components/common';
import { DrillList } from '../../components/military/DrillCalendar';
import { typography, borderRadius, spacing } from '../../constants/theme';
import { formatCurrency } from '../../utils/formatters';

// ============================================================================
// COMPONENT
// ============================================================================

export default function ReserveHubScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const {
    currentSchedule,
    getUpcomingDrills,
    calculateYearSummary,
    getUnpaidDrills,
  } = useReserveStore();

  const upcomingDrills = getUpcomingDrills(3);
  const summary = calculateYearSummary();
  const unpaidDrills = getUnpaidDrills();

  const handleDrillPress = (drill: any) => {
    // Navigate to drill detail or edit
    router.push(`/reserve/drill-calendar` as any);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      {/* Year Summary Card */}
      <Card style={[styles.summaryCard, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.summaryTitle}>
          FY{currentSchedule?.fiscalYear || new Date().getFullYear()} Summary
        </Text>
        <View style={styles.summaryStats}>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryStatValue}>{summary.completedMUTAs}</Text>
            <Text style={styles.summaryStatLabel}>MUTAs Complete</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
          <View style={styles.summaryStat}>
            <Text style={styles.summaryStatValue}>{summary.remainingMUTAs}</Text>
            <Text style={styles.summaryStatLabel}>Remaining</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
          <View style={styles.summaryStat}>
            <Text style={styles.summaryStatValue}>
              {summary.atDaysCompleted}/{15}
            </Text>
            <Text style={styles.summaryStatLabel}>AT Days</Text>
          </View>
        </View>
        {summary.missedMUTAs > 0 && (
          <View style={styles.warningBanner}>
            <Ionicons name="warning" size={16} color="#fff" />
            <Text style={styles.warningText}>
              {summary.missedMUTAs} unexcused absence{summary.missedMUTAs > 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </Card>

      {/* Quick Actions Grid */}
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: theme.colors.card }]}
          onPress={() => router.push('/reserve/drill-calendar' as any)}
        >
          <View style={[styles.actionIcon, { backgroundColor: theme.colors.primary + '20' }]}>
            <Ionicons name="calendar" size={24} color={theme.colors.primary} />
          </View>
          <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
            Drill Calendar
          </Text>
          <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>
            View & manage drills
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: theme.colors.card }]}
          onPress={() => router.push('/reserve/drill-pay' as any)}
        >
          <View style={[styles.actionIcon, { backgroundColor: theme.colors.income + '20' }]}>
            <Ionicons name="calculator" size={24} color={theme.colors.income} />
          </View>
          <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
            Drill Pay
          </Text>
          <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>
            Calculate pay
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: theme.colors.card }]}
          onPress={() => router.push('/reserve/at-calculator' as any)}
        >
          <View style={[styles.actionIcon, { backgroundColor: theme.colors.warning + '20' }]}>
            <Ionicons name="fitness" size={24} color={theme.colors.warning} />
          </View>
          <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
            AT Calculator
          </Text>
          <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>
            Annual Training
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: theme.colors.card }]}
          onPress={() => router.push('/reserve/orders-compare' as any)}
        >
          <View style={[styles.actionIcon, { backgroundColor: theme.colors.info + '20' }]}>
            <Ionicons name="git-compare" size={24} color={theme.colors.info} />
          </View>
          <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
            Orders Compare
          </Text>
          <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>
            vs. Civilian pay
          </Text>
        </TouchableOpacity>
      </View>

      {/* Unpaid Drills Alert */}
      {unpaidDrills.length > 0 && (
        <Card style={styles.alertCard}>
          <View style={styles.alertHeader}>
            <View style={[styles.alertIcon, { backgroundColor: theme.colors.warning + '20' }]}>
              <Ionicons name="time" size={20} color={theme.colors.warning} />
            </View>
            <View style={styles.alertContent}>
              <Text style={[styles.alertTitle, { color: theme.colors.text }]}>
                Awaiting Payment
              </Text>
              <Text style={[styles.alertSubtitle, { color: theme.colors.textSecondary }]}>
                {unpaidDrills.length} completed drill{unpaidDrills.length > 1 ? 's' : ''} not yet paid
              </Text>
            </View>
          </View>
        </Card>
      )}

      {/* Upcoming Drills Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Upcoming Drills
          </Text>
          <TouchableOpacity onPress={() => router.push('/reserve/drill-calendar' as any)}>
            <Text style={[styles.sectionLink, { color: theme.colors.primary }]}>
              See All
            </Text>
          </TouchableOpacity>
        </View>

        {upcomingDrills.length > 0 ? (
          <DrillList
            drillWeekends={upcomingDrills}
            onDrillPress={handleDrillPress}
          />
        ) : (
          <Card style={styles.emptyCard}>
            <Ionicons
              name="calendar-outline"
              size={40}
              color={theme.colors.textTertiary}
            />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No upcoming drills scheduled
            </Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => router.push('/reserve/add-drill' as any)}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Add Drill</Text>
            </TouchableOpacity>
          </Card>
        )}
      </View>

      {/* Quick Stats */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Pay Stats
        </Text>
        <View style={styles.statsRow}>
          <StatCard
            label="Drill Pay YTD"
            value={formatCurrency(summary.completedMUTAs * 200)} // Placeholder calculation
            icon={<Ionicons name="cash" size={20} color={theme.colors.income} />}
            color={theme.colors.income}
          />
          <StatCard
            label="AT Pay Est."
            value={formatCurrency(summary.atDaysRemaining * 250)} // Placeholder calculation
            icon={<Ionicons name="trending-up" size={20} color={theme.colors.primary} />}
            color={theme.colors.primary}
          />
        </View>
      </View>
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

  // Summary Card
  summaryCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  summaryTitle: {
    color: '#fff',
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryStat: {
    alignItems: 'center',
  },
  summaryStatValue: {
    color: '#fff',
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
  },
  summaryStatLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 40,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginTop: spacing.md,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  warningText: {
    color: '#fff',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },

  // Actions Grid
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  actionCard: {
    width: '48%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  actionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  actionSubtitle: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },

  // Alert Card
  alertCard: {
    marginBottom: spacing.md,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  alertSubtitle: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },

  // Section
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  sectionLink: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },

  // Empty State
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  addButtonText: {
    color: '#fff',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
