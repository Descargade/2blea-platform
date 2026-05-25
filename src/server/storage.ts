import { randomUUID } from "crypto";
import { mkdir, writeFile, unlink, readFile } from "fs/promises";
import { join, extname, basename } from "path";
import { existsSync } from "fs";

const UPLOADS_DIR = join(process.cwd(), "uploads");
const MAX_SIZE = 100 * 1024 * 1024;

const ALLOWED_MIME: Record<string, string[]> = {
  image: ["image/jpeg", "image/png", "image/webp"],
  pdf: ["application/pdf"],
  video: ["video/mp4"],
  archive: ["application/zip"],
};

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "application/pdf": ".pdf",
  "video/mp4": ".mp4",
  "application/zip": ".zip",
};

function classifyMime(mime: string): keyof typeof ALLOWED_MIME | "general" {
  if (mime.startsWith("image/")) return "image";
  if (mime === "application/pdf") return "pdf";
  if (mime.startsWith("video/")) return "video";
  if (mime === "application/zip") return "archive";
  return "general";
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 200);
}

export const storage = {
  async save(buffer: Buffer, originalName: string, mimeType: string): Promise<{ key: string; url: string }> {
    if (!existsSync(UPLOADS_DIR)) {
      await mkdir(UPLOADS_DIR, { recursive: true });
    }

    const ext = MIME_EXTENSIONS[mimeType] || extname(originalName) || ".bin";
    const key = `${randomUUID()}${ext}`;
    const filePath = join(UPLOADS_DIR, key);

    await writeFile(filePath, buffer);
    return { key, url: `/api/upload/${key}` };
  },

  async read(key: string): Promise<{ buffer: Buffer; path: string }> {
    const filePath = join(UPLOADS_DIR, key);
    if (!existsSync(filePath)) throw new Error("Archivo no encontrado");
    const buffer = await readFile(filePath);
    return { buffer, path: filePath };
  },

  async delete(key: string): Promise<void> {
    const filePath = join(UPLOADS_DIR, key);
    if (existsSync(filePath)) {
      await unlink(filePath);
    }
  },

  validate(mimeType: string, size: number): { valid: boolean; error?: string } {
    const category = classifyMime(mimeType);
    if (category === "general") {
      return { valid: false, error: `Tipo de archivo no soportado: ${mimeType}` };
    }
    if (!ALLOWED_MIME[category]!.includes(mimeType)) {
      return { valid: false, error: `Formato no soportado: ${mimeType}` };
    }
    if (size > MAX_SIZE) {
      return { valid: false, error: `El archivo excede el límite de ${MAX_SIZE / 1024 / 1024}MB` };
    }
    return { valid: true };
  },

  getCategory(mimeType: string): string {
    return classifyMime(mimeType);
  },
};
