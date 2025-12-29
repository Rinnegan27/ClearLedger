"use client";

import * as React from "react";
import {
  validatePasswordStrength,
  getPasswordStrengthLabel,
  getPasswordStrengthColor,
} from "@/lib/validations/auth";
import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

/**
 * Password strength indicator component
 * Shows a visual bar and label indicating password strength
 */
export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const strength = validatePasswordStrength(password);

  if (!password) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Strength bar */}
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              index <= strength.score
                ? getPasswordStrengthColor(strength.score)
                : "bg-gray-200"
            )}
          />
        ))}
      </div>

      {/* Strength label */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600">
          Password strength:{" "}
          <span
            className={cn(
              "font-medium",
              strength.score <= 1 && "text-danger-600",
              strength.score === 2 && "text-warning-600",
              strength.score >= 3 && "text-success-600"
            )}
          >
            {getPasswordStrengthLabel(strength.score)}
          </span>
        </span>
      </div>

      {/* Feedback messages */}
      {strength.feedback.length > 0 && (
        <ul className="space-y-1 text-xs text-gray-600">
          {strength.feedback.map((message, index) => (
            <li key={index} className="flex items-center gap-1">
              <span className="text-gray-400">•</span>
              {message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
