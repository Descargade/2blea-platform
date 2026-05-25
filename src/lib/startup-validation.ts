const REQUIRED_PRODUCTION = [
  "DATABASE_URL",
  "NEXTAUTH_URL",
  "NEXTAUTH_SECRET",
  "NEXT_PUBLIC_PUSHER_KEY",
  "NEXT_PUBLIC_PUSHER_CLUSTER",
  "PUSHER_APP_ID",
  "PUSHER_KEY",
  "PUSHER_SECRET",
  "PUSHER_CLUSTER",
] as const;

const REQUIRED_CLOUDINARY = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
] as const;

export function validateProductionEnv(): void {
  if (process.env.NODE_ENV !== "production") return;
  if (!process.env.DATABASE_URL) return; // skip during next build (no env vars)

  const missing: string[] = [];

  for (const key of REQUIRED_PRODUCTION) {
    if (!process.env[key]) missing.push(key);
  }

  if (process.env.STORAGE_PROVIDER === "cloudinary") {
    for (const key of REQUIRED_CLOUDINARY) {
      if (!process.env[key]) missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.error("==================================================");
    console.error("  PRODUCTION ENV VALIDATION FAILED");
    console.error("  Missing variables:");
    missing.forEach((k) => console.error(`    ❌ ${k}`));
    console.error("==================================================");
    throw new Error(`Production env validation failed. Missing: ${missing.join(", ")}`);
  }

  // Validate DATABASE_URL format for Neon/Supabase
  const dbUrl = process.env.DATABASE_URL!;
  if (!dbUrl.startsWith("postgresql://") && !dbUrl.startsWith("postgres://")) {
    throw new Error("DATABASE_URL must be a PostgreSQL connection string");
  }

  // Validate NEXTAUTH_SECRET length
  if ((process.env.NEXTAUTH_SECRET?.length ?? 0) < 32) {
    throw new Error("NEXTAUTH_SECRET must be at least 32 characters");
  }

  // Validate NEXTAUTH_URL
  const authUrl = process.env.NEXTAUTH_URL!;
  if (!authUrl.startsWith("https://")) {
    throw new Error("NEXTAUTH_URL must use HTTPS in production");
  }

  console.log("✅ Production env validation passed");
}

export function validateAppUrl(): void {
  if (!process.env.DATABASE_URL) return; // skip during next build
  const raw = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
  if (raw && !raw.startsWith("https://") && process.env.NODE_ENV === "production") {
    console.warn("⚠️  NEXT_PUBLIC_APP_URL should use HTTPS in production");
  }
}
