/**
 * LES Detail View Screen
 * Single LES view with explainers for each line item
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks';
import { useLESStore } from '../../store/lesStore';
import { LESLineItem } from '../../components/military/LESLineItem';
import { Button, Card } from '../../components/common';
import { typography, borderRadius, spacing } from '../../constants/theme';
import { formatCurrency } from '../../utils/formatters';

// ============================================================================
// CONSTANTS
// ============================================================================

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function LESDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { getEntry, getPreviousEntry, updateEntry, deleteEntry, compareEntries } = useLESStore();

  const entry = getEntry(id || '');
  const previousEntry = getPreviousEntry(id || '');

  // Calculate changes from previous
  const changes = useMemo(() => {
    if (!entry || !previousEntry) return null;

    const entitlementChanges = new Map<string, number>();
    const deductionChanges = new Map<string, number>();

    // Calculate entitlement changes
    for (const curr of entry.entitlements) {
      const prev = previousEntry.entitlements.find((e) => e.type === curr.type);
      if (prev) {
        entitlementChanges.set(curr.id, curr.amount - prev.amount);
      }
    }

    // Calculate deduction changes
    for (const curr of entry.deductions) {
      const prev = previousEntry.deductions.find((d) => d.type === curr.type);
      if (prev) {
        deductionChanges.set(curr.id, curr.amount - prev.amount);
      }
    }

    return { entitlementChanges, deductionChanges };
  }, [entry, previousEntry]);

  // Handle not found
  if (!entry) {
    return (
      <View style={[styles.notFound, { backgroundColor: theme.colors.background }]}>
        <Ionicons name="document-text-outline" size={48} color={theme.colors.textSecondary} />
        <Text style={[styles.notFoundText, { color: theme.colors.text }]}>
          LES entry not found
        </Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  const periodLabel = entry.payPeriod.type === 'mid_month' ? 'Mid-Month' : 'End of Month';
  const monthName = MONTH_NAMES[entry.payPeriod.month - 1];

  const handleVerify = () => {
    updateEntry(id!, { isVerified: true });
  };

  const handleDelete = () => {
    deleteEntry(id!);
    router.back();
  };

  const handleCompare = () => {
    if (previousEntry) {
      compareEntries(previousEntry.id, entry.id);
      router.push('/les/compare');
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 24 },
      ]}
    >
      {/* Header Card */}
      <Card style={[styles.headerCard, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerPeriod}>
              {monthName} {entry.payPeriod.year}
            </Text>
            <Text style={styles.headerType}>{periodLabel}</Text>
          </View>
          <View
            style={[
              styles.verifiedBadge,
              {
                backgroundColor: entry.isVerified
                  ? 'rgba(255,255,255,0.2)'
                  : 'rgba(255,200,0,0.3)',
              },
            ]}
          >
            <Ionicons
              name={entry.isVerified ? 'checkmark-circle' : 'alert-circle'}
              size={16}
              color="#fff"
            />
            <Text style={styles.verifiedText}>
              {entry.isVerified ? 'Verified' : 'Unverified'}
            </Text>
          </View>
        </View>
        <Text style={styles.headerNetPay}>
          {formatCurrency(entry.totals.netPay)}
        </Text>
        <Text style={styles.headerSubtext}>Net Pay</Text>
      </Card>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Gross
          </Text>
          <Text style={[styles.statValue, { color: theme.colors.income }]}>
            {formatCurrency(entry.totals.grossPay)}
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Deductions
          </Text>
          <Text style={[styles.statValue, { color: theme.colors.expense }]}>
            -{formatCurrency(entry.totals.totalDeductions)}
          </Text>
        </View>
        {entry.totals.totalAllotments > 0 && (
          <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Allotments
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.warning }]}>
              -{formatCurrency(entry.totals.totalAllotments)}
            </Text>
          </View>
        )}
      </View>

      {/* Compare with Previous */}
      {previousEntry && (
        <TouchableOpacity
          style={[styles.compareCard, { backgroundColor: theme.colors.primary + '10' }]}
          onPress={handleCompare}
        >
          <View style={styles.compareLeft}>
            <Ionicons name="git-compare-outline" size={24} color={theme.colors.primary} />
            <View>
              <Text style={[styles.compareTitle, { color: theme.colors.text }]}>
                Compare with Previous
              </Text>
              <Text style={[styles.compareSubtitle, { color: theme.colors.textSecondary }]}>
                {MONTH_NAMES[previousEntry.payPeriod.month - 1]}{' '}
                {previousEntry.payPeriod.type === 'mid_month' ? 'Mid' : 'EOM'}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      )}

      {/* Entitlements Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Entitlements
        </Text>
        <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
          Tap the ? icon for explanations
        </Text>
        {entry.entitlements.map((entitlement) => (
          <LESLineItem
            key={entitlement.id}
            item={entitlement}
            category="entitlement"
            showYTD={!!entitlement.ytdAmount}
            changeAmount={changes?.entitlementChanges.get(entitlement.id)}
          />
        ))}
      </View>

      {/* Deductions Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Deductions
        </Text>
        {entry.deductions.map((deduction) => (
          <LESLineItem
            key={deduction.id}
            item={deduction}
            category="deduction"
            showYTD={!!deduction.ytdAmount}
            changeAmount={changes?.deductionChanges.get(deduction.id)}
          />
        ))}
      </View>

      {/* Allotments Section */}
      {entry.allotments.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Allotments
          </Text>
          {entry.allotments.map((allotment) => (
            <LESLineItem
              key={allotment.id}
              item={allotment}
              category="allotment"
            />
          ))}
        </View>
      )}

      {/* Leave Section */}
      {entry.leave.length > 0 && (
        <Card style={styles.leaveCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Leave Balance
          </Text>
          {entry.leave.map((leave, index) => (
            <View
              key={index}
              style={[styles.leaveRow, { borderBottomColor: theme.colors.border }]}
            >
              <Text style={[styles.leaveType, { color: theme.colors.text }]}>
                {leave.type.charAt(0).toUpperCase() + leave.type.slice(1)}
              </Text>
              <View style={styles.leaveStats}>
                <View style={styles.leaveStat}>
                  <Text style={[styles.leaveStatValue, { color: theme.colors.text }]}>
                    {leave.balance}
                  </Text>
                  <Text style={[styles.leaveStatLabel, { color: theme.colors.textSecondary }]}>
                    Balance
                  </Text>
                </View>
                <View style={styles.leaveStat}>
                  <Text style={[styles.leaveStatValue, { color: theme.colors.income }]}>
                    +{leave.earned}
                  </Text>
                  <Text style={[styles.leaveStatLabel, { color: theme.colors.textSecondary }]}>
                    Earned
                  </Text>
                </View>
                <View style={styles.leaveStat}>
                  <Text style={[styles.leaveStatValue, { color: theme.colors.expense }]}>
                    -{leave.used}
                  </Text>
                  <Text style={[styles.leaveStatLabel, { color: theme.colors.textSecondary }]}>
                    Used
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </Card>
      )}

      {/* Notes */}
      {entry.notes && (
        <Card style={styles.notesCard}>
          <View style={styles.notesHeader}>
            <Ionicons name="document-text-outline" size={20} color={theme.colors.textSecondary} />
            <Text style={[styles.notesTitle, { color: theme.colors.textSecondary }]}>
              Notes
            </Text>
          </View>
          <Text style={[styles.notesText, { color: theme.colors.text }]}>
            {entry.notes}
          </Text>
        </Card>
      )}

      {/* Metadata */}
      <View style={styles.metadata}>
        <Text style={[styles.metadataText, { color: theme.colors.textSecondary }]}>
          Added {new Date(entry.createdAt).toLocaleDateString()} via{' '}
          {entry.entryMethod === 'manual' ? 'manual entry' : entry.entryMethod}
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {!entry.isVerified && (
          <Button
            title="Mark as Verified"
            onPress={handleVerify}
            style={styles.actionButton}
          />
        )}
        <Button
          title="Delete Entry"
          variant="outline"
          onPress={handleDelete}
          style={styles.actionButton}
        />
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

  // Not Found
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  notFoundText: {
    fontSize: typography.fontSize.lg,
    marginBottom: spacing.md,
  },

  // Header Card
  headerCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerPeriod: {
    color: '#fff',
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  headerType: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  verifiedText: {
    color: '#fff',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  headerNetPay: {
    color: '#fff',
    fontSize: typography.fontSize.display,
    fontWeight: typography.fontWeight.bold,
  },
  headerSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.fontSize.sm,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    marginBottom: 4,
  },
  statValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },

  // Compare Card
  compareCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  compareLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  compareTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  compareSubtitle: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },

  // Sections
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.md,
  },

  // Leave Card
  leaveCard: {
    marginBottom: spacing.lg,
  },
  leaveRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  leaveType: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  leaveStats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  leaveStat: {
    alignItems: 'center',
  },
  leaveStatValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  leaveStatLabel: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },

  // Notes
  notesCard: {
    marginBottom: spacing.md,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  notesTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  notesText: {
    fontSize: typography.fontSize.md,
    lineHeight: 22,
  },

  // Metadata
  metadata: {
    marginBottom: spacing.md,
  },
  metadataText: {
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },

  // Actions
  actions: {
    gap: spacing.sm,
  },
  actionButton: {
    marginBottom: spacing.xs,
  },
});
