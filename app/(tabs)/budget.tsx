// Budget screen with entry fields and charts

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useBudget, useMonthlyTransactions, useTransactions } from '../../hooks';
import { Card, MilitaryBackground, PieChart, BarChart } from '../../components/common';
import { formatCurrency, formatPercent, formatMonthYear } from '../../utils/formatters';
import { typography, borderRadius, spacing } from '../../constants/theme';

interface BudgetItem {
  categoryId: string;
  budgeted: number; // Target amount
  actual: number; // Manually entered actual spent
}

export default function BudgetScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { activeBudget, addBudget, updateBudget } = useBudget();
  const monthlySummary = useMonthlyTransactions();
  const { categories } = useTransactions();

  const [isEditing, setIsEditing] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [totalMonthlyBudget, setTotalMonthlyBudget] = useState('');
  const [initialized, setInitialized] = useState(false);

  // Get expense categories only
  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === 'expense'),
    [categories]
  );

  // Initialize budget items from active budget or spending data (only once)
  useEffect(() => {
    if (initialized) return;

    if (activeBudget?.categories && activeBudget.categories.length > 0) {
      const items = activeBudget.categories.map((cb) => {
        return {
          categoryId: cb.categoryId,
          budgeted: cb.budgeted,
          actual: cb.spent, // Use saved actual amount
        };
      });
      setBudgetItems(items);
      setTotalMonthlyBudget(activeBudget.totalBudgeted.toString());
      setInitialized(true);
    } else if (expenseCategories.length > 0) {
      // Initialize with all expense categories
      const items = expenseCategories.map((cat) => {
        return {
          categoryId: cat.id,
          budgeted: 0,
          actual: 0,
        };
      });
      setBudgetItems(items);
      setInitialized(true);
    }
  }, [activeBudget, expenseCategories, initialized]);

  const getCategoryInfo = useCallback(
    (categoryId: string) => {
      const category = categories.find((c) => c.id === categoryId);
      return {
        name: category?.name || 'Unknown',
        color: category?.color || theme.colors.textSecondary,
        icon: category?.icon || 'help-circle',
      };
    },
    [categories, theme.colors.textSecondary]
  );

  const totalBudgeted = useMemo(
    () => budgetItems.reduce((sum, item) => sum + item.budgeted, 0),
    [budgetItems]
  );

  const totalActual = useMemo(
    () => budgetItems.reduce((sum, item) => sum + item.actual, 0),
    [budgetItems]
  );

  const budgetAmount = parseFloat(totalMonthlyBudget) || 0;
  const remaining = budgetAmount - totalActual;
  const spentPercent = budgetAmount > 0 ? (totalActual / budgetAmount) * 100 : 0;
  const targetDifference = budgetAmount - totalBudgeted; // Positive = under budget, Negative = over allocated

  const handleBudgetChange = (categoryId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setBudgetItems((prev) =>
      prev.map((item) =>
        item.categoryId === categoryId ? { ...item, budgeted: numValue } : item
      )
    );
  };

  const handleActualChange = (categoryId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setBudgetItems((prev) =>
      prev.map((item) =>
        item.categoryId === categoryId ? { ...item, actual: numValue } : item
      )
    );
  };

  const handleAddCategory = (categoryId: string) => {
    if (budgetItems.find((item) => item.categoryId === categoryId)) return;

    setBudgetItems((prev) => [
      ...prev,
      { categoryId, budgeted: 0, actual: 0 },
    ]);
    setShowAddCategory(false);
  };

  const handleRemoveCategory = (categoryId: string) => {
    setBudgetItems((prev) => prev.filter((item) => item.categoryId !== categoryId));
  };

  const handleSaveBudget = () => {
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const totalBudgetAmount = parseFloat(totalMonthlyBudget) || totalBudgeted;

    const budgetCategories = budgetItems
      .filter((item) => item.budgeted > 0 || item.actual > 0) // Save categories with budget or actual set
      .map((item) => ({
        categoryId: item.categoryId,
        budgeted: item.budgeted,
        spent: item.actual, // Store actual as spent
        remaining: item.budgeted - item.actual,
        rollover: false,
      }));

    if (activeBudget) {
      updateBudget(activeBudget.id, {
        name: `${formatMonthYear(now)} Budget`,
        totalBudgeted: totalBudgetAmount,
        totalSpent: totalActual,
        categories: budgetCategories,
      });
    } else {
      addBudget({
        name: `${formatMonthYear(now)} Budget`,
        period: 'monthly',
        method: 'envelope',
        startDate: now.toISOString(),
        endDate: endOfMonth.toISOString(),
        totalBudgeted: totalBudgetAmount,
        totalSpent: totalActual,
        categories: budgetCategories,
        isActive: true,
      });
    }

    setIsEditing(false);

    if (Platform.OS === 'web') {
      window.alert('Budget saved successfully!');
    } else {
      Alert.alert('Success', 'Budget saved successfully!');
    }
  };

  // Categories not in budget yet
  const availableCategories = useMemo(
    () => expenseCategories.filter((cat) => !budgetItems.find((item) => item.categoryId === cat.id)),
    [expenseCategories, budgetItems]
  );

  // Chart data
  const pieChartData = useMemo(() => {
    return budgetItems
      .filter((item) => item.actual > 0)
      .sort((a, b) => b.actual - a.actual)
      .slice(0, 6)
      .map((item) => {
        const category = getCategoryInfo(item.categoryId);
        return {
          value: item.actual,
          color: category.color,
          label: category.name,
        };
      });
  }, [budgetItems, getCategoryInfo]);

  const barChartData = useMemo(() => {
    return budgetItems
      .filter((item) => item.budgeted > 0 || item.actual > 0)
      .sort((a, b) => b.budgeted - a.budgeted)
      .slice(0, 6)
      .map((item) => {
        const category = getCategoryInfo(item.categoryId);
        return {
          value: item.actual,
          maxValue: item.budgeted,
          color: category.color,
          label: category.name,
        };
      });
  }, [budgetItems, getCategoryInfo]);

  return (
    <MilitaryBackground overlayOpacity={0.4}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: theme.colors.text }]}>Budget</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {formatMonthYear(new Date())}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.editButton,
              {
                backgroundColor: isEditing ? theme.colors.primary : 'transparent',
                borderColor: theme.colors.primary,
              },
            ]}
            onPress={() => (isEditing ? handleSaveBudget() : setIsEditing(true))}
          >
            <Text
              style={[
                styles.editButtonText,
                { color: isEditing ? '#fff' : theme.colors.primary },
              ]}
            >
              {isEditing ? 'Save' : 'Edit Budget'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Monthly Budget Input */}
        {isEditing && (
          <Card style={styles.monthlyCard}>
            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
              Total Monthly Budget
            </Text>
            <View style={styles.budgetInputRow}>
              <Text style={[styles.currencySymbol, { color: theme.colors.text }]}>$</Text>
              <TextInput
                style={[
                  styles.budgetInput,
                  {
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  },
                ]}
                value={totalMonthlyBudget}
                onChangeText={setTotalMonthlyBudget}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor={theme.colors.placeholder}
              />
            </View>
          </Card>
        )}

        {/* Budget Overview Card */}
        <Card style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <View>
              <Text style={[styles.overviewLabel, { color: theme.colors.textSecondary }]}>
                Monthly Budget
              </Text>
              <Text style={[styles.overviewAmount, { color: theme.colors.text }]}>
                {formatCurrency(budgetAmount)}
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
                {formatCurrency(totalActual)} spent
              </Text>
              <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
                {formatPercent(spentPercent, 0)} of budget
              </Text>
            </View>
          </View>

          {/* Budget Allocation Comparison */}
          {budgetAmount > 0 && (
            <View style={[styles.allocationSection, { borderTopColor: theme.colors.border }]}>
              <View style={styles.allocationRow}>
                <Text style={[styles.allocationLabel, { color: theme.colors.textSecondary }]}>
                  Category Targets Total
                </Text>
                <Text style={[styles.allocationValue, { color: theme.colors.text }]}>
                  {formatCurrency(totalBudgeted)}
                </Text>
              </View>
              <View style={styles.allocationRow}>
                <Text style={[styles.allocationLabel, { color: theme.colors.textSecondary }]}>
                  {targetDifference >= 0 ? 'Unallocated' : 'Over-allocated'}
                </Text>
                <Text
                  style={[
                    styles.allocationValue,
                    { color: targetDifference >= 0 ? theme.colors.income : theme.colors.expense },
                  ]}
                >
                  {formatCurrency(Math.abs(targetDifference))}
                </Text>
              </View>
            </View>
          )}
        </Card>

        {/* Spending Pie Chart */}
        {!isEditing && pieChartData.length > 0 && (
          <Card title="Spending Breakdown" style={styles.chartCard}>
            <PieChart data={pieChartData} size={180} innerRadius={50} showLabels={true} />
          </Card>
        )}

        {/* Budget vs Spent Bar Chart */}
        {!isEditing && barChartData.length > 0 && (
          <Card title="Budget vs Spending" style={styles.chartCard}>
            <BarChart
              data={barChartData}
              barHeight={20}
              showValues={true}
              formatValue={formatCurrency}
            />
          </Card>
        )}

        {/* Category Budgets */}
        <Card title="Category Budgets" style={styles.categoryCard}>
          {budgetItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No budget categories set
              </Text>
              {isEditing && (
                <TouchableOpacity
                  style={[styles.addCategoryButton, { borderColor: theme.colors.primary }]}
                  onPress={() => setShowAddCategory(true)}
                >
                  <Ionicons name="add" size={20} color={theme.colors.primary} />
                  <Text style={[styles.addCategoryText, { color: theme.colors.primary }]}>
                    Add Category
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
              {budgetItems.map((item, index) => {
                const category = getCategoryInfo(item.categoryId);
                const percent = item.budgeted > 0 ? (item.actual / item.budgeted) * 100 : 0;
                const isOverBudget = percent > 100;

                return (
                  <View
                    key={item.categoryId}
                    style={[
                      styles.categoryItem,
                      index < budgetItems.length - 1 && {
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
                      {isEditing && (
                        <TouchableOpacity
                          onPress={() => handleRemoveCategory(item.categoryId)}
                          style={styles.removeButton}
                        >
                          <Ionicons name="close-circle" size={20} color={theme.colors.expense} />
                        </TouchableOpacity>
                      )}
                    </View>

                    {isEditing ? (
                      <View style={styles.editRow}>
                        <View style={styles.budgetInputContainer}>
                          <Text style={[styles.smallLabel, { color: theme.colors.textSecondary }]}>
                            Target
                          </Text>
                          <View style={styles.smallInputRow}>
                            <Text style={[styles.smallCurrency, { color: theme.colors.text }]}>$</Text>
                            <TextInput
                              style={[
                                styles.smallInput,
                                {
                                  color: theme.colors.text,
                                  borderColor: theme.colors.border,
                                  backgroundColor: theme.isDark
                                    ? 'rgba(255,255,255,0.05)'
                                    : 'rgba(0,0,0,0.05)',
                                },
                              ]}
                              value={item.budgeted > 0 ? item.budgeted.toString() : ''}
                              onChangeText={(value) => handleBudgetChange(item.categoryId, value)}
                              keyboardType="numeric"
                              placeholder="0"
                              placeholderTextColor={theme.colors.placeholder}
                            />
                          </View>
                        </View>
                        <View style={styles.budgetInputContainer}>
                          <Text style={[styles.smallLabel, { color: theme.colors.textSecondary }]}>
                            Actual
                          </Text>
                          <View style={styles.smallInputRow}>
                            <Text style={[styles.smallCurrency, { color: theme.colors.text }]}>$</Text>
                            <TextInput
                              style={[
                                styles.smallInput,
                                {
                                  color: theme.colors.text,
                                  borderColor: theme.colors.border,
                                  backgroundColor: theme.isDark
                                    ? 'rgba(255,255,255,0.05)'
                                    : 'rgba(0,0,0,0.05)',
                                },
                              ]}
                              value={item.actual > 0 ? item.actual.toString() : ''}
                              onChangeText={(value) => handleActualChange(item.categoryId, value)}
                              keyboardType="numeric"
                              placeholder="0"
                              placeholderTextColor={theme.colors.placeholder}
                            />
                          </View>
                        </View>
                      </View>
                    ) : (
                      <>
                        <View style={styles.amountRow}>
                          <Text style={[styles.spentText, { color: theme.colors.text }]}>
                            {formatCurrency(item.actual)}
                            {item.budgeted > 0 && ` / ${formatCurrency(item.budgeted)}`}
                          </Text>
                          <Text
                            style={[
                              styles.percentText,
                              { color: isOverBudget ? theme.colors.expense : theme.colors.textSecondary },
                            ]}
                          >
                            {item.budgeted > 0 ? formatPercent(percent, 0) : '—'}
                          </Text>
                        </View>
                        {item.budgeted > 0 && (
                          <View style={[styles.categoryBar, { backgroundColor: theme.colors.surfaceVariant }]}>
                            <View
                              style={[
                                styles.categoryBarFill,
                                {
                                  backgroundColor: isOverBudget ? theme.colors.expense : category.color,
                                  width: `${Math.min(percent, 100)}%`,
                                },
                              ]}
                            />
                          </View>
                        )}
                      </>
                    )}
                  </View>
                );
              })}

              {isEditing && availableCategories.length > 0 && (
                <TouchableOpacity
                  style={[styles.addMoreButton, { borderColor: theme.colors.border }]}
                  onPress={() => setShowAddCategory(true)}
                >
                  <Ionicons name="add" size={20} color={theme.colors.primary} />
                  <Text style={[styles.addMoreText, { color: theme.colors.primary }]}>
                    Add Category
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </Card>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Income</Text>
            <Text style={[styles.statAmount, { color: theme.colors.income }]}>
              {formatCurrency(monthlySummary.totalIncome)}
            </Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Expenses</Text>
            <Text style={[styles.statAmount, { color: theme.colors.expense }]}>
              {formatCurrency(monthlySummary.totalExpenses)}
            </Text>
          </Card>
        </View>

        {/* Tips */}
        {!isEditing && remaining < 0 && (
          <Card style={[styles.tipCard, { backgroundColor: theme.colors.expense + '20' }]}>
            <Text style={[styles.tipTitle, { color: theme.colors.expense }]}>Over Budget</Text>
            <Text style={[styles.tipText, { color: theme.colors.text }]}>
              You've exceeded your budget by {formatCurrency(Math.abs(remaining))}.
            </Text>
          </Card>
        )}
      </ScrollView>

      {/* Add Category Modal */}
      <Modal visible={showAddCategory} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Add Budget Category
              </Text>
              <TouchableOpacity onPress={() => setShowAddCategory(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.categoryList}>
              {availableCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryOption, { borderBottomColor: theme.colors.border }]}
                  onPress={() => handleAddCategory(cat.id)}
                >
                  <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
                  <Text style={[styles.categoryOptionText, { color: theme.colors.text }]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
              {availableCategories.length === 0 && (
                <Text style={[styles.noCategories, { color: theme.colors.textSecondary }]}>
                  All categories are already in your budget
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </MilitaryBackground>
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
  subtitle: {
    fontSize: typography.fontSize.md,
    marginTop: 4,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  monthlyCard: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    marginBottom: 8,
  },
  budgetInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    marginRight: 8,
  },
  budgetInput: {
    flex: 1,
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: borderRadius.md,
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
  allocationSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  allocationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  allocationLabel: {
    fontSize: typography.fontSize.sm,
  },
  allocationValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  chartCard: {
    marginBottom: 16,
  },
  categoryCard: {
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    marginBottom: 12,
  },
  addCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addCategoryText: {
    marginLeft: 8,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
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
  removeButton: {
    padding: 4,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 16,
  },
  budgetInputContainer: {
    flex: 1,
  },
  smallLabel: {
    fontSize: typography.fontSize.xs,
    marginBottom: 4,
  },
  smallInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallCurrency: {
    fontSize: typography.fontSize.md,
    marginRight: 4,
  },
  smallInput: {
    flex: 1,
    fontSize: typography.fontSize.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  spentText: {
    fontSize: typography.fontSize.sm,
  },
  percentText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  categoryBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 1,
  },
  addMoreText: {
    marginLeft: 8,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    marginBottom: 4,
  },
  statAmount: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  tipCard: {
    marginBottom: 16,
  },
  tipTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: 4,
  },
  tipText: {
    fontSize: typography.fontSize.sm,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '70%',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  categoryList: {
    padding: 8,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  categoryOptionText: {
    fontSize: typography.fontSize.md,
  },
  noCategories: {
    textAlign: 'center',
    padding: 20,
    fontSize: typography.fontSize.md,
  },
});
