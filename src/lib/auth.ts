import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authLogger } from "./logger";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
      image: string | null;
    };
  }
  interface User {
    role: Role;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          authLogger.warn("Intento de login sin credenciales");
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || user.deletedAt) {
          authLogger.warn({ email }, "Login fallido: usuario no encontrado o eliminado");
          return null;
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          authLogger.warn({ email }, "Login fallido: contraseña incorrecta");
          return null;
        }

        authLogger.info({ email, role: user.role }, "Login exitoso");
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as Role;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  logger: {
    error(code, ...message: unknown[]) {
      authLogger.error({ code: String(code) }, message.join(" "));
    },
    warn(code, ...message: unknown[]) {
      authLogger.warn({ code: String(code) }, message.join(" "));
    },
    debug(code, ...message: unknown[]) {
      authLogger.debug({ code: String(code) }, message.join(" "));
    },
  },
});
