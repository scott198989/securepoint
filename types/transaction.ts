// Transaction type definitions

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  categoryId: string;
  accountId: string;
  date: string; // ISO date string
  createdAt: string;
  updatedAt: string;
  isRecurring: boolean;
  recurringId?: string;
  tags?: string[];
  notes?: string;
  receiptUri?: string;
  // Military-specific
  isTaxDeductible?: boolean;
  militaryIncomeType?: string;
  isReimbursable?: boolean; // For PCS, TDY expenses
}

export type RecurringFrequency =
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'first_and_fifteenth' // Military pay schedule
  | 'quarterly'
  | 'annually';

export interface RecurringTransaction {
  id: string;
  baseTransaction: Omit<Transaction, 'id' | 'date' | 'createdAt' | 'updatedAt'>;
  frequency: RecurringFrequency;
  startDate: string;
  endDate?: string;
  nextOccurrence: string;
  isActive: boolean;
  lastProcessed?: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  isMilitary: boolean; // Military-specific category
  isCustom: boolean;
  parentId?: string; // For subcategories
  budgetAmount?: number;
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit_card' | 'cash' | 'investment' | 'tsp';
  balance: number;
  institution?: string;
  lastFour?: string; // Last 4 digits of account number
  isDefault: boolean;
  color: string;
  includeInNetWorth: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFilter {
  startDate?: string;
  endDate?: string;
  categoryIds?: string[];
  accountIds?: string[];
  type?: TransactionType;
  minAmount?: number;
  maxAmount?: number;
  searchQuery?: string;
  tags?: string[];
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  netFlow: number;
  byCategory: {
    categoryId: string;
    total: number;
    count: number;
  }[];
  byDate: {
    date: string;
    income: number;
    expenses: number;
  }[];
}
