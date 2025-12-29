import { z } from "zod";

/**
 * Password validation regex patterns
 */
const passwordPatterns = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  special: /[^A-Za-z0-9]/,
};

/**
 * Sign up form validation schema
 */
export const signUpSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be less than 50 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(passwordPatterns.uppercase, "Must contain at least one uppercase letter")
      .regex(passwordPatterns.lowercase, "Must contain at least one lowercase letter")
      .regex(passwordPatterns.number, "Must contain at least one number")
      .regex(passwordPatterns.special, "Must contain at least one special character"),
    confirmPassword: z.string(),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignUpInput = z.infer<typeof signUpSchema>;

/**
 * Sign in form validation schema
 */
export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type SignInInput = z.infer<typeof signInSchema>;

/**
 * Forgot password form validation schema
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

/**
 * Reset password form validation schema
 */
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(passwordPatterns.uppercase, "Must contain at least one uppercase letter")
      .regex(passwordPatterns.lowercase, "Must contain at least one lowercase letter")
      .regex(passwordPatterns.number, "Must contain at least one number")
      .regex(passwordPatterns.special, "Must contain at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * Password strength calculation
 * Returns a score from 0-4 and feedback messages
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) {
    score++;
  } else {
    feedback.push("Use at least 8 characters");
  }

  if (password.length >= 12) {
    score++;
  }

  // Pattern checks
  if (passwordPatterns.uppercase.test(password)) {
    score++;
  } else {
    feedback.push("Add uppercase letters");
  }

  if (passwordPatterns.lowercase.test(password)) {
    score++;
  } else {
    feedback.push("Add lowercase letters");
  }

  if (passwordPatterns.number.test(password)) {
    score++;
  } else {
    feedback.push("Add numbers");
  }

  if (passwordPatterns.special.test(password)) {
    score++;
  } else {
    feedback.push("Add special characters");
  }

  // Check for common passwords (basic list)
  const commonPasswords = [
    "password",
    "12345678",
    "qwerty",
    "abc123",
    "letmein",
    "welcome",
    "monkey",
    "dragon",
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    score = 0;
    feedback.push("Avoid common passwords");
  }

  // Normalize score to 0-4 range
  const normalizedScore = Math.min(Math.floor(score / 1.5), 4);

  return {
    isValid: normalizedScore >= 3,
    score: normalizedScore,
    feedback,
  };
}

/**
 * Get password strength label
 */
export function getPasswordStrengthLabel(score: number): string {
  switch (score) {
    case 0:
      return "Very Weak";
    case 1:
      return "Weak";
    case 2:
      return "Fair";
    case 3:
      return "Strong";
    case 4:
      return "Very Strong";
    default:
      return "Unknown";
  }
}

/**
 * Get password strength color
 */
export function getPasswordStrengthColor(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return "bg-danger-500";
    case 2:
      return "bg-warning-500";
    case 3:
      return "bg-success-500";
    case 4:
      return "bg-success-600";
    default:
      return "bg-gray-300";
  }
}
