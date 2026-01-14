// Budget screen

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useBudget, useMonthlyTransactions, useTransactions } from '../../hooks';
import { Card } from '../../components/common';
import { formatCurrency, formatPercent, formatMonthYear } from '../../utils/formatters';
import { typography, borderRadius } from '../../constants/theme';

export default function BudgetScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { activeBudget } = useBudget();
  const monthlySummary = useMonthlyTransactions();
  const { categories } = useTransactions();

  // Calculate spending by category
  const categorySpending = monthlySummary.byCategory
    .filter((c) => {
      const category = categories.find((cat) => cat.id === c.categoryId);
      return category?.type === 'expense';
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  const totalBudgeted = activeBudget?.totalBudgeted || monthlySummary.totalIncome;
  const totalSpent = monthlySummary.totalExpenses;
  const remaining = totalBudgeted - totalSpent;
  const spentPercent = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  const getCategoryInfo = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return {
      name: category?.name || 'Unknown',
      color: category?.color || theme.colors.textSecondary,
    };
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Budget</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {formatMonthYear(new Date())}
        </Text>
      </View>

      {/* Budget Overview Card */}
      <Card style={styles.overviewCard}>
        <View style={styles.overviewHeader}>
          <View>
            <Text style={[styles.overviewLabel, { color: theme.colors.textSecondary }]}>
              Monthly Budget
            </Text>
            <Text style={[styles.overviewAmount, { color: theme.colors.text }]}>
              {formatCurrency(totalBudgeted)}
            </Text>
          </View>
          <View style={styles.overviewStats}>
            <Text style={[styles.remainingLabel, { color: theme.colors.textSecondary }]}>
              Remaining
            </Text>
            <Text
              style={[
                styles.remainingAmount,
                { color: remaining >= 0 ? theme.colors.income : theme.colors.expense },
              ]}
            >
              {formatCurrency(remaining)}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={[styles.progressBar, { backgroundColor: theme.colors.surfaceVariant }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: spentPercent > 100 ? theme.colors.expense : theme.colors.primary,
                  width: `${Math.min(spentPercent, 100)}%`,
                },
              ]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
              {formatCurrency(totalSpent)} spent
            </Text>
            <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
              {formatPercent(spentPercent, 0)} of budget
            </Text>
          </View>
        </View>
      </Card>

      {/* Income vs Expenses */}
      <View style={styles.summaryRow}>
        <Card style={[styles.summaryCard, { flex: 1 }]}>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Income</Text>
          <Text style={[styles.summaryAmount, { color: theme.colors.income }]}>
            {formatCurrency(monthlySummary.totalIncome)}
          </Text>
        </Card>
        <Card style={[styles.summaryCard, { flex: 1 }]}>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Expenses</Text>
          <Text style={[styles.summaryAmount, { color: theme.colors.expense }]}>
            {formatCurrency(monthlySummary.totalExpenses)}
          </Text>
        </Card>
      </View>

      {/* Spending by Category */}
      <Card title="Spending by Category" style={styles.categoryCard}>
        {categorySpending.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            No spending recorded this month
          </Text>
        ) : (
          <>
            {categorySpending.map((item, index) => {
              const category = getCategoryInfo(item.categoryId);
              const percent = totalSpent > 0 ? (item.total / totalSpent) * 100 : 0;

              return (
                <View
                  key={item.categoryId}
                  style={[
                    styles.categoryItem,
                    index < categorySpending.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: theme.colors.border,
                    },
                  ]}
                >
                  <View style={styles.categoryHeader}>
                    <View style={styles.categoryInfo}>
                      <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                      <Text style={[styles.categoryName, { color: theme.colors.text }]}>
                        {category.name}
                      </Text>
                    </View>
                    <Text style={[styles.categoryAmount, { color: theme.colors.text }]}>
                      {formatCurrency(item.total)}
                    </Text>
                  </View>
                  <View style={styles.categoryProgress}>
                    <View
                      style={[styles.categoryBar, { backgroundColor: theme.colors.surfaceVariant }]}
                    >
                      <View
                        style={[
                          styles.categoryBarFill,
                          { backgroundColor: category.color, width: `${percent}%` },
                        ]}
                      />
                    </View>
                    <Text style={[styles.categoryPercent, { color: theme.colors.textSecondary }]}>
                      {formatPercent(percent, 0)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </>
        )}
      </Card>

      {/* Budget Tips */}
      {remaining < 0 && (
        <Card style={[styles.tipCard, { backgroundColor: theme.colors.expense + '15' }]}>
          <Text style={[styles.tipTitle, { color: theme.colors.expense }]}>Over Budget</Text>
          <Text style={[styles.tipText, { color: theme.colors.text }]}>
            You've exceeded your budget by {formatCurrency(Math.abs(remaining))}. Consider reviewing
            your spending in the top categories.
          </Text>
        </Card>
      )}

      {remaining > 0 && spentPercent > 75 && (
        <Card style={[styles.tipCard, { backgroundColor: '#ff9800' + '15' }]}>
          <Text style={[styles.tipTitle, { color: '#ff9800' }]}>Getting Close</Text>
          <Text style={[styles.tipText, { color: theme.colors.text }]}>
            You've used {formatPercent(spentPercent, 0)} of your budget. You have{' '}
            {formatCurrency(remaining)} remaining for the rest of the month.
          </Text>
        </Card>
      )}

      {remaining > 0 && spentPercent <= 75 && monthlySummary.totalExpenses > 0 && (
        <Card style={[styles.tipCard, { backgroundColor: theme.colors.income + '15' }]}>
          <Text style={[styles.tipTitle, { color: theme.colors.income }]}>On Track</Text>
          <Text style={[styles.tipText, { color: theme.colors.text }]}>
            Great job! You're on track with your budget this month.
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
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    marginTop: 4,
  },
  overviewCard: {
    marginBottom: 16,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  overviewLabel: {
    fontSize: typography.fontSize.sm,
    marginBottom: 4,
  },
  overviewAmount: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
  },
  overviewStats: {
    alignItems: 'flex-end',
  },
  remainingLabel: {
    fontSize: typography.fontSize.sm,
    marginBottom: 4,
  },
  remainingAmount: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
  },
  progressSection: {
    marginTop: 8,
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressText: {
    fontSize: typography.fontSize.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    padding: 16,
  },
  summaryLabel: {
    fontSize: typography.fontSize.sm,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  categoryCard: {
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: typography.fontSize.md,
  },
  categoryItem: {
    paddingVertical: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  categoryAmount: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  categoryProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  categoryPercent: {
    fontSize: typography.fontSize.sm,
    width: 45,
    textAlign: 'right',
  },
  tipCard: {
    padding: 16,
    marginBottom: 16,
  },
  tipTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: 4,
  },
  tipText: {
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
});
