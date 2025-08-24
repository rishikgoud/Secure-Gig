import { z } from 'zod';

/**
 * Frontend validation schemas for authentication forms
 * These schemas match the backend User model validation exactly
 */

// Login form validation schema
export const loginSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(1, 'Password is required')
});

// Signup form validation schema - matches backend exactly
export const signupSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name cannot exceed 50 characters')
    .trim(),
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  phone: z.string()
    .regex(/^\+?[\d\s-()]+$/, 'Please enter a valid phone number')
    .min(1, 'Phone number cannot be empty')
    .optional()
    .or(z.literal('')),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmPassword: z.string()
    .min(1, 'Please confirm your password'),
  role: z.enum(['client', 'freelancer'], {
    required_error: 'Please select your role',
    invalid_type_error: 'Role must be either client or freelancer'
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Type exports for TypeScript
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;

// API request types (without confirmPassword for signup)
export type LoginRequest = LoginFormData;
export type SignupRequest = Omit<SignupFormData, 'confirmPassword'>;
