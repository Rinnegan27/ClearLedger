import { getServerSession } from "next-auth";
import { authOptions } from "./config";

/**
 * Get the current user session
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

/**
 * Require authentication - throws if user is not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

/**
 * Require email verification - throws if email is not verified
 */
export async function requireEmailVerification() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.emailVerified) {
    throw new Error("Email verification required");
  }
  return session.user;
}
