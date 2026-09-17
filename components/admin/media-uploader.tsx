"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, X, Video } from "lucide-react";
import { signCloudinaryUpload } from "@/app/admin/productos/actions";
import { cn } from "@/lib/utils";

/**
 * Subida directa a Cloudinary (firmada por el servidor). Maneja imágenes
 * o videos. `value` es un array de URLs (secure_url) controlado por RHF.
 */
export function MediaUploader({
  value,
  onChange,
  resourceType,
  tipo,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  resourceType: "image" | "video";
  /** Slug del tipo de producto: define la carpeta en Cloudinary. */
  tipo: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const sig = await signCloudinaryUpload(resourceType, tipo);
      if (!sig.ok) {
        setError(
          sig.error === "tipo_desconocido"
            ? "Selecciona una categoría antes de subir archivos."
            : "Cloudinary no está configurado (faltan llaves en el servidor).",
        );
        break;
      }
      const fd = new FormData();
      fd.append("file", file);
      fd.append("api_key", sig.apiKey);
      fd.append("timestamp", String(sig.timestamp));
      fd.append("signature", sig.signature);
      fd.append("folder", sig.folder);
      try {
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${sig.cloudName}/${resourceType}/upload`,
          { method: "POST", body: fd },
        );
        const data = await res.json();
        if (data.secure_url) uploaded.push(data.secure_url);
        else setError(data.error?.message ?? "No se pudo subir el archivo.");
      } catch {
        setError("Error de red al subir a Cloudinary.");
      }
    }
    if (uploaded.length) onChange([...value, ...uploaded]);
    setUploading(false);
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {value.map((url) => (
          <div
            key={url}
            className="relative aspect-square overflow-hidden rounded-md border border-linea bg-surface-1"
          >
            {resourceType === "image" ? (
              <Image src={url} alt="" fill sizes="120px" className="object-cover" />
            ) : (
              <video src={url} className="size-full object-cover" muted playsInline />
            )}
            <button
              type="button"
              onClick={() => onChange(value.filter((u) => u !== url))}
              aria-label="Quitar"
              className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/80 text-white/80 transition-colors hover:text-red-500"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}

        <label
          className={cn(
            "flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-linea text-humo transition-colors hover:border-neon hover:text-neon",
            uploading && "pointer-events-none opacity-60",
          )}
        >
          {resourceType === "image" ? (
            <Upload className="size-5" />
          ) : (
            <Video className="size-5" />
          )}
          <span className="text-[10px] uppercase tracking-wide">
            {uploading ? "Subiendo…" : "Subir"}
          </span>
          <input
            type="file"
            accept={resourceType === "image" ? "image/*" : "video/*"}
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </div>
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
