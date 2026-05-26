import { type StorageProvider, type StorageProviderType } from "./types";
import { localProvider } from "./local";
import { cloudinaryProvider } from "./cloudinary";

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
