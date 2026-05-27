import { randomUUID } from "crypto";
import { v2 as cloudinary } from "cloudinary";
import { ALLOWED_MIME_MAP, MIME_EXTENSIONS, type StorageProvider, type FileCategory } from "./types";

const MAX_SIZE = 100 * 1024 * 1024;
const ALLOWED_FLAT: string[] = Object.values(ALLOWED_MIME_MAP).flat();

const FOLDERS: Record<string, string> = {
  image: "2blea/images",
  pdf: "2blea/documents",
  video: "2blea/videos",
  archive: "2blea/archives",
};

const TRANSFORMATIONS: Record<string, object[]> = {
  image: [{ quality: "auto", fetch_format: "auto", dpr: "auto" }],
  video: [{ quality: "auto" }],
};

function classifyMime(mime: string): FileCategory | "general" {
  if (mime.startsWith("image/")) return "image";
  if (mime === "application/pdf") return "pdf";
  if (mime.startsWith("video/")) return "video";
  if (mime === "application/zip") return "archive";
  return "general";
}

function mimeToResourceType(mime: string): "image" | "raw" | "video" | "auto" {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  return "raw";
}

function configure() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
    secure: true,
  });
}

export const cloudinaryProvider: StorageProvider = {
  async save(buffer, originalName, mimeType) {
    configure();

    const category = classifyMime(mimeType);
    const ext = MIME_EXTENSIONS[mimeType] || ".bin";
    const publicId = `${randomUUID()}`;
    const folder = FOLDERS[category] || "2blea/misc";

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          folder,
          resource_type: mimeToResourceType(mimeType),
          format: ext.replace(".", ""),
          transformation: TRANSFORMATIONS[category],
          use_filename: true,
          unique_filename: false,
        },
        (error, result) => {
          if (error || !result) return reject(error ?? new Error("Upload failed"));
          const fullKey = `${folder}/${publicId}`;
          resolve({ key: fullKey, url: result.secure_url });
        },
      );
      uploadStream.end(buffer);
    });
  },

  async read(key) {
    configure();
    const result = await cloudinary.api.resource(key, { resource_type: "image" });
    return { buffer: Buffer.alloc(0), contentType: result.format ?? "application/octet-stream" };
  },

  async delete(key) {
    configure();
    const publicId = key.includes("/") ? key.split("/").slice(-1)[0]! : key;
    const folder = key.includes("/") ? key.split("/").slice(0, -1).join("/") : "";
    const folderLc = folder.toLowerCase();
    let resourceType: "image" | "video" | "raw" = "image";
    if (folderLc.includes("videos")) resourceType = "video";
    else if (folderLc.includes("documents") || folderLc.includes("archives") || folderLc.includes("misc")) resourceType = "raw";
    await cloudinary.uploader.destroy(`${folder ? `${folder}/` : ""}${publicId}`, { resource_type: resourceType, invalidate: true });
  },

  getUrl(key) {
    configure();
    return cloudinary.url(key, { secure: true });
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
