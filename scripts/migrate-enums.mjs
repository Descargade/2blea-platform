// Run each ALTER TYPE ADD VALUE in its own connection
// PostgreSQL restriction: can't add enum values in a transaction with other operations
import { PrismaClient } from "@prisma/client";

async function run() {
  const statements = [
    `ALTER TYPE "ProjectStatus" ADD VALUE IF NOT EXISTS 'CONSULTA'`,
    `ALTER TYPE "ProjectStatus" ADD VALUE IF NOT EXISTS 'DISENO'`,
    `ALTER TYPE "ProjectStatus" ADD VALUE IF NOT EXISTS 'DESARROLLO'`,
    `ALTER TYPE "ProjectStatus" ADD VALUE IF NOT EXISTS 'REVISION'`,
    `ALTER TYPE "ProjectStatus" ADD VALUE IF NOT EXISTS 'OPTIMIZACION'`,
    `ALTER TABLE "Project" ALTER COLUMN "status" SET DEFAULT 'CONSULTA'`,
  ];

  for (const sql of statements) {
    const prisma = new PrismaClient();
    try {
      await prisma.$executeRawUnsafe(sql);
      console.log(`✅ ${sql.substring(0, 70)}`);
    } catch (err) {
      const msg = err.message || "";
      if (msg.includes("already exists")) {
        console.log(`⚠️  Already exists: ${sql.substring(0, 60)}`);
      } else {
        console.error(`❌ ${sql.substring(0, 60)}: ${msg}`);
      }
    } finally {
      await prisma.$disconnect();
    }
  }
}

run()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
