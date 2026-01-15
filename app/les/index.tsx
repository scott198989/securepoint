/**
 * LES History Screen
 * List of all LES entries with filtering and comparison
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks';
import { useLESStore, selectFilteredEntries, selectYears } from '../../store/lesStore';
import { Button, Card } from '../../components/common';
import { typography, borderRadius, spacing } from '../../constants/theme';
import { formatCurrency } from '../../utils/formatters';
import { LESEntry } from '../../types/les';

// ============================================================================
// CONSTANTS
// ============================================================================

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const SHORT_MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function LESHistoryScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  // Store
  const entries = useLESStore(selectFilteredEntries);
  const years = useLESStore(selectYears);
  const { setFilter, clearFilters, filterYear, filterMonth, compareEntries } = useLESStore();

  // Local state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // In real app, this might sync with an API
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Handle compare
  const handleCompare = () => {
    if (selectedForCompare.length === 2) {
      // Sort by date (older first)
      const sorted = [...selectedForCompare].sort((a, b) => {
        const entryA = entries.find((e) => e.id === a);
        const entryB = entries.find((e) => e.id === b);
        if (!entryA || !entryB) return 0;
        return new Date(entryA.payPeriod.payDate).getTime() -
          new Date(entryB.payPeriod.payDate).getTime();
      });

      compareEntries(sorted[0], sorted[1]);
      router.push('/les/compare');
      setCompareMode(false);
      setSelectedForCompare([]);
    }
  };

  // Toggle entry selection for compare
  const toggleCompareSelection = (id: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length < 2) {
        return [...prev, id];
      }
      // Replace oldest selection
      return [prev[1], id];
    });
  };

  // Group entries by month/year
  const groupedEntries = useMemo(() => {
    const groups: Record<string, LESEntry[]> = {};

    for (const entry of entries) {
      const key = `${entry.payPeriod.year}-${String(entry.payPeriod.month).padStart(2, '0')}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(entry);
    }

    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, items]) => ({
        key,
        year: parseInt(key.split('-')[0]),
        month: parseInt(key.split('-')[1]),
        items: items.sort((a, b) => {
          // End of month before mid month
          if (a.payPeriod.type === 'end_month' && b.payPeriod.type === 'mid_month') return -1;
          if (a.payPeriod.type === 'mid_month' && b.payPeriod.type === 'end_month') return 1;
          return 0;
        }),
      }));
  }, [entries]);

  // Empty state
  if (entries.length === 0 && !filterYear && !filterMonth) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.emptyIcon, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Ionicons name="document-text-outline" size={48} color={theme.colors.textSecondary} />
        </View>
        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
          No LES Entries Yet
        </Text>
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          Add your first Leave and Earnings Statement to track your pay over time.
        </Text>
        <Button
          title="Add LES Entry"
          onPress={() => router.push('/les/add')}
          style={styles.emptyButton}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Filter Bar */}
      <View style={[styles.filterBar, { backgroundColor: theme.colors.card }]}>
        {/* Year Filter */}
        <FlatList
          data={years}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.toString()}
          contentContainerStyle={styles.filterScroll}
          ListHeaderComponent={
            <TouchableOpacity
              style={[
                styles.filterChip,
                !filterYear ? { backgroundColor: theme.colors.primary } : undefined,
                filterYear ? { borderColor: theme.colors.border } : undefined,
              ]}
              onPress={() => clearFilters()}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: !filterYear ? '#fff' : theme.colors.text },
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                filterYear === item && { backgroundColor: theme.colors.primary },
                filterYear !== item && { borderColor: theme.colors.border },
              ]}
              onPress={() => setFilter(item, null)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: filterYear === item ? '#fff' : theme.colors.text },
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Compare Mode Banner */}
      {compareMode && (
        <View style={[styles.compareBanner, { backgroundColor: theme.colors.primary + '15' }]}>
          <View style={styles.compareBannerLeft}>
            <Ionicons name="git-compare-outline" size={20} color={theme.colors.primary} />
            <Text style={[styles.compareBannerText, { color: theme.colors.text }]}>
              Select 2 LES entries to compare
            </Text>
          </View>
          <Text style={[styles.compareCount, { color: theme.colors.primary }]}>
            {selectedForCompare.length}/2
          </Text>
        </View>
      )}

      {/* LES List */}
      <FlatList
        data={groupedEntries}
        keyExtractor={(item) => item.key}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        renderItem={({ item: group }) => (
          <View style={styles.monthGroup}>
            <Text style={[styles.monthHeader, { color: theme.colors.textSecondary }]}>
              {MONTH_NAMES[group.month - 1]} {group.year}
            </Text>
            {group.items.map((entry) => (
              <LESEntryCard
                key={entry.id}
                entry={entry}
                theme={theme}
                compareMode={compareMode}
                isSelected={selectedForCompare.includes(entry.id)}
                onPress={() => {
                  if (compareMode) {
                    toggleCompareSelection(entry.id);
                  } else {
                    router.push(`/les/${entry.id}` as any);
                  }
                }}
                onLongPress={() => {
                  if (!compareMode) {
                    setCompareMode(true);
                    setSelectedForCompare([entry.id]);
                  }
                }}
              />
            ))}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.noResults}>
            <Text style={[styles.noResultsText, { color: theme.colors.textSecondary }]}>
              No LES entries for this period
            </Text>
            <TouchableOpacity onPress={() => clearFilters()}>
              <Text style={[styles.clearFilterText, { color: theme.colors.primary }]}>
                Clear filters
              </Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Action Buttons */}
      <View
        style={[
          styles.actionBar,
          {
            backgroundColor: theme.colors.background,
            paddingBottom: insets.bottom + spacing.md,
          },
        ]}
      >
        {compareMode ? (
          <>
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => {
                setCompareMode(false);
                setSelectedForCompare([]);
              }}
              style={styles.actionButton}
            />
            <Button
              title="Compare"
              onPress={handleCompare}
              disabled={selectedForCompare.length !== 2}
              style={styles.actionButton}
            />
          </>
        ) : (
          <>
            <Button
              title="Compare"
              variant="outline"
              onPress={() => setCompareMode(true)}
              disabled={entries.length < 2}
              style={styles.actionButton}
            />
            <Button
              title="Add LES"
              onPress={() => router.push('/les/add')}
              style={styles.actionButton}
            />
          </>
        )}
      </View>
    </View>
  );
}

// ============================================================================
// ENTRY CARD COMPONENT
// ============================================================================

interface LESEntryCardProps {
  entry: LESEntry;
  theme: any;
  compareMode: boolean;
  isSelected: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

function LESEntryCard({
  entry,
  theme,
  compareMode,
  isSelected,
  onPress,
  onLongPress,
}: LESEntryCardProps) {
  const periodLabel = entry.payPeriod.type === 'mid_month' ? 'Mid-Month' : 'End of Month';
  const dateStr = new Date(entry.payPeriod.payDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <TouchableOpacity
      style={[
        styles.entryCard,
        { backgroundColor: theme.colors.card },
        isSelected && ({ borderColor: theme.colors.primary, borderWidth: 2 } as any),
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      {/* Selection indicator */}
      {compareMode && (
        <View
          style={[
            styles.selectionCircle,
            {
              backgroundColor: isSelected ? theme.colors.primary : 'transparent',
              borderColor: isSelected ? theme.colors.primary : theme.colors.border,
            },
          ]}
        >
          {isSelected && (
            <Ionicons name="checkmark" size={14} color="#fff" />
          )}
        </View>
      )}

      <View style={styles.entryMain}>
        {/* Period Info */}
        <View style={styles.entryHeader}>
          <View>
            <Text style={[styles.entryDate, { color: theme.colors.text }]}>
              {dateStr}
            </Text>
            <Text style={[styles.entryPeriod, { color: theme.colors.textSecondary }]}>
              {periodLabel}
            </Text>
          </View>
          <View
            style={[
              styles.entryBadge,
              { backgroundColor: entry.isVerified ? theme.colors.income + '20' : theme.colors.warning + '20' },
            ]}
          >
            <Ionicons
              name={entry.isVerified ? 'checkmark-circle' : 'alert-circle'}
              size={14}
              color={entry.isVerified ? theme.colors.income : theme.colors.warning}
            />
            <Text
              style={[
                styles.entryBadgeText,
                { color: entry.isVerified ? theme.colors.income : theme.colors.warning },
              ]}
            >
              {entry.isVerified ? 'Verified' : 'Unverified'}
            </Text>
          </View>
        </View>

        {/* Pay Summary */}
        <View style={styles.entrySummary}>
          <View style={styles.entryStat}>
            <Text style={[styles.entryStatLabel, { color: theme.colors.textSecondary }]}>
              Gross
            </Text>
            <Text style={[styles.entryStatValue, { color: theme.colors.income }]}>
              {formatCurrency(entry.totals.grossPay)}
            </Text>
          </View>
          <View style={styles.entryStatDivider} />
          <View style={styles.entryStat}>
            <Text style={[styles.entryStatLabel, { color: theme.colors.textSecondary }]}>
              Deductions
            </Text>
            <Text style={[styles.entryStatValue, { color: theme.colors.expense }]}>
              -{formatCurrency(entry.totals.totalDeductions)}
            </Text>
          </View>
          <View style={styles.entryStatDivider} />
          <View style={styles.entryStat}>
            <Text style={[styles.entryStatLabel, { color: theme.colors.textSecondary }]}>
              Net Pay
            </Text>
            <Text style={[styles.entryStatValue, { color: theme.colors.text }]}>
              {formatCurrency(entry.totals.netPay)}
            </Text>
          </View>
        </View>
      </View>

      {/* Arrow */}
      {!compareMode && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.colors.textSecondary}
        />
      )}
    </TouchableOpacity>
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

  // Filter Bar
  filterBar: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  filterScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  filterChipText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },

  // Compare Banner
  compareBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  compareBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  compareBannerText: {
    fontSize: typography.fontSize.md,
  },
  compareCount: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },

  // List
  listContent: {
    padding: spacing.md,
  },
  monthGroup: {
    marginBottom: spacing.lg,
  },
  monthHeader: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },

  // Entry Card
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  selectionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  entryMain: {
    flex: 1,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  entryDate: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  entryPeriod: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  entryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  entryBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  entrySummary: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryStat: {
    flex: 1,
  },
  entryStatLabel: {
    fontSize: typography.fontSize.xs,
    marginBottom: 2,
  },
  entryStatValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  entryStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: spacing.sm,
  },

  // No Results
  noResults: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  noResultsText: {
    fontSize: typography.fontSize.md,
    marginBottom: spacing.sm,
  },
  clearFilterText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },

  // Action Bar
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  actionButton: {
    flex: 1,
  },
});
