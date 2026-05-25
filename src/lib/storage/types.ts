import { z } from "zod";

export const ALLOWED_MIME_MAP = {
  image: ["image/jpeg", "image/png", "image/webp"],
  pdf: ["application/pdf"],
  video: ["video/mp4"],
  archive: ["application/zip"],
} as const;

export const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "application/pdf": ".pdf",
  "video/mp4": ".mp4",
  "application/zip": ".zip",
};

export type FileCategory = keyof typeof ALLOWED_MIME_MAP;

export interface SaveResult {
  key: string;
  url: string;
}

export interface ReadResult {
  buffer: Buffer;
  contentType: string;
}

export interface StorageProvider {
  save(buffer: Buffer, originalName: string, mimeType: string): Promise<SaveResult>;
  read(key: string): Promise<ReadResult>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
  validate(mimeType: string, size: number): { valid: boolean; error?: string };
  getCategory(mimeType: string): FileCategory | "general";
}

export type StorageProviderType = "local" | "cloudinary";
