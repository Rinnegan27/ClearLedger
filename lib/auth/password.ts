import bcrypt from "bcrypt";

/**
 * Hash a password using bcrypt with 12 rounds
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Verify a password against a hashed password
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Validate password strength
 * Returns validation result with score and feedback
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  // Length checks
  if (password.length >= 8) {
    score++;
  } else {
    feedback.push("Use at least 8 characters");
  }

  if (password.length >= 12) {
    score++;
  }

  // Pattern checks
  const patterns = {
    uppercase: /[A-Z]/,
    lowercase: /[a-z]/,
    number: /[0-9]/,
    special: /[^A-Za-z0-9]/,
  };

  if (patterns.uppercase.test(password)) {
    score++;
  } else {
    feedback.push("Add uppercase letters");
  }

  if (patterns.lowercase.test(password)) {
    score++;
  } else {
    feedback.push("Add lowercase letters");
  }

  if (patterns.number.test(password)) {
    score++;
  } else {
    feedback.push("Add numbers");
  }

  if (patterns.special.test(password)) {
    score++;
  } else {
    feedback.push("Add special characters");
  }

  // Check for common passwords
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
