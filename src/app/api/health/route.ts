import { NextResponse } from "next/server";
import { validateProductionEnv } from "@/lib/startup-validation";

export const dynamic = "force-dynamic";

export async function GET() {
  let envStatus = "ok";
  let envErrors: string[] = [];

  try {
    validateProductionEnv();
  } catch (e) {
    envStatus = "error";
    envErrors = [(e as Error).message];
  }

  const checks = {
    status: envStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    env: {
      node: process.version,
      platform: process.platform,
      storage: process.env.STORAGE_PROVIDER ?? "local",
      errors: envErrors.length > 0 ? envErrors : undefined,
    },
  };

  const statusCode = envStatus === "error" ? 503 : 200;
  return NextResponse.json(checks, { status: statusCode });
}
