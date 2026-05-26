import { execSync } from "child_process";

function run(cmd, opts = {}) {
  execSync(cmd, { stdio: "inherit", timeout: 90000, ...opts });
}

const directUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

// Step 1: Add enum values using direct connection
console.log("\n=== Step 1: Migrating enums ===");
run("node scripts/migrate-enums.mjs", { env: { ...process.env, DATABASE_URL: directUrl } });

// Step 2: Deploy Prisma migrations using direct connection (bypasses Neon pooler advisory lock issue)
console.log("\n=== Step 2: Deploying Prisma migrations ===");
const maxRetries = 4;
for (let i = 0; i < maxRetries; i++) {
  try {
    run("prisma migrate deploy", { env: { ...process.env, DATABASE_URL: directUrl } });
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

// Step 3: Generate client (uses the regular pooled DATABASE_URL for the schema)
console.log("\n=== Step 3: Generating Prisma client ===");
run("prisma generate");

// Step 4: Build Next.js
console.log("\n=== Step 4: Building Next.js ===");
run("next build");
