// Re-export all constants

export * from './theme';
export * from './categories';
export * from './militaryData/payTables';
export * from './militaryData/bahRates';

// App-wide constants
export const APP_NAME = '$ecurePoint';
export const APP_VERSION = '1.0.0';

// Subscription pricing
export const SUBSCRIPTION_PRICING = {
  monthly: 9.99,
  yearly: 79.99,
  yearlySavings: 39.89, // (9.99 * 12) - 79.99
};

// Free tier limits
export const FREE_TIER_LIMITS = {
  transactionsPerMonth: 100,
  historyMonths: 3,
  savingsGoals: 1,
};

// Pay period dates (military standard)
export const DEFAULT_PAY_DATES = {
  firstPayday: 1,
  secondPayday: 15,
};

// Date formats
export const DATE_FORMATS = {
  display: 'MMM d, yyyy',
  displayShort: 'MMM d',
  input: 'yyyy-MM-dd',
  monthYear: 'MMMM yyyy',
  time: 'h:mm a',
};

// Currency formatting
export const CURRENCY_CONFIG = {
  locale: 'en-US',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
};
