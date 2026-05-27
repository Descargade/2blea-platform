"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { ProjectFile } from "@/types";
import { File as FileIcon, Image as ImageIcon, Film, FileText, Archive, Trash2, Download, Play, X, Loader2 } from "lucide-react";

interface FileGalleryProps {
  projectId: string;
}

function getFileIcon(mime: string) {
  if (mime.startsWith("image/")) return <ImageIcon className="w-5 h-5" />;
  if (mime === "application/pdf") return <FileText className="w-5 h-5" />;
  if (mime.startsWith("video/")) return <Film className="w-5 h-5" />;
  if (mime === "application/zip") return <Archive className="w-5 h-5" />;
  return <FileIcon className="w-5 h-5" />;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("es-AR", { day: "numeric", month: "short" });
}

function ImagePreview({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors" aria-label="Cerrar">
        <X className="w-6 h-6" />
      </button>
      <img src={src} className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()} alt="Preview" />
    </div>
  );
}

function VideoPreview({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors" aria-label="Cerrar">
        <X className="w-6 h-6" />
      </button>
      <video src={src} controls className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}

export function FileGallery({ projectId }: FileGalleryProps) {
  const qc = useQueryClient();
  const [preview, setPreview] = useState<{ type: string; src: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["project-files", projectId],
    queryFn: async () => {
      const res = await api.get(`/projects/${projectId}`);
      return (res.data.data?.files ?? res.data.files ?? []) as ProjectFile[];
    },
    staleTime: 30_000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (key: string) => {
      const res = await api.delete(`/upload/${key}`);
      if (res.status !== 200) throw new Error(res.data?.error ?? "Error al eliminar");
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project-files", projectId] });
      qc.invalidateQueries({ queryKey: ["project", projectId] });
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const files = Array.isArray(data) ? data : [];

  function openPreview(file: ProjectFile) {
    if (file.mimeType.startsWith("image/")) {
      setPreview({ type: "image", src: `/api/upload/${file.key}` });
    } else if (file.mimeType.startsWith("video/")) {
      setPreview({ type: "video", src: `/api/upload/${file.key}` });
    } else if (file.mimeType === "application/pdf") {
      window.open(`/api/upload/${file.key}`, "_blank");
    }
  }

  function downloadFile(file: ProjectFile) {
    window.open(`/api/upload/${file.key}`, "_blank");
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-xl bg-premium-darker animate-pulse" />
        ))}
      </div>
    );
  }

  if (files.length === 0) return null;

  return (
    <>
      {preview?.type === "image" && <ImagePreview src={preview.src} onClose={() => setPreview(null)} />}
      {preview?.type === "video" && <VideoPreview src={preview.src} onClose={() => setPreview(null)} />}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {files.map((file) => (
          <div
            key={file.id}
            className="group relative aspect-square rounded-xl overflow-hidden bg-premium-darker border border-white/5 hover:border-premium-violet/20 transition-all duration-300"
          >
            {file.mimeType.startsWith("image/") ? (
              <img
                src={`/api/upload/${file.key}`}
                alt={file.originalName}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => openPreview(file)}
              />
            ) : file.mimeType.startsWith("video/") ? (
              <div className="w-full h-full flex items-center justify-center cursor-pointer bg-premium-black" onClick={() => openPreview(file)}>
                <div className="relative">
                  <Film className="w-12 h-12 text-gray-500" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-premium-accent/20 flex items-center justify-center">
                      <Play className="w-5 h-5 text-premium-accent ml-0.5" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center" onClick={() => openPreview(file)}>
                <div className="text-center">
                  <div className="p-3 rounded-xl bg-premium-violet/10 inline-block mb-2">{getFileIcon(file.mimeType)}</div>
                  <p className="text-xs text-gray-400 px-2 truncate max-w-full">{file.originalName}</p>
                </div>
              </div>
            )}

            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
              <button
                onClick={() => openPreview(file)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Ver archivo"
              >
                {file.mimeType.startsWith("image/") ? <ImageIcon className="w-4 h-4" /> : file.mimeType.startsWith("video/") ? <Play className="w-4 h-4" /> : <Download className="w-4 h-4" />}
              </button>
              <button
                onClick={() => downloadFile(file)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Descargar"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => { if (confirm("¿Eliminar este archivo?")) deleteMutation.mutate(file.key); }}
                disabled={deleteMutation.isPending}
                className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
                aria-label="Eliminar archivo"
              >
                {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 text-red-400" />}
              </button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-xs truncate text-gray-300">{file.originalName}</p>
              <p className="text-[10px] text-gray-500">{formatSize(file.size)} · {formatDate(file.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
