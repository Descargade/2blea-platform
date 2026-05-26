-- Create new enums
CREATE TYPE "PaymentType" AS ENUM ('ANTICIPO', 'SALDO_FINAL', 'GENERAL');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE');

-- Add features column to Project
ALTER TABLE "Project" ADD COLUMN "features" TEXT[] NOT NULL DEFAULT '{}';

-- Add type and status to ProjectPayment
ALTER TABLE "ProjectPayment" ADD COLUMN "type" "PaymentType" NOT NULL DEFAULT 'GENERAL';
ALTER TABLE "ProjectPayment" ADD COLUMN "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING';
