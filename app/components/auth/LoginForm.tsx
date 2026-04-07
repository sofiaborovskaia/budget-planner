"use client";

import { useActionState } from "react";
import { authenticate } from "@/app/lib/actions/auth";
import { Button } from "@/app/components/ui/Button";

/**
 * Login Form Component (Client Component)
 *
 * This form handles user authentication using Server Actions.
 *
 * Key Concepts:
 * - useActionState: React hook for Server Actions with form state
 * - Progressive Enhancement: Works without JavaScript (form POST)
 * - Server Actions: Functions that run on server, called from client
 *
 * Flow:
 * 1. User enters email + password
 * 2. Form submits to authenticate Server Action
 * 3. Server Action calls NextAuth signIn()
 * 4. If successful: Redirects to dashboard
 * 5. If failed: Returns error message, displays to user
 *
 * @returns Login form UI
 */

export function LoginForm() {
  /**
   * useActionState manages form state for Server Actions
   *
   * Parameters:
   * - authenticate: Server Action function
   * - undefined: Initial state (no error yet)
   *
   * Returns:
   * - errorMessage: Error from last submission (or undefined)
   * - formAction: Enhanced action with pending state
   * - isPending: Boolean - is form currently submitting?
   */
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-4">
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

      {/* Password Field */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-grey-900 mb-2"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          name="password"
          placeholder="Enter your password"
          required
          minLength={6}
          className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink"
        />
      </div>

      {/* Error Message Display */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{errorMessage}</p>
        </div>
      )}

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Logging in..." : "Log in"}
      </Button>

      {/* Temporary password hint */}
      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
        <p className="text-xs text-green-700">
          <strong>First time?</strong> Use password: <code>changeme123</code>
        </p>
      </div>
    </form>
  );
}
