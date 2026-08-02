"use client";

import { useAuth, useUser } from "@clerk/nextjs";

export type UserRole = "member" | "admin" | "super_admin";

function deriveRole(sessionClaims: unknown): UserRole {
  const claims = sessionClaims as { metadata?: { role?: string } } | null | undefined;
  return (claims?.metadata?.role as UserRole) ?? "member";
}

export function useClerkAuth() {
  const { isLoaded, isSignedIn, userId, sessionClaims, getToken } = useAuth();
  const { user } = useUser();

  const role = deriveRole(sessionClaims);

  return {
    isLoaded,
    isSignedIn,
    userId,
    user,
    sessionClaims,
    getToken,
    role,
    isAdmin: role === "admin" || role === "super_admin",
    isSuperAdmin: role === "super_admin",
  };
}

export const useOptionalAuth = useClerkAuth;
