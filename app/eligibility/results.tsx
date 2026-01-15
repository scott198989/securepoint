/**
 * Eligibility Results Screen
 * Display saved eligibility assessment results
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks';
import { Card, Button } from '../../components/common';
import {
  formatEligibilityStatus,
  getStatusColor,
  getStatusIcon,
} from '../../utils/eligibility/engine';
import { typography, borderRadius, spacing } from '../../constants/theme';

// ============================================================================
// COMPONENT
// ============================================================================

export default function EligibilityResultsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { resultId } = useLocalSearchParams<{ resultId?: string }>();

  // For now, show a placeholder since we don't have a persistent result store yet
  // In a full implementation, we would fetch the result from a store

  const handleNewAssessment = () => {
    router.push('/eligibility/wizard' as any);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      {/* Empty State */}
      <View style={styles.emptyContainer}>
        <View style={[styles.emptyIcon, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Ionicons
            name="document-text-outline"
            size={48}
            color={theme.colors.textSecondary}
          />
        </View>
        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
          No Saved Results
        </Text>
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          Complete an eligibility assessment to see your results here.
        </Text>
        <Button
          title="Start Assessment"
          onPress={handleNewAssessment}
          style={styles.emptyButton}
        />
      </View>

      {/* Info Card */}
      <Card style={[styles.infoCard, { backgroundColor: theme.colors.info + '15' }]}>
        <Ionicons name="information-circle" size={24} color={theme.colors.info} />
        <View style={styles.infoContent}>
          <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
            About Your Results
          </Text>
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            Results are based on your answers at the time of assessment. Eligibility may change based on new qualifications, assignments, or policy updates. Re-run the assessment periodically.
          </Text>
        </View>
      </Card>

      {/* Status Legend */}
      <Card style={styles.legendCard}>
        <Text style={[styles.legendTitle, { color: theme.colors.text }]}>
          Status Legend
        </Text>
        <View style={styles.legendList}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: getStatusColor('eligible') }]} />
            <View style={styles.legendContent}>
              <Text style={[styles.legendLabel, { color: theme.colors.text }]}>
                Eligible
              </Text>
              <Text style={[styles.legendDesc, { color: theme.colors.textSecondary }]}>
                You meet all requirements for this pay
              </Text>
            </View>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: getStatusColor('potentially_eligible') }]} />
            <View style={styles.legendContent}>
              <Text style={[styles.legendLabel, { color: theme.colors.text }]}>
                Potentially Eligible
              </Text>
              <Text style={[styles.legendDesc, { color: theme.colors.textSecondary }]}>
                You may qualify pending verification
              </Text>
            </View>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: getStatusColor('not_eligible') }]} />
            <View style={styles.legendContent}>
              <Text style={[styles.legendLabel, { color: theme.colors.text }]}>
                Not Eligible
              </Text>
              <Text style={[styles.legendDesc, { color: theme.colors.textSecondary }]}>
                Current requirements not met
              </Text>
            </View>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: getStatusColor('incomplete') }]} />
            <View style={styles.legendContent}>
              <Text style={[styles.legendLabel, { color: theme.colors.text }]}>
                Incomplete
              </Text>
              <Text style={[styles.legendDesc, { color: theme.colors.textSecondary }]}>
                More information needed
              </Text>
            </View>
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

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  emptyButton: {
    minWidth: 200,
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },

  // Legend Card
  legendCard: {
    marginBottom: spacing.md,
  },
  legendTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },
  legendList: {
    gap: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginTop: 2,
  },
  legendContent: {
    flex: 1,
  },
  legendLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  legendDesc: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
});
