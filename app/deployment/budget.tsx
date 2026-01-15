/**
 * Deployment Budget Screen
 * Manage reduced expenses during deployment
 */

import React from 'react';
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
import { useDeploymentStore } from '../../store/deploymentStore';
import { Card, Button } from '../../components/common';
import { typography, borderRadius, spacing } from '../../constants/theme';
import { formatCurrency } from '../../utils/formatters';
import { DEFAULT_EXPENSE_ADJUSTMENTS } from '../../constants/deploymentData';

export default function DeploymentBudgetScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const {
    deploymentBudget,
    createDeploymentBudget,
    activeDeployment,
  } = useDeploymentStore();

  // Initialize budget if needed
  const handleCreateBudget = () => {
    createDeploymentBudget(3000, 500); // Default values
  };

  if (!activeDeployment) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.noData, { color: theme.colors.textSecondary }]}>
          No active deployment
        </Text>
      </View>
    );
  }

  if (!deploymentBudget) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Card style={styles.setupCard}>
          <Ionicons name="wallet-outline" size={48} color={theme.colors.primary} />
          <Text style={[styles.setupTitle, { color: theme.colors.text }]}>
            Set Up Deployment Budget
          </Text>
          <Text style={[styles.setupDescription, { color: theme.colors.textSecondary }]}>
            Track your reduced expenses and maximized savings during deployment
          </Text>
          <Button
            title="Create Budget"
            onPress={handleCreateBudget}
            style={styles.setupButton}
          />
        </Card>
      </View>
    );
  }

  const savingsIncrease = deploymentBudget.normalMonthlyExpenses - deploymentBudget.deploymentMonthlyExpenses;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      {/* Summary Card */}
      <Card style={[styles.summaryCard, { backgroundColor: theme.colors.income + '10' }]}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
              Normal Monthly
            </Text>
            <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
              {formatCurrency(deploymentBudget.normalMonthlyExpenses)}
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color={theme.colors.textSecondary} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
              Deployment Monthly
            </Text>
            <Text style={[styles.summaryValue, { color: theme.colors.income }]}>
              {formatCurrency(deploymentBudget.deploymentMonthlyExpenses)}
            </Text>
          </View>
        </View>
        <View style={[styles.savingsRow, { borderTopColor: theme.colors.border }]}>
          <Text style={[styles.savingsLabel, { color: theme.colors.text }]}>
            Extra Savings Per Month
          </Text>
          <Text style={[styles.savingsValue, { color: theme.colors.income }]}>
            +{formatCurrency(savingsIncrease)}
          </Text>
        </View>
      </Card>

      {/* Expense Adjustments */}
      <Card style={styles.sectionCard}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Expense Adjustments
        </Text>
        <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
          Recommended changes during deployment
        </Text>

        {DEFAULT_EXPENSE_ADJUSTMENTS.map((adjustment) => (
          <View
            key={adjustment.categoryId}
            style={[styles.adjustmentRow, { borderBottomColor: theme.colors.border }]}
          >
            <View style={styles.adjustmentInfo}>
              <Text style={[styles.adjustmentCategory, { color: theme.colors.text }]}>
                {adjustment.categoryName}
              </Text>
              <Text style={[styles.adjustmentReason, { color: theme.colors.textSecondary }]}>
                {adjustment.reason}
              </Text>
            </View>
            <View
              style={[
                styles.adjustmentBadge,
                {
                  backgroundColor:
                    adjustment.adjustmentType === 'eliminate'
                      ? theme.colors.income + '20'
                      : adjustment.adjustmentType === 'reduce'
                      ? theme.colors.warning + '20'
                      : theme.colors.surfaceVariant,
                },
              ]}
            >
              <Text
                style={[
                  styles.adjustmentBadgeText,
                  {
                    color:
                      adjustment.adjustmentType === 'eliminate'
                        ? theme.colors.income
                        : adjustment.adjustmentType === 'reduce'
                        ? theme.colors.warning
                        : theme.colors.text,
                  },
                ]}
              >
                {adjustment.adjustmentType === 'eliminate'
                  ? 'Eliminate'
                  : adjustment.adjustmentType === 'reduce'
                  ? 'Reduce'
                  : adjustment.adjustmentType === 'increase'
                  ? 'Increase'
                  : 'No Change'}
              </Text>
            </View>
          </View>
        ))}
      </Card>

      {/* Projected Savings */}
      <Card style={styles.projectionCard}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Savings Projection
        </Text>
        <View style={styles.projectionRow}>
          <Text style={[styles.projectionLabel, { color: theme.colors.textSecondary }]}>
            Monthly Savings Rate
          </Text>
          <Text style={[styles.projectionValue, { color: theme.colors.text }]}>
            {formatCurrency(deploymentBudget.projectedMonthlySavings)}
          </Text>
        </View>
        <View style={styles.projectionRow}>
          <Text style={[styles.projectionLabel, { color: theme.colors.textSecondary }]}>
            Projected Total Savings
          </Text>
          <Text style={[styles.projectionValue, { color: theme.colors.income }]}>
            {formatCurrency(deploymentBudget.projectedTotalSavings)}
          </Text>
        </View>
      </Card>

      {/* Tips */}
      <Card style={[styles.tipsCard, { backgroundColor: theme.colors.primary + '10' }]}>
        <Ionicons name="bulb-outline" size={24} color={theme.colors.primary} />
        <Text style={[styles.tipsTitle, { color: theme.colors.text }]}>
          Deployment Savings Tips
        </Text>
        <View style={styles.tipsList}>
          <Text style={[styles.tipItem, { color: theme.colors.textSecondary }]}>
            {'\u2022'} Pause streaming services you won&apos;t use
          </Text>
          <Text style={[styles.tipItem, { color: theme.colors.textSecondary }]}>
            {'\u2022'} Contact car insurance for storage discount
          </Text>
          <Text style={[styles.tipItem, { color: theme.colors.textSecondary }]}>
            {'\u2022'} Increase TSP contributions (tax-free!)
          </Text>
          <Text style={[styles.tipItem, { color: theme.colors.textSecondary }]}>
            {'\u2022'} Enroll in Savings Deposit Program (10% interest)
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  content: {
    padding: spacing.md,
  },
  noData: {
    textAlign: 'center',
    marginTop: spacing.xl,
    fontSize: typography.fontSize.md,
  },

  // Setup card
  setupCard: {
    alignItems: 'center',
    padding: spacing.xl,
    maxWidth: 320,
  },
  setupTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  setupDescription: {
    fontSize: typography.fontSize.md,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  setupButton: {
    width: '100%',
  },

  // Summary card
  summaryCard: {
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  savingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  savingsLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  savingsValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },

  // Section
  sectionCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.md,
  },

  // Adjustments
  adjustmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  adjustmentInfo: {
    flex: 1,
  },
  adjustmentCategory: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  adjustmentReason: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  adjustmentBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  adjustmentBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },

  // Projection
  projectionCard: {
    marginBottom: spacing.md,
  },
  projectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  projectionLabel: {
    fontSize: typography.fontSize.sm,
  },
  projectionValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  // Tips
  tipsCard: {
    marginBottom: spacing.md,
  },
  tipsTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  tipsList: {
    gap: spacing.sm,
  },
  tipItem: {
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
});
