import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().url().min(1),
  NEXTAUTH_URL: z.string().url().min(1),
  NEXTAUTH_SECRET: z.string().min(32),

  NEXT_PUBLIC_PUSHER_KEY: z.string().min(1),
  NEXT_PUBLIC_PUSHER_CLUSTER: z.string().min(1),
  PUSHER_APP_ID: z.string().min(1),
  PUSHER_KEY: z.string().min(1),
  PUSHER_SECRET: z.string().min(1),
  PUSHER_CLUSTER: z.string().min(1),

  STORAGE_PROVIDER: z.enum(["local", "cloudinary"]).default("local"),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  RESEND_API_KEY: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Invalid environment variables:", result.error.flatten().fieldErrors);
    if (process.env.NODE_ENV === "production") {
      throw new Error("Invalid environment configuration. Check logs.");
    }
    return envSchema.parse({
      ...process.env,
      NODE_ENV: "development",
    });
  }

  return result.data;
}

export function env(): Env {
  if (typeof window !== "undefined") {
    return {
      NODE_ENV: process.env.NODE_ENV as Env["NODE_ENV"],
      NEXT_PUBLIC_PUSHER_KEY: process.env.NEXT_PUBLIC_PUSHER_KEY ?? "",
      NEXT_PUBLIC_PUSHER_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "",
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "",
    } as Env;
  }
  return validateEnv();
}
