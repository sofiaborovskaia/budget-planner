import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

/**
 * Next.js Middleware for Authentication
 *
 * Middleware runs on EVERY request BEFORE the route handler.
 * It's perfect for authentication because it:
 * - Runs in Edge Runtime (fast!)
 * - Can redirect users before rendering
 * - Protects routes at the infrastructure level
 *
 * Flow:
 * 1. User requests /dashboard
 * 2. Middleware runs (this file)
 * 3. authConfig.callbacks.authorized() checks if user is logged in
 * 4. If yes: Continue to /dashboard
 * 5. If no: Redirect to /login
 *
 * This means protected routes NEVER even start rendering for unauthorized users.
 * Much more secure and performant than client-side checks!
 */

export default NextAuth(authConfig).auth;

/**
 * Middleware Configuration
 *
 * matcher: Which routes should this middleware run on?
 * This regex says: "Run on ALL routes EXCEPT:
 * - /api routes
 * - /_next/static (Next.js static files)
 * - /_next/image (Next.js image optimization)
 * - Files ending in .png"
 *
 * Why exclude these? They don't need auth protection and excluding
 * them makes the app faster.
 */
export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
