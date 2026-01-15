/**
 * Pre-Deployment Checklist Screen
 * Tasks and reminders before deployment
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
import { Card } from '../../components/common';
import { typography, borderRadius, spacing } from '../../constants/theme';
import { PRE_DEPLOYMENT_CHECKLIST } from '../../constants/deploymentData';

export default function DeploymentChecklistScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  // Track completed items
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  const toggleItem = (itemId: string) => {
    const newCompleted = new Set(completedItems);
    if (newCompleted.has(itemId)) {
      newCompleted.delete(itemId);
    } else {
      newCompleted.add(itemId);
    }
    setCompletedItems(newCompleted);
  };

  // Calculate progress
  const totalItems = PRE_DEPLOYMENT_CHECKLIST.reduce(
    (sum, category) => sum + category.items.length,
    0
  );
  const completedCount = completedItems.size;
  const progressPercent = totalItems > 0 ? (completedCount / totalItems) * 100 : 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      {/* Progress Header */}
      <Card style={[styles.progressCard, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.progressTitle}>Pre-Deployment Checklist</Text>
        <View style={styles.progressStats}>
          <Text style={styles.progressCount}>
            {completedCount} of {totalItems} complete
          </Text>
          <Text style={styles.progressPercent}>
            {Math.round(progressPercent)}%
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${progressPercent}%` }]}
          />
        </View>
      </Card>

      {/* Checklist Categories */}
      {PRE_DEPLOYMENT_CHECKLIST.map((category) => {
        const categoryCompleted = category.items.filter((item) =>
          completedItems.has(item.id)
        ).length;

        return (
          <Card key={category.category} style={styles.categoryCard}>
            <View style={styles.categoryHeader}>
              <Text style={[styles.categoryTitle, { color: theme.colors.text }]}>
                {category.category}
              </Text>
              <Text style={[styles.categoryProgress, { color: theme.colors.textSecondary }]}>
                {categoryCompleted}/{category.items.length}
              </Text>
            </View>

            {category.items.map((item) => {
              const isCompleted = completedItems.has(item.id);
              const priorityColor =
                item.priority === 'high'
                  ? theme.colors.expense
                  : item.priority === 'medium'
                  ? theme.colors.warning
                  : theme.colors.textSecondary;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.checklistItem,
                    { borderBottomColor: theme.colors.border },
                  ]}
                  onPress={() => toggleItem(item.id)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        backgroundColor: isCompleted
                          ? theme.colors.income
                          : 'transparent',
                        borderColor: isCompleted
                          ? theme.colors.income
                          : theme.colors.border,
                      },
                    ]}
                  >
                    {isCompleted && (
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    )}
                  </View>
                  <View style={styles.itemContent}>
                    <View style={styles.itemHeader}>
                      <Text
                        style={[
                          styles.itemTitle,
                          {
                            color: theme.colors.text,
                            textDecorationLine: isCompleted ? 'line-through' : 'none',
                            opacity: isCompleted ? 0.6 : 1,
                          },
                        ]}
                      >
                        {item.title}
                      </Text>
                      <View
                        style={[
                          styles.priorityBadge,
                          { backgroundColor: priorityColor + '20' },
                        ]}
                      >
                        <Text
                          style={[styles.priorityText, { color: priorityColor }]}
                        >
                          {item.priority}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.itemDescription,
                        {
                          color: theme.colors.textSecondary,
                          opacity: isCompleted ? 0.6 : 1,
                        },
                      ]}
                    >
                      {item.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </Card>
        );
      })}

      {/* Info Card */}
      <Card style={[styles.infoCard, { backgroundColor: theme.colors.primary + '10' }]}>
        <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
        <Text style={[styles.infoText, { color: theme.colors.text }]}>
          Complete these tasks before your departure date to ensure a smooth deployment
          and protect your finances while you&apos;re away.
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

  // Progress card
  progressCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  progressTitle: {
    color: '#fff',
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.md,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressCount: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: typography.fontSize.md,
  },
  progressPercent: {
    color: '#fff',
    fontSize: typography.fontSize.md,
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

  // Category
  categoryCard: {
    marginBottom: spacing.md,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  categoryTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  categoryProgress: {
    fontSize: typography.fontSize.sm,
  },

  // Checklist item
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    marginTop: 2,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  itemTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    flex: 1,
  },
  itemDescription: {
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginLeft: spacing.sm,
  },
  priorityText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    textTransform: 'capitalize',
  },

  // Info card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
});
