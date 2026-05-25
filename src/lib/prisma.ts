import { PrismaClient } from "@prisma/client";

declare global {
  var __prisma: PrismaClient | undefined;
}

function createPrisma() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL is not defined");
  }

  const isProduction = process.env.NODE_ENV === "production";

  return new PrismaClient({
    datasources: {
      db: {
        url: isProduction && !url.includes("sslmode") && !url.includes("ssl")
          ? `${url}?sslmode=require`
          : url,
      },
    },
    log: isProduction
      ? ["warn", "error"]
      : ["query", "warn", "error"],
  });
}

const globalForPrisma = globalThis as typeof globalThis & { __prisma?: PrismaClient };
export const prisma = globalForPrisma.__prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prisma = prisma;
}
