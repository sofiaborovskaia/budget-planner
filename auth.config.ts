import type { NextAuthConfig } from "next-auth";

/**
 * Authentication Configuration (Edge-Compatible)
 *
 * This file contains configuration that works in Edge Runtime (Middleware).
 * It cannot use Node.js APIs like bcrypt or database connections.
 *
 * Key Concepts:
 * - pages: Custom auth pages (login, error, etc.)
 * - callbacks.authorized: Runs on EVERY request to check if user can access a route
 * - providers: Empty here, defined in auth.ts (needs Node.js runtime)
 */

export const authConfig = {
  /**
   * Custom auth pages
   * Overrides NextAuth.js default pages with your own
   */
  pages: {
    signIn: "/login", // Redirect here when user isn't authenticated
  },

  /**
   * Callbacks run at different stages of the auth flow
   */
  callbacks: {
    /**
     * Determines if a request is authorized to access a route
     * Runs in Middleware before the route handler
     *
     * @param auth - User session (null if not logged in)
     * @param request.nextUrl - The URL being requested
     * @returns true (allow) or Response.redirect (deny)
     */
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;

      // Protected routes: /profile and /period/*
      const isOnProfile = nextUrl.pathname.startsWith("/profile");
      const isOnPeriod = nextUrl.pathname.startsWith("/period");
      const isProtectedRoute = isOnProfile || isOnPeriod;

      // Protect /profile and /period routes
      if (isProtectedRoute) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login
      }

      // Redirect logged-in users away from login page
      if (isLoggedIn && nextUrl.pathname === "/login") {
        return Response.redirect(new URL("/profile", nextUrl));
      }

      return true; // Allow all other routes
    },
  },

  /**
   * Providers list (OAuth, email, credentials)
   * Empty here because providers need Node.js runtime
   * Actual providers are added in auth.ts
   */
  providers: [],
} satisfies NextAuthConfig;
