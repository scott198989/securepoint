// Budget calculation utilities

import { Transaction, Budget, BudgetCategory, Debt, DebtPayoffPlan } from '../../types';
import { addMonths, differenceInMonths } from 'date-fns';

// Calculate total spent in a category for a given period
export function calculateCategorySpent(
  transactions: Transaction[],
  categoryId: string,
  startDate: Date,
  endDate: Date
): number {
  return transactions
    .filter(t => {
      const txDate = new Date(t.date);
      return (
        t.categoryId === categoryId &&
        t.type === 'expense' &&
        txDate >= startDate &&
        txDate <= endDate
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);
}

// Calculate remaining budget for a category
export function calculateRemaining(budgeted: number, spent: number): number {
  return budgeted - spent;
}

// Calculate budget adherence percentage
export function calculateBudgetAdherence(budget: Budget): number {
  if (budget.totalBudgeted === 0) return 100;
  const adherence = ((budget.totalBudgeted - budget.totalSpent) / budget.totalBudgeted) * 100;
  return Math.max(0, Math.min(100, 100 - Math.abs(adherence - 100)));
}

// Calculate savings rate
export function calculateSavingsRate(income: number, expenses: number): number {
  if (income === 0) return 0;
  const savings = income - expenses;
  return (savings / income) * 100;
}

// Calculate net worth from accounts
export function calculateNetWorth(
  accountBalances: { balance: number; type: string; includeInNetWorth: boolean }[]
): number {
  return accountBalances
    .filter(a => a.includeInNetWorth)
    .reduce((sum, account) => {
      // Credit cards are liabilities
      if (account.type === 'credit_card') {
        return sum - Math.abs(account.balance);
      }
      return sum + account.balance;
    }, 0);
}

// Calculate 50/30/20 budget allocations
export function calculate503020(totalIncome: number): {
  needs: number;
  wants: number;
  savings: number;
} {
  return {
    needs: totalIncome * 0.5,
    wants: totalIncome * 0.3,
    savings: totalIncome * 0.2,
  };
}

// Calculate debt payoff with snowball method (smallest balance first)
export function calculateSnowballPayoff(
  debts: Debt[],
  extraPayment: number
): DebtPayoffPlan {
  const sortedDebts = [...debts].sort((a, b) => a.currentBalance - b.currentBalance);
  return calculateDebtPayoff(sortedDebts, extraPayment, 'snowball');
}

// Calculate debt payoff with avalanche method (highest interest first)
export function calculateAvalanchePayoff(
  debts: Debt[],
  extraPayment: number
): DebtPayoffPlan {
  const sortedDebts = [...debts].sort((a, b) => b.interestRate - a.interestRate);
  return calculateDebtPayoff(sortedDebts, extraPayment, 'avalanche');
}

// Core debt payoff calculation
function calculateDebtPayoff(
  sortedDebts: Debt[],
  extraPayment: number,
  strategy: 'snowball' | 'avalanche'
): DebtPayoffPlan {
  const debtResults: DebtPayoffPlan['debts'] = [];
  let totalInterest = 0;
  let maxMonths = 0;
  let availableExtra = extraPayment;

  // Create working copies of debts
  const workingDebts = sortedDebts.map((debt, index) => ({
    ...debt,
    workingBalance: debt.currentBalance,
    monthsToPayoff: 0,
    totalInterest: 0,
    payoffOrder: index + 1,
    isPaidOff: false,
  }));

  // Simulate month by month
  let month = 0;
  const maxIterations = 600; // 50 years max

  while (workingDebts.some(d => !d.isPaidOff) && month < maxIterations) {
    month++;
    let freedUpPayment = 0;

    for (const debt of workingDebts) {
      if (debt.isPaidOff) continue;

      // Calculate interest for this month
      const monthlyInterest = (debt.workingBalance * (debt.interestRate / 100)) / 12;
      debt.totalInterest += monthlyInterest;
      debt.workingBalance += monthlyInterest;

      // Apply minimum payment
      let payment = debt.minimumPayment;

      // Apply extra payment to first unpaid debt in order
      if (
        debt === workingDebts.find(d => !d.isPaidOff) &&
        availableExtra > 0
      ) {
        payment += availableExtra + freedUpPayment;
      }

      // Apply payment
      debt.workingBalance -= payment;

      // Check if paid off
      if (debt.workingBalance <= 0) {
        debt.isPaidOff = true;
        debt.monthsToPayoff = month;
        freedUpPayment += debt.minimumPayment;
        // Any overpayment carries to next debt
        if (debt.workingBalance < 0) {
          freedUpPayment += Math.abs(debt.workingBalance);
        }
        debt.workingBalance = 0;
      }
    }
  }

  // Build results
  const startDate = new Date();
  for (const debt of workingDebts) {
    totalInterest += debt.totalInterest;
    maxMonths = Math.max(maxMonths, debt.monthsToPayoff);

    debtResults.push({
      debtId: debt.id,
      currentBalance: debt.currentBalance,
      payoffOrder: debt.payoffOrder,
      monthsToPayoff: debt.monthsToPayoff,
      totalInterest: debt.totalInterest,
      payoffDate: addMonths(startDate, debt.monthsToPayoff).toISOString(),
    });
  }

  // Calculate interest without extra payment for comparison
  const minPaymentInterest = calculateMinPaymentInterest(sortedDebts);

  return {
    totalDebt: sortedDebts.reduce((sum, d) => sum + d.currentBalance, 0),
    totalMinimumPayments: sortedDebts.reduce((sum, d) => sum + d.minimumPayment, 0),
    extraPayment,
    strategy,
    debts: debtResults,
    debtFreeDate: addMonths(startDate, maxMonths).toISOString(),
    totalInterestSaved: minPaymentInterest - totalInterest,
  };
}

// Calculate total interest with just minimum payments
function calculateMinPaymentInterest(debts: Debt[]): number {
  let totalInterest = 0;

  for (const debt of debts) {
    let balance = debt.currentBalance;
    let month = 0;
    const maxIterations = 600;

    while (balance > 0 && month < maxIterations) {
      month++;
      const monthlyInterest = (balance * (debt.interestRate / 100)) / 12;
      totalInterest += monthlyInterest;
      balance += monthlyInterest - debt.minimumPayment;
    }
  }

  return totalInterest;
}

// Calculate progress towards a savings goal
export function calculateGoalProgress(
  currentAmount: number,
  targetAmount: number
): number {
  if (targetAmount === 0) return 100;
  return Math.min(100, (currentAmount / targetAmount) * 100);
}

// Calculate months until goal is reached
export function calculateMonthsToGoal(
  currentAmount: number,
  targetAmount: number,
  monthlyContribution: number
): number | null {
  if (monthlyContribution <= 0) return null;
  const remaining = targetAmount - currentAmount;
  if (remaining <= 0) return 0;
  return Math.ceil(remaining / monthlyContribution);
}

// Calculate if on track for deadline
export function isOnTrackForGoal(
  currentAmount: number,
  targetAmount: number,
  deadline: Date,
  monthlyContribution: number
): boolean {
  const monthsRemaining = differenceInMonths(deadline, new Date());
  if (monthsRemaining <= 0) return currentAmount >= targetAmount;

  const projectedAmount = currentAmount + monthlyContribution * monthsRemaining;
  return projectedAmount >= targetAmount;
}
