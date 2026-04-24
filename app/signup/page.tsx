import { SignUpForm } from "@/app/components/auth/SignUpForm";
import { Suspense } from "react";

/**
 * Sign Up Page
 *
 * This is a Server Component that renders the registration page.
 * Similar to login page, we wrap SignUpForm in Suspense for proper
 * async handling (though not strictly needed here).
 *
 * Concepts:
 * - Server Components: Render on server (fast, SEO-friendly)
 * - Suspense: Shows fallback while async component loads
 * - Client Components (SignUpForm): Interactive, uses hooks
 *
 * Security Note:
 * - All validation happens server-side in the signup Server Action
 * - Password is hashed before storing (never stored plain text)
 * - User is auto-logged in after successful signup
 */

export default function SignUpPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-off-white">
      <div className="w-full max-w-md p-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-2 text-center">
            Join Budget Planner
          </h1>
          <p className="text-grey-600 text-center mb-8">
            Create your account to start managing your finances
          </p>

          <Suspense fallback={<div>Loading...</div>}>
            <SignUpForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
