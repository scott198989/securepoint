// Budget store using Zustand with persistence

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Budget, SavingsGoal, Debt, DebtPayoffPlan, BudgetCategory } from '../types';
import { generateId } from '../utils';
import { calculateSnowballPayoff, calculateAvalanchePayoff } from '../utils/calculations/budgetMath';
import { storage } from '../utils/storage';

interface BudgetState {
  budgets: Budget[];
  activeBudgetId: string | null;
  savingsGoals: SavingsGoal[];
  debts: Debt[];

  // Budget actions
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  setActiveBudget: (id: string | null) => void;
  getActiveBudget: () => Budget | null;
  updateBudgetCategory: (budgetId: string, categoryId: string, updates: Partial<BudgetCategory>) => void;

  // Savings goal actions
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  contributeToGoal: (id: string, amount: number) => void;
  withdrawFromGoal: (id: string, amount: number) => void;

  // Debt actions
  addDebt: (debt: Omit<Debt, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateDebt: (id: string, updates: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
  makeDebtPayment: (id: string, amount: number) => void;
  getDebtPayoffPlan: (extraPayment: number, strategy: 'snowball' | 'avalanche') => DebtPayoffPlan;

  // Summary getters
  getTotalSavings: () => number;
  getTotalDebt: () => number;
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set, get) => ({
      budgets: [],
      activeBudgetId: null,
      savingsGoals: [],
      debts: [],

      // Budget actions
      addBudget: (budget) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newBudget: Budget = {
          ...budget,
          id,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          budgets: [...state.budgets, newBudget],
          activeBudgetId: state.activeBudgetId || id,
        }));

        return id;
      },

      updateBudget: (id, updates) => {
        set((state) => ({
          budgets: state.budgets.map((b) =>
            b.id === id
              ? { ...b, ...updates, updatedAt: new Date().toISOString() }
              : b
          ),
        }));
      },

      deleteBudget: (id) => {
        set((state) => ({
          budgets: state.budgets.filter((b) => b.id !== id),
          activeBudgetId: state.activeBudgetId === id ? null : state.activeBudgetId,
        }));
      },

      setActiveBudget: (id) => {
        set({ activeBudgetId: id });
      },

      getActiveBudget: () => {
        const { budgets, activeBudgetId } = get();
        return budgets.find((b) => b.id === activeBudgetId) || null;
      },

      updateBudgetCategory: (budgetId, categoryId, updates) => {
        set((state) => ({
          budgets: state.budgets.map((b) => {
            if (b.id !== budgetId) return b;
            return {
              ...b,
              categories: b.categories.map((c) =>
                c.categoryId === categoryId ? { ...c, ...updates } : c
              ),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      // Savings goal actions
      addSavingsGoal: (goal) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newGoal: SavingsGoal = {
          ...goal,
          id,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          savingsGoals: [...state.savingsGoals, newGoal],
        }));

        return id;
      },

      updateSavingsGoal: (id, updates) => {
        set((state) => ({
          savingsGoals: state.savingsGoals.map((g) =>
            g.id === id
              ? { ...g, ...updates, updatedAt: new Date().toISOString() }
              : g
          ),
        }));
      },

      deleteSavingsGoal: (id) => {
        set((state) => ({
          savingsGoals: state.savingsGoals.filter((g) => g.id !== id),
        }));
      },

      contributeToGoal: (id, amount) => {
        set((state) => ({
          savingsGoals: state.savingsGoals.map((g) =>
            g.id === id
              ? {
                  ...g,
                  currentAmount: g.currentAmount + amount,
                  updatedAt: new Date().toISOString(),
                }
              : g
          ),
        }));
      },

      withdrawFromGoal: (id, amount) => {
        set((state) => ({
          savingsGoals: state.savingsGoals.map((g) =>
            g.id === id
              ? {
                  ...g,
                  currentAmount: Math.max(0, g.currentAmount - amount),
                  updatedAt: new Date().toISOString(),
                }
              : g
          ),
        }));
      },

      // Debt actions
      addDebt: (debt) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newDebt: Debt = {
          ...debt,
          id,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          debts: [...state.debts, newDebt],
        }));

        return id;
      },

      updateDebt: (id, updates) => {
        set((state) => ({
          debts: state.debts.map((d) =>
            d.id === id
              ? { ...d, ...updates, updatedAt: new Date().toISOString() }
              : d
          ),
        }));
      },

      deleteDebt: (id) => {
        set((state) => ({
          debts: state.debts.filter((d) => d.id !== id),
        }));
      },

      makeDebtPayment: (id, amount) => {
        set((state) => ({
          debts: state.debts.map((d) =>
            d.id === id
              ? {
                  ...d,
                  currentBalance: Math.max(0, d.currentBalance - amount),
                  updatedAt: new Date().toISOString(),
                }
              : d
          ),
        }));
      },

      getDebtPayoffPlan: (extraPayment, strategy) => {
        const { debts } = get();
        if (strategy === 'snowball') {
          return calculateSnowballPayoff(debts, extraPayment);
        }
        return calculateAvalanchePayoff(debts, extraPayment);
      },

      // Summary getters
      getTotalSavings: () => {
        return get().savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
      },

      getTotalDebt: () => {
        return get().debts.reduce((sum, d) => sum + d.currentBalance, 0);
      },
    }),
    {
      name: 'securepoint-budget',
      storage: createJSONStorage(() => storage),
    }
  )
);
