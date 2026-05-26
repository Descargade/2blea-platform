import { execSync } from "child_process";

function run(cmd, opts = {}) {
  execSync(cmd, { stdio: "inherit", timeout: 90000, ...opts });
}

// Step 1: Add enum values (each in its own connection)
console.log("\n=== Step 1: Migrating enums ===");
run("node scripts/migrate-enums.mjs");

// Step 2: Deploy Prisma migrations with retry on lock timeout
console.log("\n=== Step 2: Deploying Prisma migrations ===");
const maxRetries = 4;
for (let i = 0; i < maxRetries; i++) {
  try {
    run("prisma migrate deploy");
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

// Step 3: Generate client
console.log("\n=== Step 3: Generating Prisma client ===");
run("prisma generate");

// Step 4: Build Next.js
console.log("\n=== Step 4: Building Next.js ===");
run("next build");
