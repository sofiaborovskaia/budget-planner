import { LoginForm } from '@/app/components/auth/LoginForm';
import { Suspense } from 'react';

/**
 * Login Page
 * 
 * This is a Server Component that renders the login page.
 * We wrap LoginForm in Suspense because it may access URL search params
 * (for redirect URLs after login).
 * 
 * Concepts:
 * - Server Components: Render on server (fast, SEO-friendly)
 * - Suspense: Shows fallback while async component loads
 * - Client Components (LoginForm): Interactive, uses hooks
 */

export default function LoginPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-off-white">
      <div className="w-full max-w-md p-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Budget Planner
          </h1>
          <p className="text-grey-600 text-center mb-8">
            Please log in to continue
          </p>
          
          <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
