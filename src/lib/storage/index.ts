import { type StorageProvider, type StorageProviderType } from "./types";
import { localProvider } from "./local";
import { cloudinaryProvider } from "./cloudinary";
import { AppError } from "@/lib/app-error";

const providers: Record<StorageProviderType, StorageProvider> = {
  local: localProvider,
  cloudinary: cloudinaryProvider,
};

function getProviderType(): StorageProviderType {
  const configured = process.env.STORAGE_PROVIDER as StorageProviderType;
  if (configured === "cloudinary") return "cloudinary";

  const cloudAvailable =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;

  if (cloudAvailable) return "cloudinary";

  if (process.env.VERCEL === "1") {
    throw new AppError(
      "Cloudinary no configurado. Agregá CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en las env vars de Vercel.",
      500
    );
  }

  return "local";
}

export const storage: StorageProvider = new Proxy({} as StorageProvider, {
  get(_target, prop: keyof StorageProvider) {
    const providerType = getProviderType();
    const provider = providers[providerType];
    if (!provider) {
      throw new Error(`Storage provider "${providerType}" not found. Available: ${Object.keys(providers).join(", ")}`);
    }
    const fn = provider[prop];
    if (typeof fn === "function") {
      return fn.bind(provider);
    }
    return fn;
  },
});
