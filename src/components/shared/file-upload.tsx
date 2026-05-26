"use client";
import { useState, useRef, useCallback } from "react";
import { Upload, File, X, ImageIcon, Film, FileText, Archive, Loader2 } from "lucide-react";

interface FileUploadProps {
  projectId: string;
  onSuccess?: () => void;
}

const MAX_SIZE = 100 * 1024 * 1024;

const typeIcons: Record<string, React.ReactNode> = {
  image: <ImageIcon className="w-5 h-5" />,
  pdf: <FileText className="w-5 h-5" />,
  video: <Film className="w-5 h-5" />,
  archive: <Archive className="w-5 h-5" />,
};

export function FileUpload({ projectId, onSuccess }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = useCallback((f: File) => {
    const mime = f.type;
    const isAllowed = mime.startsWith("image/") || mime === "application/pdf" || mime.startsWith("video/") || mime === "application/zip";
    if (!isAllowed) return "Formato no soportado. Usá JPG, PNG, WEBP, PDF, MP4 o ZIP.";
    if (f.size > MAX_SIZE) return "El archivo supera los 100MB.";
    return "";
  }, []);

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (!f) return;
    const err = validate(f);
    if (err) { setError(err); return; }
    setError("");
    setFile(f);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const err = validate(f);
    if (err) { setError(err); return; }
    setError("");
    setFile(f);
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectId", projectId);

      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
      };

      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else {
            try {
              const body = JSON.parse(xhr.responseText);
              reject(new Error(body.error || "Error al subir archivo"));
            } catch {
              reject(new Error("Error al subir archivo"));
            }
          }
        };
        xhr.onerror = () => reject(new Error("Error de conexión"));
        xhr.open("POST", "/api/upload");
        xhr.send(formData);
      });

      setFile(null);
      setProgress(0);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir archivo");
    } finally {
      setUploading(false);
    }
  }

  function getFileIcon(mime: string) {
    if (mime.startsWith("image/")) return typeIcons.image;
    if (mime === "application/pdf") return typeIcons.pdf;
    if (mime.startsWith("video/")) return typeIcons.video;
    if (mime === "application/zip") return typeIcons.archive;
    return <File className="w-5 h-5" />;
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleFileDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
          dragOver
            ? "border-premium-violet bg-premium-violet/10 scale-[1.02]"
            : "border-white/10 hover:border-premium-violet/30 hover:bg-premium-violet/5"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf,video/mp4,application/zip"
          className="hidden"
          onChange={handleFileSelect}
        />
        <Upload className={`w-10 h-10 mx-auto mb-3 transition-colors ${dragOver ? "text-premium-accent" : "text-gray-500"}`} />
        <p className="text-sm font-medium mb-1">
          {dragOver ? "Soltá el archivo aquí" : "Arrastrá un archivo o hacé clic"}
        </p>
        <p className="text-xs text-gray-500">JPG, PNG, WEBP, PDF, MP4, ZIP — hasta 100MB</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 rounded-xl px-4 py-3">
          <X className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {file && !uploading && (
        <div className="premium-card flex items-center gap-3 p-3">
          <div className="p-2 rounded-lg bg-premium-violet/10">{getFileIcon(file.type)}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
          </div>
          <button onClick={() => setFile(null)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" aria-label="Cancelar">
            <X className="w-4 h-4 text-gray-400" />
          </button>
          <button onClick={handleUpload} className="premium-button text-xs px-4 py-2">
            Subir
          </button>
        </div>
      )}

      {uploading && (
        <div className="premium-card p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Loader2 className="w-4 h-4 animate-spin text-premium-accent" />
            <span>Subiendo archivo...</span>
            <span className="ml-auto text-xs text-gray-500">{progress}%</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-premium-violet rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}
