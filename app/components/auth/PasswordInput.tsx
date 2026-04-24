"use client";

import { useState } from "react";
import { Check, X, CheckCircle2, XCircle } from "lucide-react";

/**
 * Password Validation Rules
 *
 * Each rule has:
 * - label: Human-readable description
 * - test: Function that returns true if password passes
 * - id: Unique identifier for React keys
 */
const PASSWORD_RULES = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (password: string) => password.length >= 8,
  },
  {
    id: "uppercase",
    label: "One uppercase letter (A-Z)",
    test: (password: string) => /[A-Z]/.test(password),
  },
  {
    id: "lowercase",
    label: "One lowercase letter (a-z)",
    test: (password: string) => /[a-z]/.test(password),
  },
  {
    id: "number",
    label: "One number (0-9)",
    test: (password: string) => /[0-9]/.test(password),
  },
];

interface PasswordInputProps {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  showValidation?: boolean;
  confirmPassword?: string;
  onPasswordChange?: (password: string) => void;
}

/**
 * Password Input with Real-Time Validation
 *
 * A reusable password input component that shows:
 * - Which requirements are met (✓ green) or not met (✗ red)
 * - Real-time feedback as user types
 * - Password strength indicator
 *
 *
 * @param showValidation - Show the validation rules checklist
 * @param confirmPassword - If provided, show match indicator
 * @param onPasswordChange - Callback when password changes (for parent state)
 */
export function PasswordInput({
  id,
  name,
  label,
  placeholder,
  showValidation = false,
  confirmPassword,
  onPasswordChange,
}: PasswordInputProps) {
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    onPasswordChange?.(value);
  };

  const handleBlur = () => {
    setTouched(true);
  };

  // Check if password matches confirm password
  const passwordsMatch =
    confirmPassword !== undefined &&
    password.length > 0 &&
    password === confirmPassword;

  const passwordsDontMatch =
    confirmPassword !== undefined &&
    touched &&
    password.length > 0 &&
    password !== confirmPassword;

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-grey-900 mb-2"
      >
        {label}
      </label>
      <input
        id={id}
        type="password"
        name={name}
        placeholder={placeholder}
        required
        minLength={8}
        value={password}
        onChange={handleChange}
        onBlur={handleBlur}
        className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink"
      />

      {/* Validation Rules Checklist */}
      {showValidation && password.length > 0 && (
        <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
          <p className="text-xs font-medium text-gray-700 mb-2">
            Password requirements:
          </p>
          <ul className="space-y-1">
            {PASSWORD_RULES.map((rule) => {
              const isValid = rule.test(password);
              return (
                <li key={rule.id} className="flex items-center gap-2 text-xs">
                  {isValid ? (
                    <Check
                      className="w-4 h-4 text-green-700 flex-shrink-0"
                      strokeWidth={1}
                    />
                  ) : (
                    <X
                      className="w-4 h-4 text-red-500 flex-shrink-0"
                      strokeWidth={1}
                    />
                  )}
                  <span className={isValid ? "text-green-700" : "text-red-600"}>
                    {rule.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Password Match Indicator */}
      {passwordsMatch && (
        <div className="mt-2 flex items-center gap-1 text-sm text-green-700">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" strokeWidth={1} />
          <span>Passwords match</span>
        </div>
      )}

      {/* Password Mismatch Warning */}
      {passwordsDontMatch && (
        <div className="mt-2 flex items-center gap-1 text-sm text-red-600">
          <XCircle className="w-5 h-5 flex-shrink-0" strokeWidth={1} />
          <span>Passwords don't match</span>
        </div>
      )}
    </div>
  );
}

/**
 * Helper function to validate password meets all requirements
 *
 * Exported for use in Server Actions or other components
 *
 * @param password - Password string to validate
 * @returns true if all rules pass, false otherwise
 */
export function isPasswordValid(password: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}
