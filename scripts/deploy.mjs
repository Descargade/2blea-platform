import { execSync } from "child_process";

function run(cmd, opts = {}) {
  execSync(cmd, { stdio: "inherit", timeout: 120000, ...opts });
}

const directUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const deployEnv = { ...process.env, DATABASE_URL: directUrl };

// Step 1: Add enum values using direct connection
console.log("\n=== Step 1: Migrating enums ===");
run("node scripts/migrate-enums.mjs", { env: deployEnv });

// Step 2: Resolve any previously failed migrations
console.log("\n=== Step 2: Resolving failed migrations ===");
// Mark as rolled back so Prisma re-applies it (now without the ALTER TYPE ADD VALUE)
try {
  run('prisma migrate resolve --rolled-back "20260526050000_add_new_statuses_features_payment"', { env: deployEnv });
  console.log("✅ Failed migration rolled back, will re-apply");
} catch {
  console.log("ℹ️ No failed migration to resolve (or already resolved)");
}

// Step 3: Deploy Prisma migrations using direct connection
console.log("\n=== Step 3: Deploying Prisma migrations ===");
const maxRetries = 4;
for (let i = 0; i < maxRetries; i++) {
  try {
    run("prisma migrate deploy", { env: deployEnv });
    break;
  } catch (err) {
    const out = err.stderr?.toString() || err.stdout?.toString() || err.message || "";
    if (out.includes("timed out") && i < maxRetries - 1) {
      console.log(`⏳ Lock timeout, retry ${i + 1}/${maxRetries - 1}...`);
    } else {
      console.error(out);
      process.exit(1);
    }
  }
}

// Step 4: Generate client
console.log("\n=== Step 4: Generating Prisma client ===");
run("prisma generate");

// Step 5: Seed (upserts admin, services, etc.)
console.log("\n=== Step 5: Seeding database ===");
try {
  run("npx --yes tsx prisma/seed.ts", { env: deployEnv });
} catch {
  console.log("ℹ️ Seed failed (may already be up to date)");
}

// Step 6: Build Next.js
console.log("\n=== Step 6: Building Next.js ===");
run("next build");
