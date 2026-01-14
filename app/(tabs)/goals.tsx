// Savings Goals screen

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useSavingsGoals } from '../../hooks';
import { Card, Button, Modal, Input, CurrencyInput } from '../../components/common';
import { formatCurrency, formatPercent, formatDate } from '../../utils/formatters';
import { calculateMonthsToGoal } from '../../utils/calculations/budgetMath';
import { typography, borderRadius, colors } from '../../constants/theme';
import { MILITARY_GOAL_TEMPLATES } from '../../constants/categories';

export default function GoalsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { goals, addGoal, contribute, withdraw, deleteGoal } = useSavingsGoals();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: 0,
    monthlyContribution: 0,
  });

  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);

  const handleAddGoal = () => {
    if (!newGoal.name || newGoal.targetAmount <= 0) return;

    addGoal({
      name: newGoal.name,
      targetAmount: newGoal.targetAmount,
      currentAmount: 0,
      icon: 'flag',
      color: colors.categoryColors[goals.length % colors.categoryColors.length],
      priority: goals.length + 1,
      autoContribute: false,
      monthlyContribution: newGoal.monthlyContribution,
      isMilitaryGoal: false,
    });

    setNewGoal({ name: '', targetAmount: 0, monthlyContribution: 0 });
    setShowAddModal(false);
  };

  const handleQuickAdd = (template: typeof MILITARY_GOAL_TEMPLATES[0]) => {
    addGoal({
      name: template.name,
      targetAmount: 1000, // Default amount
      currentAmount: 0,
      icon: template.icon,
      color: template.color,
      priority: goals.length + 1,
      autoContribute: false,
      isMilitaryGoal: true,
      militaryGoalType: template.type,
    });
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
        <Text style={[styles.title, { color: theme.colors.text }]}>Savings Goals</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Overview Card */}
      <Card style={styles.overviewCard}>
        <View style={styles.overviewRow}>
          <View>
            <Text style={[styles.overviewLabel, { color: theme.colors.textSecondary }]}>
              Total Saved
            </Text>
            <Text style={[styles.overviewAmount, { color: theme.colors.income }]}>
              {formatCurrency(totalSaved)}
            </Text>
          </View>
          <View style={styles.overviewRight}>
            <Text style={[styles.overviewLabel, { color: theme.colors.textSecondary }]}>
              Goal Target
            </Text>
            <Text style={[styles.overviewAmount, { color: theme.colors.text }]}>
              {formatCurrency(totalTarget)}
            </Text>
          </View>
        </View>
        {totalTarget > 0 && (
          <View style={styles.overviewProgress}>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.surfaceVariant }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: theme.colors.income,
                    width: `${Math.min((totalSaved / totalTarget) * 100, 100)}%`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
              {formatPercent((totalSaved / totalTarget) * 100, 0)} of total goals
            </Text>
          </View>
        )}
      </Card>

      {/* Goals List */}
      {goals.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            No savings goals yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
            Start saving for something important
          </Text>

          {/* Quick Add Military Goals */}
          <Text style={[styles.quickAddTitle, { color: theme.colors.text }]}>
            Quick Add Military Goals
          </Text>
          <View style={styles.quickAddGrid}>
            {MILITARY_GOAL_TEMPLATES.slice(0, 4).map((template) => (
              <TouchableOpacity
                key={template.type}
                style={[styles.quickAddItem, { backgroundColor: theme.colors.card }]}
                onPress={() => handleQuickAdd(template)}
              >
                <View style={[styles.quickAddIcon, { backgroundColor: template.color + '20' }]}>
                  <Text style={{ color: template.color, fontSize: 20 }}>
                    {template.icon === 'flag' ? '🎯' :
                     template.icon === 'airplane' ? '✈️' :
                     template.icon === 'car' ? '🚗' : '🛡️'}
                  </Text>
                </View>
                <Text style={[styles.quickAddLabel, { color: theme.colors.text }]}>
                  {template.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <>
          {goals.map((goal) => {
            const monthsToGoal = calculateMonthsToGoal(
              goal.currentAmount,
              goal.targetAmount,
              goal.monthlyContribution || 0
            );

            return (
              <Card key={goal.id} style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <View style={[styles.goalIcon, { backgroundColor: goal.color + '20' }]}>
                    <Text style={{ fontSize: 24 }}>
                      {goal.icon === 'flag' ? '🎯' :
                       goal.icon === 'airplane' ? '✈️' :
                       goal.icon === 'car' ? '🚗' :
                       goal.icon === 'shield' ? '🛡️' :
                       goal.icon === 'home' ? '🏠' :
                       goal.icon === 'sunny' ? '☀️' : '💰'}
                    </Text>
                  </View>
                  <View style={styles.goalInfo}>
                    <Text style={[styles.goalName, { color: theme.colors.text }]}>
                      {goal.name}
                    </Text>
                    {goal.deadline && (
                      <Text style={[styles.goalDeadline, { color: theme.colors.textSecondary }]}>
                        Target: {formatDate(goal.deadline)}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.goalProgress}>
                  <View style={styles.goalAmounts}>
                    <Text style={[styles.goalCurrent, { color: goal.color }]}>
                      {formatCurrency(goal.currentAmount)}
                    </Text>
                    <Text style={[styles.goalTarget, { color: theme.colors.textSecondary }]}>
                      of {formatCurrency(goal.targetAmount)}
                    </Text>
                  </View>
                  <Text style={[styles.goalPercent, { color: theme.colors.text }]}>
                    {formatPercent(goal.progress, 0)}
                  </Text>
                </View>

                <View style={[styles.progressBar, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <View
                    style={[
                      styles.progressFill,
                      { backgroundColor: goal.color, width: `${Math.min(goal.progress, 100)}%` },
                    ]}
                  />
                </View>

                {monthsToGoal !== null && monthsToGoal > 0 && (
                  <Text style={[styles.goalEta, { color: theme.colors.textSecondary }]}>
                    ~{monthsToGoal} months to reach goal at {formatCurrency(goal.monthlyContribution || 0)}/month
                  </Text>
                )}

                <View style={styles.goalActions}>
                  <TouchableOpacity
                    style={[styles.goalAction, { backgroundColor: theme.colors.income + '20' }]}
                    onPress={() => {
                      // In production, show contribution modal
                      contribute(goal.id, 100);
                    }}
                  >
                    <Text style={[styles.goalActionText, { color: theme.colors.income }]}>
                      + Add Funds
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.goalAction, { backgroundColor: theme.colors.surfaceVariant }]}
                    onPress={() => {
                      // In production, show withdraw modal
                      withdraw(goal.id, 50);
                    }}
                  >
                    <Text style={[styles.goalActionText, { color: theme.colors.textSecondary }]}>
                      - Withdraw
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card>
            );
          })}
        </>
      )}

      {/* Add Goal Modal */}
      <Modal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="New Savings Goal"
      >
        <Input
          label="Goal Name"
          placeholder="What are you saving for?"
          value={newGoal.name}
          onChangeText={(name) => setNewGoal({ ...newGoal, name })}
        />
        <CurrencyInput
          label="Target Amount"
          value={newGoal.targetAmount}
          onChangeValue={(targetAmount) => setNewGoal({ ...newGoal, targetAmount })}
          placeholder="0.00"
        />
        <CurrencyInput
          label="Monthly Contribution (optional)"
          value={newGoal.monthlyContribution}
          onChangeValue={(monthlyContribution) => setNewGoal({ ...newGoal, monthlyContribution })}
          placeholder="0.00"
        />
        <Button
          title="Create Goal"
          onPress={handleAddGoal}
          fullWidth
          disabled={!newGoal.name || newGoal.targetAmount <= 0}
          style={{ marginTop: 16 }}
        />
      </Modal>
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
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: typography.fontWeight.bold,
  },
  overviewCard: {
    marginBottom: 20,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overviewRight: {
    alignItems: 'flex-end',
  },
  overviewLabel: {
    fontSize: typography.fontSize.sm,
    marginBottom: 4,
  },
  overviewAmount: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
  },
  overviewProgress: {
    marginTop: 16,
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
  progressText: {
    fontSize: typography.fontSize.sm,
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.md,
    marginBottom: 32,
  },
  quickAddTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  quickAddGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
  },
  quickAddItem: {
    width: '47%',
    padding: 16,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  quickAddIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickAddLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
  },
  goalCard: {
    marginBottom: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  goalDeadline: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  goalProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  goalAmounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  goalCurrent: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  goalTarget: {
    fontSize: typography.fontSize.md,
  },
  goalPercent: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  goalEta: {
    fontSize: typography.fontSize.sm,
    marginTop: 8,
  },
  goalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  goalAction: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  goalActionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
});
