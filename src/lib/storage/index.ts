import { type StorageProvider, type StorageProviderType } from "./types";
import { localProvider } from "./local";
import { cloudinaryProvider } from "./cloudinary";

const providers: Record<StorageProviderType, StorageProvider> = {
  local: localProvider,
  cloudinary: cloudinaryProvider,
};

function getProviderType(): StorageProviderType {
  return (process.env.STORAGE_PROVIDER as StorageProviderType) ?? "local";
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
