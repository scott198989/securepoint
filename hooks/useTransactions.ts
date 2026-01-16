// Transaction management hook

import { useMemo } from 'react';
import { useTransactionStore } from '../store';
import { Transaction, TransactionFilter, Category, Account } from '../types';
import { startOfMonth, endOfMonth, format } from 'date-fns';

interface UseTransactionsReturn {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  getTransactionById: (id: string) => Transaction | undefined;
  getFilteredTransactions: (filter: TransactionFilter) => Transaction[];
  getCategory: (id: string) => Category | undefined;
  getAccount: (id: string) => Account | undefined;
  addCategory: (category: Omit<Category, 'id'>) => string;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  expenseCategories: Category[];
  incomeCategories: Category[];
}

export function useTransactions(): UseTransactionsReturn {
  const store = useTransactionStore();

  const expenseCategories = useMemo(
    () => store.categories.filter((c) => c.type === 'expense'),
    [store.categories]
  );

  const incomeCategories = useMemo(
    () => store.categories.filter((c) => c.type === 'income'),
    [store.categories]
  );

  const getCategory = (id: string) => store.categories.find((c) => c.id === id);
  const getAccount = (id: string) => store.accounts.find((a) => a.id === id);

  return {
    transactions: store.transactions,
    accounts: store.accounts,
    categories: store.categories,
    addTransaction: store.addTransaction,
    updateTransaction: store.updateTransaction,
    deleteTransaction: store.deleteTransaction,
    getTransactionById: store.getTransactionById,
    getFilteredTransactions: store.getFilteredTransactions,
    getCategory,
    getAccount,
    addCategory: store.addCategory,
    updateCategory: store.updateCategory,
    deleteCategory: store.deleteCategory,
    expenseCategories,
    incomeCategories,
  };
}

// Hook for current month's transactions summary
export function useMonthlyTransactions(date: Date = new Date()) {
  const store = useTransactionStore();

  const summary = useMemo(() => {
    const start = format(startOfMonth(date), 'yyyy-MM-dd');
    const end = format(endOfMonth(date), 'yyyy-MM-dd');
    return store.getTransactionSummary(start, end);
  }, [date, store]);

  return summary;
}

// Hook for recent transactions
export function useRecentTransactions(limit: number = 10) {
  const { transactions } = useTransactionStore();

  return useMemo(
    () => transactions.slice(0, limit),
    [transactions, limit]
  );
}
