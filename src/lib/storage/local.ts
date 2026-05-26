import { randomUUID } from "crypto";
import { mkdir, writeFile, unlink, readFile } from "fs/promises";
import { join, extname } from "path";
import { existsSync } from "fs";
import { tmpdir } from "os";
import { ALLOWED_MIME_MAP, MIME_EXTENSIONS, type StorageProvider, type FileCategory } from "./types";

const UPLOADS_DIR = process.env.VERCEL === "1"
  ? join(tmpdir(), "uploads")
  : join(process.cwd(), "uploads");

const MAX_SIZE = 100 * 1024 * 1024;

const ALLOWED_FLAT: string[] = Object.values(ALLOWED_MIME_MAP).flat();

function classifyMime(mime: string): FileCategory | "general" {
  if (mime.startsWith("image/")) return "image";
  if (mime === "application/pdf") return "pdf";
  if (mime.startsWith("video/")) return "video";
  if (mime === "application/zip") return "archive";
  return "general";
}

export const localProvider: StorageProvider = {
  async save(buffer, originalName, mimeType) {
    if (!existsSync(UPLOADS_DIR)) {
      await mkdir(UPLOADS_DIR, { recursive: true });
    }
    const ext = MIME_EXTENSIONS[mimeType] || extname(originalName) || ".bin";
    const key = `${randomUUID()}${ext}`;
    const filePath = join(UPLOADS_DIR, key);
    await writeFile(filePath, buffer);
    return { key, url: `/api/upload/${key}` };
  },

  async read(key) {
    const filePath = join(UPLOADS_DIR, key);
    if (!existsSync(filePath)) throw new Error("Archivo no encontrado");
    const buffer = await readFile(filePath);
    return { buffer, contentType: "application/octet-stream" };
  },

  async delete(key) {
    const filePath = join(UPLOADS_DIR, key);
    if (existsSync(filePath)) {
      await unlink(filePath);
    }
  },

  getUrl(key) {
    return `/api/upload/${key}`;
  },

  validate(mimeType, size) {
    const category = classifyMime(mimeType);
    if (category === "general") {
      return { valid: false, error: `Tipo de archivo no soportado: ${mimeType}` };
    }
    if (!ALLOWED_FLAT.includes(mimeType)) {
      return { valid: false, error: `Formato no soportado: ${mimeType}` };
    }
    if (size > MAX_SIZE) {
      return { valid: false, error: `El archivo excede el límite de ${MAX_SIZE / 1024 / 1024}MB` };
    }
    return { valid: true };
  },

  getCategory(mimeType) {
    return classifyMime(mimeType);
  },
};
