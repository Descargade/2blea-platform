import { auth } from "@/lib/auth";
import type { AuthenticatedUser } from "@/lib/permissions";
import { assertRole, assertAuthenticated } from "@/lib/permissions";
import type { Role } from "@prisma/client";
import { UnauthorizedError, ForbiddenError } from "./app-error";

export async function requireAuth(): Promise<AuthenticatedUser> {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError();
  return session.user;
}

export async function requireRole(roles: Role[]): Promise<AuthenticatedUser> {
  const user = await requireAuth();
  if (!roles.includes(user.role)) throw new ForbiddenError();
  return user;
}

export async function requireAdmin(): Promise<AuthenticatedUser> {
  return requireRole(["ADMIN"]);
}

export async function requireClient(): Promise<AuthenticatedUser> {
  return requireRole(["CLIENTE"]);
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const session = await auth();
  return session?.user ?? null;
}
