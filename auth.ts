import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

/**
 * Main Authentication Configuration (Node.js Runtime)
 *
 * This file contains auth logic that requires Node.js APIs:
 * - bcrypt for password hashing
 * - Prisma for database queries
 * - Full credential verification
 *
 * Concepts:
 * - Providers: Different ways users can log in (Google, GitHub, email/password)
 * - Credentials Provider: Traditional username/password login
 * - authorize(): Function that verifies credentials and returns user object
 */

/**
 * Fetch user from database by email
 *
 * @param email - User's email address
 * @returns User object with password or null if not found
 */
async function getUser(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
      },
    });
    return user;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw new Error("Failed to fetch user.");
  }
}

/**
 * NextAuth.js Configuration
 * Exports: auth, signIn, signOut
 */
export const { auth, signIn, signOut } = NextAuth({
  // Spread the edge-compatible config (middleware settings)
  ...authConfig,

  /**
   * Authentication Providers
   * Each provider is a way users can authenticate
   */
  providers: [
    /**
     * Credentials Provider
     * Allows username/password authentication
     *
     * Flow:
     * 1. User submits email + password
     * 2. authorize() validates format with Zod
     * 3. authorize() queries database for user
     * 4. authorize() compares hashed passwords
     * 5. Returns user object (success) or null (failure)
     */
    Credentials({
      async authorize(credentials) {
        // Step 1: Validate input format using Zod
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(6),
          })
          .safeParse(credentials);

        // If validation fails, reject immediately
        if (!parsedCredentials.success) {
          console.log("Invalid credentials format");
          return null;
        }

        const { email, password } = parsedCredentials.data;

        // Step 2: Find user in database
        const user = await getUser(email);
        if (!user) {
          console.log("User not found:", email);
          return null;
        }

        // Step 3: Compare passwords using bcrypt
        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) {
          console.log("Invalid password for user:", email);
          return null;
        }

        // Step 4: Success! Return user (without password)
        console.log("User authenticated successfully:", email);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
});
