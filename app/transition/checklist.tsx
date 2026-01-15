/**
 * Transition Checklist Screen
 * Track transition tasks and milestones
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks';
import { useTransitionStore } from '../../store/transitionStore';
import { Card } from '../../components/common';
import { typography, borderRadius, spacing } from '../../constants/theme';
import { TRANSITION_CHECKLIST } from '../../constants/transitionData';

type FilterType = 'all' | 'pending' | 'completed' | 'critical';

export default function TransitionChecklistScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const {
    checklistItems,
    toggleChecklistItem,
    getChecklistProgress,
    loadDefaultChecklist,
    transitionInfo,
  } = useTransitionStore();

  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const progress = getChecklistProgress();

  // Load checklist if empty
  React.useEffect(() => {
    if (checklistItems.length === 0 && transitionInfo?.etsDate) {
      loadDefaultChecklist(transitionInfo.etsDate);
    }
  }, [transitionInfo?.etsDate]);

  // Group items by category
  const groupedItems = checklistItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof checklistItems>);

  // Get category metadata
  const getCategoryInfo = (categoryId: string) => {
    return TRANSITION_CHECKLIST.find((c) => c.id === categoryId);
  };

  // Filter items
  const filterItems = (items: typeof checklistItems) => {
    switch (filter) {
      case 'pending':
        return items.filter((i) => !i.completed);
      case 'completed':
        return items.filter((i) => i.completed);
      case 'critical':
        return items.filter((i) => i.priority === 'critical' && !i.completed);
      default:
        return items;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return theme.colors.expense;
      case 'high':
        return theme.colors.warning;
      case 'medium':
        return theme.colors.primary;
      default:
        return theme.colors.textSecondary;
    }
  };

  // Count by priority
  const criticalRemaining = checklistItems.filter(
    (i) => i.priority === 'critical' && !i.completed
  ).length;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      {/* Progress card */}
      <Card style={[styles.progressCard, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.progressHeader}>
          <Ionicons name="checkbox" size={32} color="#fff" />
          <View style={styles.progressInfo}>
            <Text style={styles.progressTitle}>Transition Checklist</Text>
            <Text style={styles.progressSubtitle}>
              {progress.completed} of {progress.total} tasks complete
            </Text>
          </View>
          <Text style={styles.progressPercent}>{progress.percent}%</Text>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${progress.percent}%` }]}
          />
        </View>

        {criticalRemaining > 0 && (
          <View style={styles.criticalBadge}>
            <Ionicons name="warning" size={16} color={theme.colors.expense} />
            <Text style={[styles.criticalText, { color: theme.colors.expense }]}>
              {criticalRemaining} critical items remaining
            </Text>
          </View>
        )}
      </Card>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {[
          { key: 'all', label: 'All', icon: 'list' },
          { key: 'pending', label: 'Pending', icon: 'time-outline' },
          { key: 'completed', label: 'Done', icon: 'checkmark-circle' },
          { key: 'critical', label: 'Critical', icon: 'warning' },
        ].map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterButton,
              {
                backgroundColor:
                  filter === f.key ? theme.colors.primary : theme.colors.surface,
                borderColor:
                  filter === f.key ? theme.colors.primary : theme.colors.border,
              },
            ]}
            onPress={() => setFilter(f.key as FilterType)}
          >
            <Ionicons
              name={f.icon as keyof typeof Ionicons.glyphMap}
              size={16}
              color={filter === f.key ? '#fff' : theme.colors.text}
            />
            <Text
              style={[
                styles.filterText,
                { color: filter === f.key ? '#fff' : theme.colors.text },
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Categories */}
      {Object.entries(groupedItems).map(([categoryId, items]) => {
        const categoryInfo = getCategoryInfo(categoryId);
        const filteredItems = filterItems(items);
        const categoryCompleted = items.filter((i) => i.completed).length;
        const isExpanded = expandedCategory === categoryId;

        if (filteredItems.length === 0) return null;

        return (
          <Card key={categoryId} style={styles.categoryCard}>
            <TouchableOpacity
              style={styles.categoryHeader}
              onPress={() =>
                setExpandedCategory(isExpanded ? null : categoryId)
              }
            >
              <View style={styles.categoryInfo}>
                <Text style={[styles.categoryTitle, { color: theme.colors.text }]}>
                  {categoryInfo?.name || categoryId}
                </Text>
                <Text style={[styles.categoryTimeline, { color: theme.colors.textSecondary }]}>
                  {categoryInfo?.timeline}
                </Text>
              </View>
              <View style={styles.categoryRight}>
                <Text style={[styles.categoryProgress, { color: theme.colors.primary }]}>
                  {categoryCompleted}/{items.length}
                </Text>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </View>
            </TouchableOpacity>

            {isExpanded && (
              <View style={styles.itemsList}>
                {filteredItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.checklistItem}
                    onPress={() => toggleChecklistItem(item.id)}
                  >
                    <Ionicons
                      name={item.completed ? 'checkbox' : 'square-outline'}
                      size={24}
                      color={
                        item.completed
                          ? theme.colors.income
                          : getPriorityColor(item.priority)
                      }
                    />
                    <View style={styles.itemContent}>
                      <Text
                        style={[
                          styles.itemTitle,
                          {
                            color: theme.colors.text,
                            textDecorationLine: item.completed
                              ? 'line-through'
                              : 'none',
                            opacity: item.completed ? 0.6 : 1,
                          },
                        ]}
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={[
                          styles.itemDescription,
                          { color: theme.colors.textSecondary },
                        ]}
                        numberOfLines={2}
                      >
                        {item.description}
                      </Text>
                      <View style={styles.itemMeta}>
                        <View
                          style={[
                            styles.priorityBadge,
                            { backgroundColor: getPriorityColor(item.priority) + '20' },
                          ]}
                        >
                          <Text
                            style={[
                              styles.priorityText,
                              { color: getPriorityColor(item.priority) },
                            ]}
                          >
                            {item.priority}
                          </Text>
                        </View>
                        {item.completedAt && (
                          <Text style={[styles.completedDate, { color: theme.colors.textSecondary }]}>
                            Completed {new Date(item.completedAt).toLocaleDateString()}
                          </Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Card>
        );
      })}

      {checklistItems.length === 0 && (
        <Card style={[styles.emptyCard, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Ionicons name="list-outline" size={48} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            No Checklist Items
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
            Set up your transition info to generate a personalized checklist.
          </Text>
        </Card>
      )}
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

  // Progress card
  progressCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  progressTitle: {
    color: '#fff',
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  progressSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  progressPercent: {
    color: '#fff',
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: borderRadius.full,
  },
  criticalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  criticalText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },

  // Filters
  filterContainer: {
    marginBottom: spacing.md,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  filterText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },

  // Category
  categoryCard: {
    marginBottom: spacing.sm,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryInfo: {},
  categoryTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  categoryTimeline: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  categoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryProgress: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  // Items list
  itemsList: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  itemDescription: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  priorityText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    textTransform: 'capitalize',
  },
  completedDate: {
    fontSize: typography.fontSize.xs,
  },

  // Empty state
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.md,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
