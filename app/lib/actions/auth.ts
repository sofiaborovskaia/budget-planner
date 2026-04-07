"use server";

import { signIn, signOut as nextAuthSignOut } from "@/auth";
import { AuthError } from "next-auth";

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
  formData: FormData
): Promise<string | undefined> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/", // Redirect to home/dashboard after successful login
    });
  } catch (error) {
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
