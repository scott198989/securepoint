// Validation utilities and Zod schemas

import { z } from 'zod';

// Email validation
export const emailSchema = z.string().email('Please enter a valid email address');

// Password validation (minimum 8 chars, at least one number and one letter)
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Za-z]/, 'Password must contain at least one letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// Amount validation (positive number)
export const amountSchema = z
  .number()
  .positive('Amount must be greater than 0')
  .max(999999999, 'Amount is too large');

// Transaction form schema
export const transactionSchema = z.object({
  type: z.enum(['income', 'expense', 'transfer']),
  amount: amountSchema,
  description: z.string().min(1, 'Description is required').max(200),
  categoryId: z.string().min(1, 'Category is required'),
  accountId: z.string().min(1, 'Account is required'),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().max(500).optional(),
  isRecurring: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

// Budget form schema
export const budgetSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  period: z.enum(['weekly', 'biweekly', 'monthly', 'yearly']),
  method: z.enum(['zero_based', 'envelope', 'fifty_thirty_twenty', 'pay_yourself_first', 'custom']),
  categories: z.array(z.object({
    categoryId: z.string(),
    budgeted: z.number().min(0),
  })),
});

// Savings goal schema
export const savingsGoalSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  targetAmount: amountSchema,
  deadline: z.string().optional(),
  monthlyContribution: z.number().min(0).optional(),
});

// Account form schema
export const accountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: z.enum(['checking', 'savings', 'credit_card', 'cash', 'investment', 'tsp']),
  balance: z.number(),
  institution: z.string().max(100).optional(),
  lastFour: z.string().max(4).optional(),
});

// User profile schema
export const userProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  militaryProfile: z.object({
    status: z.enum(['active_duty', 'national_guard', 'reserve', 'veteran', 'retired', 'family_member', 'civilian']),
    branch: z.enum(['army', 'navy', 'air_force', 'marine_corps', 'coast_guard', 'space_force']).optional(),
    payGrade: z.string().optional(),
    yearsOfService: z.number().min(0).max(50).optional(),
    bahLocation: z.string().optional(),
    vaDisabilityRating: z.number().min(0).max(100).optional(),
    etsDate: z.string().optional(),
  }),
});

// Validation helper functions
export function isValidEmail(email: string): boolean {
  return emailSchema.safeParse(email).success;
}

export function isValidPassword(password: string): boolean {
  return passwordSchema.safeParse(password).success;
}

export function isValidAmount(amount: number): boolean {
  return amountSchema.safeParse(amount).success;
}

// Get validation error message
export function getValidationError<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): string | null {
  const result = schema.safeParse(data);
  if (result.success) return null;
  return result.error.issues[0]?.message || 'Validation failed';
}

// Sanitize input (remove potentially harmful characters)
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

// Validate zip code (US format)
export function isValidZipCode(zip: string): boolean {
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zip);
}
