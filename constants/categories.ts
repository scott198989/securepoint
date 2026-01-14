// Default expense and income categories

import { Category } from '../types';

// Default expense categories
export const DEFAULT_EXPENSE_CATEGORIES: Omit<Category, 'id'>[] = [
  // Essential Living
  { name: 'Housing', type: 'expense', icon: 'home', color: '#2e7d32', isMilitary: false, isCustom: false },
  { name: 'Utilities', type: 'expense', icon: 'flash', color: '#ff9800', isMilitary: false, isCustom: false },
  { name: 'Groceries', type: 'expense', icon: 'cart', color: '#4caf50', isMilitary: false, isCustom: false },
  { name: 'Transportation', type: 'expense', icon: 'car', color: '#1976d2', isMilitary: false, isCustom: false },
  { name: 'Gas/Fuel', type: 'expense', icon: 'speedometer', color: '#795548', isMilitary: false, isCustom: false },
  // Healthcare
  { name: 'Healthcare', type: 'expense', icon: 'medkit', color: '#e91e63', isMilitary: false, isCustom: false },
  { name: 'TRICARE', type: 'expense', icon: 'medical', color: '#9c27b0', isMilitary: true, isCustom: false },
  { name: 'VA Copays', type: 'expense', icon: 'medical', color: '#673ab7', isMilitary: true, isCustom: false },
  // Insurance
  { name: 'Insurance', type: 'expense', icon: 'shield-checkmark', color: '#3f51b5', isMilitary: false, isCustom: false },
  { name: 'SGLI/VGLI', type: 'expense', icon: 'shield', color: '#00695c', isMilitary: true, isCustom: false },
  // Military-Specific
  { name: 'TSP Traditional', type: 'expense', icon: 'trending-up', color: '#2e7d32', isMilitary: true, isCustom: false },
  { name: 'TSP Roth', type: 'expense', icon: 'trending-up', color: '#388e3c', isMilitary: true, isCustom: false },
  { name: 'Uniform/Gear', type: 'expense', icon: 'shirt', color: '#455a64', isMilitary: true, isCustom: false },
  { name: 'Mess/Dining Facility', type: 'expense', icon: 'restaurant', color: '#8d6e63', isMilitary: true, isCustom: false },
  { name: 'PCS Expenses', type: 'expense', icon: 'airplane', color: '#0097a7', isMilitary: true, isCustom: false },
  { name: 'Allotments', type: 'expense', icon: 'swap-horizontal', color: '#607d8b', isMilitary: true, isCustom: false },
  { name: 'Military Star Card', type: 'expense', icon: 'card', color: '#37474f', isMilitary: true, isCustom: false },
  // Lifestyle
  { name: 'Dining Out', type: 'expense', icon: 'restaurant', color: '#ff5722', isMilitary: false, isCustom: false },
  { name: 'Entertainment', type: 'expense', icon: 'game-controller', color: '#9c27b0', isMilitary: false, isCustom: false },
  { name: 'Shopping', type: 'expense', icon: 'bag', color: '#f06292', isMilitary: false, isCustom: false },
  { name: 'Subscriptions', type: 'expense', icon: 'repeat', color: '#7e57c2', isMilitary: false, isCustom: false },
  // Financial
  { name: 'Debt Payment', type: 'expense', icon: 'card', color: '#c62828', isMilitary: false, isCustom: false },
  { name: 'Savings Transfer', type: 'expense', icon: 'wallet', color: '#1565c0', isMilitary: false, isCustom: false },
  { name: 'Investments', type: 'expense', icon: 'trending-up', color: '#00838f', isMilitary: false, isCustom: false },
  // Personal
  { name: 'Personal Care', type: 'expense', icon: 'person', color: '#ec407a', isMilitary: false, isCustom: false },
  { name: 'Education', type: 'expense', icon: 'school', color: '#5c6bc0', isMilitary: false, isCustom: false },
  { name: 'Fitness', type: 'expense', icon: 'fitness', color: '#26a69a', isMilitary: false, isCustom: false },
  { name: 'Pets', type: 'expense', icon: 'paw', color: '#8d6e63', isMilitary: false, isCustom: false },
  { name: 'Gifts/Donations', type: 'expense', icon: 'gift', color: '#ab47bc', isMilitary: false, isCustom: false },
  // Other
  { name: 'Childcare', type: 'expense', icon: 'people', color: '#42a5f5', isMilitary: false, isCustom: false },
  { name: 'Phone/Internet', type: 'expense', icon: 'phone-portrait', color: '#26c6da', isMilitary: false, isCustom: false },
  { name: 'Other Expense', type: 'expense', icon: 'ellipsis-horizontal', color: '#78909c', isMilitary: false, isCustom: false },
];

// Default income categories
export const DEFAULT_INCOME_CATEGORIES: Omit<Category, 'id'>[] = [
  // Military Income
  { name: 'Base Pay', type: 'income', icon: 'cash', color: '#2e7d32', isMilitary: true, isCustom: false },
  { name: 'BAH', type: 'income', icon: 'home', color: '#43a047', isMilitary: true, isCustom: false },
  { name: 'BAS', type: 'income', icon: 'restaurant', color: '#66bb6a', isMilitary: true, isCustom: false },
  { name: 'OHA', type: 'income', icon: 'home', color: '#81c784', isMilitary: true, isCustom: false },
  { name: 'COLA', type: 'income', icon: 'trending-up', color: '#a5d6a7', isMilitary: true, isCustom: false },
  { name: 'Special Pay', type: 'income', icon: 'star', color: '#1976d2', isMilitary: true, isCustom: false },
  { name: 'Hazard Pay', type: 'income', icon: 'warning', color: '#f57c00', isMilitary: true, isCustom: false },
  { name: 'Flight Pay', type: 'income', icon: 'airplane', color: '#42a5f5', isMilitary: true, isCustom: false },
  { name: 'Sea Pay', type: 'income', icon: 'boat', color: '#0288d1', isMilitary: true, isCustom: false },
  { name: 'Jump Pay', type: 'income', icon: 'trending-down', color: '#7b1fa2', isMilitary: true, isCustom: false },
  { name: 'Hostile Fire Pay', type: 'income', icon: 'flame', color: '#d32f2f', isMilitary: true, isCustom: false },
  { name: 'Drill Pay', type: 'income', icon: 'calendar', color: '#5e35b1', isMilitary: true, isCustom: false },
  { name: 'Family Separation', type: 'income', icon: 'people', color: '#00897b', isMilitary: true, isCustom: false },
  // Veteran Income
  { name: 'VA Disability', type: 'income', icon: 'shield-checkmark', color: '#2e7d32', isMilitary: true, isCustom: false },
  { name: 'Military Retirement', type: 'income', icon: 'ribbon', color: '#1565c0', isMilitary: true, isCustom: false },
  { name: 'GI Bill MHA', type: 'income', icon: 'school', color: '#6a1b9a', isMilitary: true, isCustom: false },
  // Civilian Income
  { name: 'Salary', type: 'income', icon: 'briefcase', color: '#37474f', isMilitary: false, isCustom: false },
  { name: 'Hourly Wages', type: 'income', icon: 'time', color: '#455a64', isMilitary: false, isCustom: false },
  { name: 'Bonus', type: 'income', icon: 'gift', color: '#7cb342', isMilitary: false, isCustom: false },
  { name: 'Side Income', type: 'income', icon: 'rocket', color: '#ff7043', isMilitary: false, isCustom: false },
  { name: 'Investments', type: 'income', icon: 'trending-up', color: '#00acc1', isMilitary: false, isCustom: false },
  { name: 'Refund/Rebate', type: 'income', icon: 'return-down-back', color: '#9ccc65', isMilitary: false, isCustom: false },
  { name: 'Other Income', type: 'income', icon: 'ellipsis-horizontal', color: '#78909c', isMilitary: false, isCustom: false },
];

// Tax-free income category names for easy reference
export const TAX_FREE_INCOME_NAMES = [
  'BAH',
  'BAS',
  'OHA',
  'COLA',
  'Hostile Fire Pay',
  'Family Separation',
  'VA Disability',
];

// Tax-deductible expense category names
export const TAX_DEDUCTIBLE_EXPENSE_NAMES = [
  'Uniform/Gear',
];

// Military goal templates
export const MILITARY_GOAL_TEMPLATES = [
  { name: 'ETS Fund', icon: 'flag', color: '#2e7d32', type: 'ets_fund' as const },
  { name: 'Deployment Savings', icon: 'airplane', color: '#1976d2', type: 'deployment_savings' as const },
  { name: 'PCS Fund', icon: 'car', color: '#7b1fa2', type: 'pcs_fund' as const },
  { name: 'Emergency Fund', icon: 'shield', color: '#f57c00', type: 'emergency_fund' as const },
  { name: 'Vehicle Fund', icon: 'car-sport', color: '#00838f', type: 'vehicle' as const },
  { name: 'Home Down Payment', icon: 'home', color: '#558b2f', type: 'home_down_payment' as const },
  { name: 'Vacation Fund', icon: 'sunny', color: '#ff5722', type: 'vacation' as const },
];
