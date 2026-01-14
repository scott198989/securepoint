// Budget type definitions

export type BudgetPeriod = 'weekly' | 'biweekly' | 'monthly' | 'yearly';

export type BudgetMethod =
  | 'zero_based' // Every dollar has a job
  | 'envelope' // Category-based
  | 'fifty_thirty_twenty' // 50/30/20 rule
  | 'pay_yourself_first'
  | 'custom';

export interface BudgetCategory {
  categoryId: string;
  budgeted: number;
  spent: number;
  remaining: number;
  rollover: boolean; // Unused amount rolls to next period
  rolloverAmount?: number;
}

export interface Budget {
  id: string;
  name: string;
  period: BudgetPeriod;
  method: BudgetMethod;
  startDate: string;
  endDate: string;
  totalBudgeted: number;
  totalSpent: number;
  categories: BudgetCategory[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  icon: string;
  color: string;
  priority: number;
  autoContribute: boolean;
  monthlyContribution?: number;
  linkedAccountId?: string;
  // Military-specific goals
  isMilitaryGoal: boolean;
  militaryGoalType?:
    | 'ets_fund'
    | 'deployment_savings'
    | 'pcs_fund'
    | 'emergency_fund'
    | 'vehicle'
    | 'home_down_payment'
    | 'vacation'
    | 'custom';
  createdAt: string;
  updatedAt: string;
}

export interface Debt {
  id: string;
  name: string;
  type: 'credit_card' | 'auto_loan' | 'student_loan' | 'personal_loan' | 'mortgage' | 'military_star' | 'other';
  originalBalance: number;
  currentBalance: number;
  interestRate: number;
  minimumPayment: number;
  dueDate: number; // Day of month (1-31)
  linkedAccountId?: string;
  payoffStrategy?: 'snowball' | 'avalanche';
  createdAt: string;
  updatedAt: string;
}

export interface DebtPayoffPlan {
  totalDebt: number;
  totalMinimumPayments: number;
  extraPayment: number;
  strategy: 'snowball' | 'avalanche';
  debts: {
    debtId: string;
    currentBalance: number;
    payoffOrder: number;
    monthsToPayoff: number;
    totalInterest: number;
    payoffDate: string;
  }[];
  debtFreeDate: string;
  totalInterestSaved: number;
}

export interface BudgetAlert {
  id: string;
  type: 'overspent' | 'approaching_limit' | 'goal_milestone' | 'bill_due';
  categoryId?: string;
  goalId?: string;
  message: string;
  threshold?: number; // Percentage threshold for approaching_limit
  isRead: boolean;
  createdAt: string;
}

export interface MonthlyReport {
  month: string; // YYYY-MM format
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  budgetAdherence: number; // Percentage
  topCategories: {
    categoryId: string;
    amount: number;
    percentOfTotal: number;
  }[];
  comparisonToPrevious: {
    incomeChange: number;
    expenseChange: number;
    savingsChange: number;
  };
}
