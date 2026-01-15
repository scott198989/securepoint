/**
 * LES Compare Screen
 * Month-to-month comparison view
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks';
import { useLESStore, selectComparisons } from '../../store/lesStore';
import { LESCompare } from '../../components/military/LESCompare';
import { Button } from '../../components/common';
import { typography, spacing } from '../../constants/theme';

// ============================================================================
// COMPONENT
// ============================================================================

export default function LESCompareScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const comparisons = useLESStore(selectComparisons);
  const { getLatestComparison } = useLESStore();

  const latestComparison = getLatestComparison();

  // Empty state
  if (!latestComparison) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.emptyIcon, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Ionicons
            name="git-compare-outline"
            size={48}
            color={theme.colors.textSecondary}
          />
        </View>
        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
          No Comparison Available
        </Text>
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          Select two LES entries from your history to compare them.
        </Text>
        <Button
          title="Go to LES History"
          onPress={() => router.push('/les' as any)}
          style={styles.emptyButton}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LESCompare comparison={latestComparison} showAllChanges />

      {/* Bottom padding for safe area */}
      <View style={{ height: insets.bottom + spacing.md }} />
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

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
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
});
