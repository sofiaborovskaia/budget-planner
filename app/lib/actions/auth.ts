"use server";

import { signIn, signOut as nextAuthSignOut } from "@/auth";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { isRedirectError } from "@/lib/errors";

/**
 * Authenticate user with credentials
 *
 * This Server Action is called from the LoginForm via useActionState.
 *
 * @param prevState - Previous error state (from useActionState, can be ignored)
 * @param formData - Form data with email and password
 * @returns Error message string or undefined on success
 */
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/", // Redirect to home/dashboard after successful login
    });
  } catch (error) {
    // Re-throw redirect errors (successful login)
    if (isRedirectError(error)) {
      throw error;
    }

    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials. Please check your email and password.";
        default:
          return "Something went wrong. Please try again.";
      }
    }

    throw error;
  }
}

export async function signOut() {
  await nextAuthSignOut({ redirectTo: "/" });
}

/**
 * Sign up a new user
 *
 * This Server Action handles user registration.
 *
 * Flow:
 * 1. Validate input (email format, password strength, passwords match)
 * 2. Check if email already exists
 * 3. Hash password with bcrypt
 * 4. Create user in database
 * 5. Auto-login the new user
 * 6. Redirect to dashboard
 *
 * @param prevState - Previous error state (from useActionState)
 * @param formData - Form data with name, email, password, confirmPassword
 * @returns Error message string or undefined on success
 */
export async function signup(
  prevState: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  /**
   * Step 1: Validate Input with Zod
   *
   * Zod checks:
   * - Email is valid format
   * - Password is at least 8 characters
   * - Password contains uppercase, lowercase, number
   * - Passwords match
   */
  const SignupSchema = z
    .object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Invalid email address"),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    });

  const validatedFields = SignupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  // If validation fails, return first error message
  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    return (
      errors.name?.[0] ||
      errors.email?.[0] ||
      errors.password?.[0] ||
      errors.confirmPassword?.[0] ||
      "Invalid input"
    );
  }

  const { name, email, password } = validatedFields.data;

  try {
    /**
     * Step 2: Check if email already exists
     *
     * We do this before hashing to fail fast.
     * Hashing is expensive (~100ms), so don't waste time if email exists.
     */
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return "An account with this email already exists. Try logging in instead.";
    }

    /**
     * Step 3: Hash the password
     *
     * bcrypt.hash(password, rounds)
     * - password: Plain text password
     * - 10: Cost factor (2^10 = 1024 iterations)
     *
     * Higher rounds = more secure but slower
     * 10 is the industry standard balance
     */
    const hashedPassword = await bcrypt.hash(password, 10);

    /**
     * Step 4: Create user in database
     *
     * Store hashed password, never plain text!
     */
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    /**
     * Step 5: Auto-login the new user
     *
     * After successful signup, log them in automatically
     * so they don't have to enter credentials again.
     */
    await signIn("credentials", {
      email,
      password, // Use plain password here (before hashing)
      redirectTo: "/",
    });
  } catch (error) {
    /**
     * Important: Next.js redirects throw errors by design
     *
     * When signIn succeeds and redirects, it throws a NEXT_REDIRECT error.
     * We need to re-throw this so the redirect happens.
     * Only catch actual errors, not successful redirects!
     */
    if (isRedirectError(error)) {
      throw error; // Re-throw redirect (this is success!)
    }

    // Handle actual errors
    if (error instanceof AuthError) {
      return "Failed to sign in after registration. Please try logging in.";
    }

    console.error("Signup error:", error);
    return "Something went wrong. Please try again.";
  }
}
