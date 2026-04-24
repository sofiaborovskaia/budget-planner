"use client";

import { useActionState, useState } from "react";
import { signup } from "@/app/lib/actions/auth";
import { Button } from "@/app/components/ui/Button";
import { PasswordInput } from "@/app/components/auth/PasswordInput";
import Link from "next/link";

/**
 * Sign Up Form Component (Client Component)
 *
 * This form handles user registration using Server Actions.
 *
 * Key Features:
 * - Name, email, and password inputs
 * - Password confirmation
 * - Real-time validation feedback
 * - Password strength requirements displayed
 * - Auto-login after successful signup
 *
 * Flow:
 * 1. User fills out registration form
 * 2. Form submits to signup Server Action
 * 3. Server validates, hashes password, creates user
 * 4. If successful: Auto-login and redirect to dashboard
 * 5. If failed: Returns error message, displays to user
 *
 * @returns Sign up form UI
 */

export function SignUpForm() {
  /**
   * useActionState manages form state for Server Actions
   *
   * Returns:
   * - errorMessage: Error from last submission (or undefined)
   * - formAction: Enhanced action with pending state
   * - isPending: Boolean - is form currently submitting?
   */
  const [errorMessage, formAction, isPending] = useActionState(
    signup,
    undefined,
  );

  /**
   * Local state for password matching
   *
   * We track both passwords client-side to show real-time
   * match indicator without waiting for server validation
   */
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <form action={formAction} className="space-y-4">
      {/* Name Field */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-grey-900 mb-2"
        >
          Name
        </label>
        <input
          id="name"
          type="text"
          name="name"
          placeholder="Your name"
          required
          className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink"
        />
      </div>

      {/* Email Field */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-grey-900 mb-2"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="your@email.com"
          required
          className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink"
        />
      </div>

      {/* Password Field with Real-Time Validation */}
      <PasswordInput
        id="password"
        name="password"
        label="Password"
        placeholder="Create a password"
        showValidation={true}
        onPasswordChange={setPassword}
      />

      {/* Confirm Password Field with Match Indicator */}
      <PasswordInput
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm Password"
        placeholder="Confirm your password"
        confirmPassword={password}
        onPasswordChange={setConfirmPassword}
      />

      {/* Error Message Display */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{errorMessage}</p>
        </div>
      )}

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating account..." : "Create account"}
      </Button>

      {/* Link to Login */}
      <p className="text-center text-sm text-grey-600">
        Already have an account?{" "}
        <Link href="/login" className="text-pink font-medium hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
