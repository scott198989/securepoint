// Budget management hook

import { useMemo } from 'react';
import { useBudgetStore, useTransactionStore } from '../store';
import { Budget, SavingsGoal, Debt } from '../types';
import { calculateGoalProgress, calculateSavingsRate } from '../utils/calculations/budgetMath';

interface UseBudgetReturn {
  activeBudget: Budget | null;
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  debts: Debt[];
  totalSavings: number;
  totalDebt: number;
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  setActiveBudget: (id: string | null) => void;
}

export function useBudget(): UseBudgetReturn {
  const store = useBudgetStore();

  const activeBudget = useMemo(
    () => store.getActiveBudget(),
    [store.budgets, store.activeBudgetId]
  );

  return {
    activeBudget,
    budgets: store.budgets,
    savingsGoals: store.savingsGoals,
    debts: store.debts,
    totalSavings: store.getTotalSavings(),
    totalDebt: store.getTotalDebt(),
    addBudget: store.addBudget,
    updateBudget: store.updateBudget,
    deleteBudget: store.deleteBudget,
    setActiveBudget: store.setActiveBudget,
  };
}

// Hook for savings goals with progress
export function useSavingsGoals() {
  const { savingsGoals, contributeToGoal, withdrawFromGoal, addSavingsGoal, deleteSavingsGoal } =
    useBudgetStore();

  const goalsWithProgress = useMemo(
    () =>
      savingsGoals.map((goal) => ({
        ...goal,
        progress: calculateGoalProgress(goal.currentAmount, goal.targetAmount),
      })),
    [savingsGoals]
  );

  return {
    goals: goalsWithProgress,
    addGoal: addSavingsGoal,
    deleteGoal: deleteSavingsGoal,
    contribute: contributeToGoal,
    withdraw: withdrawFromGoal,
  };
}

// Hook for debt management
export function useDebts() {
  const { debts, addDebt, updateDebt, deleteDebt, makeDebtPayment, getDebtPayoffPlan } =
    useBudgetStore();

  const totalDebt = useMemo(
    () => debts.reduce((sum, d) => sum + d.currentBalance, 0),
    [debts]
  );

  const totalMinPayments = useMemo(
    () => debts.reduce((sum, d) => sum + d.minimumPayment, 0),
    [debts]
  );

  return {
    debts,
    totalDebt,
    totalMinPayments,
    addDebt,
    updateDebt,
    deleteDebt,
    makePayment: makeDebtPayment,
    getPayoffPlan: getDebtPayoffPlan,
  };
}

// Hook for financial overview
export function useFinancialOverview() {
  const { getTotalBalance } = useTransactionStore();
  const { getTotalSavings, getTotalDebt } = useBudgetStore();

  return useMemo(
    () => ({
      totalBalance: getTotalBalance(),
      totalSavings: getTotalSavings(),
      totalDebt: getTotalDebt(),
      netWorth: getTotalBalance() + getTotalSavings() - getTotalDebt(),
    }),
    [getTotalBalance, getTotalSavings, getTotalDebt]
  );
}
