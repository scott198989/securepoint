// Dashboard screen - main overview

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useAuth, useMonthlyTransactions, useRecentTransactions, useFinancialOverview } from '../../hooks';
import { Card, StatCard } from '../../components/common';
import { formatCurrency, formatDate, formatMonthYear } from '../../utils/formatters';
import { typography, borderRadius } from '../../constants/theme';
import { useTransactionStore } from '../../store';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { user } = useAuth();
  const monthlySummary = useMonthlyTransactions();
  const recentTransactions = useRecentTransactions(5);
  const { totalBalance, totalSavings, totalDebt, netWorth } = useFinancialOverview();
  const { categories } = useTransactionStore();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // In production, this would sync with backend
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.color || theme.colors.textSecondary;
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 },
      ]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
            Welcome back,
          </Text>
          <Text style={[styles.userName, { color: theme.colors.text }]}>
            {user?.displayName || 'User'}
          </Text>
        </View>
        <Text style={[styles.date, { color: theme.colors.textSecondary }]}>
          {formatMonthYear(new Date())}
        </Text>
      </View>

      {/* Net Worth Card */}
      <Card style={[styles.netWorthCard, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.netWorthLabel}>Net Worth</Text>
        <Text style={styles.netWorthValue}>{formatCurrency(netWorth)}</Text>
        <View style={styles.netWorthDetails}>
          <View style={styles.netWorthItem}>
            <Text style={styles.netWorthItemLabel}>Assets</Text>
            <Text style={styles.netWorthItemValue}>
              {formatCurrency(totalBalance + totalSavings)}
            </Text>
          </View>
          <View style={styles.netWorthDivider} />
          <View style={styles.netWorthItem}>
            <Text style={styles.netWorthItemLabel}>Debt</Text>
            <Text style={styles.netWorthItemValue}>
              {formatCurrency(totalDebt)}
            </Text>
          </View>
        </View>
      </Card>

      {/* Monthly Summary Stats */}
      <View style={styles.statsGrid}>
        <StatCard
          label="Income"
          value={formatCurrency(monthlySummary.totalIncome)}
          color={theme.colors.income}
        />
        <StatCard
          label="Expenses"
          value={formatCurrency(monthlySummary.totalExpenses)}
          color={theme.colors.expense}
        />
      </View>

      {/* Cash Flow */}
      <Card title="This Month" style={styles.section}>
        <View style={styles.cashFlowRow}>
          <Text style={[styles.cashFlowLabel, { color: theme.colors.textSecondary }]}>
            Net Cash Flow
          </Text>
          <Text
            style={[
              styles.cashFlowValue,
              { color: monthlySummary.netFlow >= 0 ? theme.colors.income : theme.colors.expense },
            ]}
          >
            {monthlySummary.netFlow >= 0 ? '+' : ''}
            {formatCurrency(monthlySummary.netFlow)}
          </Text>
        </View>

        {/* Simple progress bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: theme.colors.surfaceVariant }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: theme.colors.income,
                  width: monthlySummary.totalIncome > 0
                    ? `${Math.min((monthlySummary.totalExpenses / monthlySummary.totalIncome) * 100, 100)}%`
                    : '0%',
                },
              ]}
            />
          </View>
          <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>
            {monthlySummary.totalIncome > 0
              ? `${Math.round((monthlySummary.totalExpenses / monthlySummary.totalIncome) * 100)}% of income spent`
              : 'No income recorded'}
          </Text>
        </View>
      </Card>

      {/* Recent Transactions */}
      <Card title="Recent Transactions" style={styles.section}>
        {recentTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No transactions yet
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/add-transaction')}
              style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            >
              <Text style={styles.addButtonText}>Add Transaction</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {recentTransactions.map((transaction) => (
              <TouchableOpacity
                key={transaction.id}
                style={[styles.transactionItem, { borderBottomColor: theme.colors.border }]}
                onPress={() => router.push(`/transactions/${transaction.id}`)}
              >
                <View
                  style={[
                    styles.categoryDot,
                    { backgroundColor: getCategoryColor(transaction.categoryId) },
                  ]}
                />
                <View style={styles.transactionInfo}>
                  <Text style={[styles.transactionDesc, { color: theme.colors.text }]}>
                    {transaction.description}
                  </Text>
                  <Text style={[styles.transactionCategory, { color: theme.colors.textSecondary }]}>
                    {getCategoryName(transaction.categoryId)} • {formatDate(transaction.date, 'MMM d')}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    {
                      color: transaction.type === 'income'
                        ? theme.colors.income
                        : theme.colors.expense,
                    },
                  ]}
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/transactions')}
              style={styles.viewAllButton}
            >
              <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>
                View All Transactions
              </Text>
            </TouchableOpacity>
          </>
        )}
      </Card>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.quickAction, { backgroundColor: theme.colors.card }]}
          onPress={() => router.push('/add-transaction')}
        >
          <Text style={styles.quickActionIcon}>+</Text>
          <Text style={[styles.quickActionLabel, { color: theme.colors.text }]}>
            Add Transaction
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickAction, { backgroundColor: theme.colors.card }]}
          onPress={() => router.push('/(tabs)/budget')}
        >
          <Text style={styles.quickActionIcon}>◈</Text>
          <Text style={[styles.quickActionLabel, { color: theme.colors.text }]}>
            View Budget
          </Text>
        </TouchableOpacity>
      </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greeting: {
    fontSize: typography.fontSize.sm,
  },
  userName: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
  },
  date: {
    fontSize: typography.fontSize.sm,
  },
  // Net Worth Card
  netWorthCard: {
    padding: 20,
    marginBottom: 16,
  },
  netWorthLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.fontSize.sm,
    marginBottom: 4,
  },
  netWorthValue: {
    color: '#ffffff',
    fontSize: typography.fontSize.display,
    fontWeight: typography.fontWeight.bold,
    marginBottom: 16,
  },
  netWorthDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  netWorthItem: {
    flex: 1,
  },
  netWorthItemLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: typography.fontSize.xs,
  },
  netWorthItemValue: {
    color: '#ffffff',
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  netWorthDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 16,
  },
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  // Cash Flow
  cashFlowRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cashFlowLabel: {
    fontSize: typography.fontSize.md,
  },
  cashFlowValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: typography.fontSize.xs,
    marginTop: 4,
  },
  // Transactions
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    marginBottom: 16,
  },
  addButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDesc: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  transactionCategory: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  viewAllButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: borderRadius.lg,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
});
