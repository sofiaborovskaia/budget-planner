/**
 * Error handling utilities
 *
 * This module provides type guards and helpers for handling errors
 * in Next.js Server Actions and other server-side code.
 */

/**
 * Type guard to check if an error is a Next.js redirect
 *
 * Next.js uses thrown errors as a control flow mechanism for redirects.
 * When you call `redirect()` or `signIn()` with a redirectTo, Next.js
 * throws an error with a digest starting with "NEXT_REDIRECT".
 *
 * This is NOT an actual error - it's how Next.js implements redirects.
 * You need to re-throw these errors so the redirect happens.
 *
 * @example
 * ```ts
 * try {
 *   await signIn("credentials", { redirectTo: "/" });
 * } catch (error) {
 *   if (isRedirectError(error)) {
 *     throw error; // Let the redirect happen
 *   }
 *   // Handle actual errors
 *   console.error(error);
 * }
 * ```
 *
 * @param error - Unknown error object to check
 * @returns true if error is a Next.js redirect, false otherwise
 */
export function isRedirectError(error: unknown): boolean {
  return (
    error !== null &&
    typeof error === "object" &&
    "digest" in error &&
    typeof error.digest === "string" &&
    error.digest.startsWith("NEXT_REDIRECT")
  );
}
