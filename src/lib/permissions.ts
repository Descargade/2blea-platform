import type { Role } from "@prisma/client";
import { UnauthorizedError, ForbiddenError } from "./app-error";

export type AuthenticatedUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  image: string | null;
};

export function assertRole(
  user: AuthenticatedUser | null | undefined,
  allowedRoles: Role[]
): asserts user is AuthenticatedUser {
  if (!user) throw new UnauthorizedError();
  if (!allowedRoles.includes(user.role)) throw new ForbiddenError();
}

export function assertAuthenticated(
  user: AuthenticatedUser | null | undefined
): asserts user is AuthenticatedUser {
  if (!user) throw new UnauthorizedError();
}

export const Permissions = {
  isAdmin: (user?: AuthenticatedUser | null): boolean =>
    user?.role === "ADMIN",

  isClient: (user?: AuthenticatedUser | null): boolean =>
    user?.role === "CLIENTE",

  isOwner: (userId: string) => (user?: AuthenticatedUser | null): boolean =>
    user?.id === userId,

  isAdminOrOwner: (userId: string) => (user?: AuthenticatedUser | null): boolean =>
    user?.role === "ADMIN" || user?.id === userId,
};

type PermissionFn = (user?: AuthenticatedUser | null) => boolean;

export function can(
  user: AuthenticatedUser | null | undefined,
  ...permissions: PermissionFn[]
): boolean {
  if (!user) return false;
  return permissions.every((p) => p(user));
}
