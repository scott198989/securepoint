// Transaction store using Zustand with persistence

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Transaction,
  Account,
  Category,
  RecurringTransaction,
  TransactionFilter,
  TransactionSummary,
} from '../types';
import { generateId, sortByDate, groupBy } from '../utils';
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '../constants/categories';

interface TransactionState {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  recurringTransactions: RecurringTransaction[];

  // Transaction actions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  getTransactionById: (id: string) => Transaction | undefined;
  getFilteredTransactions: (filter: TransactionFilter) => Transaction[];
  getTransactionSummary: (startDate: string, endDate: string) => TransactionSummary;

  // Account actions
  addAccount: (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  updateAccountBalance: (id: string, amount: number, isAddition: boolean) => void;

  // Category actions
  addCategory: (category: Omit<Category, 'id'>) => string;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Recurring transaction actions
  addRecurringTransaction: (recurring: Omit<RecurringTransaction, 'id'>) => string;
  updateRecurringTransaction: (id: string, updates: Partial<RecurringTransaction>) => void;
  deleteRecurringTransaction: (id: string) => void;

  // Utility
  initializeCategories: () => void;
  getTotalBalance: () => number;
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: [],
      accounts: [],
      categories: [],
      recurringTransactions: [],

      // Transaction actions
      addTransaction: (transaction) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newTransaction: Transaction = {
          ...transaction,
          id,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
        }));

        // Update account balance
        const { updateAccountBalance } = get();
        if (transaction.type === 'income') {
          updateAccountBalance(transaction.accountId, transaction.amount, true);
        } else if (transaction.type === 'expense') {
          updateAccountBalance(transaction.accountId, transaction.amount, false);
        }

        return id;
      },

      updateTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id
              ? { ...t, ...updates, updatedAt: new Date().toISOString() }
              : t
          ),
        }));
      },

      deleteTransaction: (id) => {
        const { transactions, updateAccountBalance } = get();
        const transaction = transactions.find((t) => t.id === id);

        if (transaction) {
          // Reverse the account balance change
          if (transaction.type === 'income') {
            updateAccountBalance(transaction.accountId, transaction.amount, false);
          } else if (transaction.type === 'expense') {
            updateAccountBalance(transaction.accountId, transaction.amount, true);
          }
        }

        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
      },

      getTransactionById: (id) => {
        return get().transactions.find((t) => t.id === id);
      },

      getFilteredTransactions: (filter) => {
        let filtered = [...get().transactions];

        if (filter.startDate) {
          filtered = filtered.filter((t) => t.date >= filter.startDate!);
        }
        if (filter.endDate) {
          filtered = filtered.filter((t) => t.date <= filter.endDate!);
        }
        if (filter.categoryIds?.length) {
          filtered = filtered.filter((t) => filter.categoryIds!.includes(t.categoryId));
        }
        if (filter.accountIds?.length) {
          filtered = filtered.filter((t) => filter.accountIds!.includes(t.accountId));
        }
        if (filter.type) {
          filtered = filtered.filter((t) => t.type === filter.type);
        }
        if (filter.minAmount !== undefined) {
          filtered = filtered.filter((t) => t.amount >= filter.minAmount!);
        }
        if (filter.maxAmount !== undefined) {
          filtered = filtered.filter((t) => t.amount <= filter.maxAmount!);
        }
        if (filter.searchQuery) {
          const query = filter.searchQuery.toLowerCase();
          filtered = filtered.filter(
            (t) =>
              t.description.toLowerCase().includes(query) ||
              t.notes?.toLowerCase().includes(query)
          );
        }

        return sortByDate(filtered);
      },

      getTransactionSummary: (startDate, endDate) => {
        const filtered = get().getFilteredTransactions({ startDate, endDate });

        const totalIncome = filtered
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = filtered
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        const byCategory = Object.entries(
          groupBy(filtered, (t) => t.categoryId)
        ).map(([categoryId, txs]) => ({
          categoryId,
          total: txs.reduce((sum, t) => sum + t.amount, 0),
          count: txs.length,
        }));

        const byDate = Object.entries(groupBy(filtered, (t) => t.date.split('T')[0])).map(
          ([date, txs]) => ({
            date,
            income: txs
              .filter((t) => t.type === 'income')
              .reduce((sum, t) => sum + t.amount, 0),
            expenses: txs
              .filter((t) => t.type === 'expense')
              .reduce((sum, t) => sum + t.amount, 0),
          })
        );

        return {
          totalIncome,
          totalExpenses,
          netFlow: totalIncome - totalExpenses,
          byCategory,
          byDate,
        };
      },

      // Account actions
      addAccount: (account) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newAccount: Account = {
          ...account,
          id,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          accounts: [...state.accounts, newAccount],
        }));

        return id;
      },

      updateAccount: (id, updates) => {
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.id === id
              ? { ...a, ...updates, updatedAt: new Date().toISOString() }
              : a
          ),
        }));
      },

      deleteAccount: (id) => {
        set((state) => ({
          accounts: state.accounts.filter((a) => a.id !== id),
        }));
      },

      updateAccountBalance: (id, amount, isAddition) => {
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.id === id
              ? {
                  ...a,
                  balance: isAddition ? a.balance + amount : a.balance - amount,
                  updatedAt: new Date().toISOString(),
                }
              : a
          ),
        }));
      },

      // Category actions
      addCategory: (category) => {
        const id = generateId();
        const newCategory: Category = { ...category, id };

        set((state) => ({
          categories: [...state.categories, newCategory],
        }));

        return id;
      },

      updateCategory: (id, updates) => {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }));
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }));
      },

      // Recurring transaction actions
      addRecurringTransaction: (recurring) => {
        const id = generateId();
        const newRecurring: RecurringTransaction = { ...recurring, id };

        set((state) => ({
          recurringTransactions: [...state.recurringTransactions, newRecurring],
        }));

        return id;
      },

      updateRecurringTransaction: (id, updates) => {
        set((state) => ({
          recurringTransactions: state.recurringTransactions.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        }));
      },

      deleteRecurringTransaction: (id) => {
        set((state) => ({
          recurringTransactions: state.recurringTransactions.filter((r) => r.id !== id),
        }));
      },

      // Initialize default categories
      initializeCategories: () => {
        const { categories } = get();
        if (categories.length > 0) return;

        const allCategories: Category[] = [
          ...DEFAULT_EXPENSE_CATEGORIES.map((c, i) => ({ ...c, id: `exp-${i}` })),
          ...DEFAULT_INCOME_CATEGORIES.map((c, i) => ({ ...c, id: `inc-${i}` })),
        ];

        set({ categories: allCategories });
      },

      getTotalBalance: () => {
        return get().accounts.reduce((sum, account) => {
          if (account.type === 'credit_card') {
            return sum - Math.abs(account.balance);
          }
          return sum + account.balance;
        }, 0);
      },
    }),
    {
      name: 'securepoint-transactions',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
