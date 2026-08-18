"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { signCategoryImageUpload } from "@/app/admin/categorias/actions";
import { cn } from "@/lib/utils";

/**
 * Subida directa a Cloudinary (firmada por el servidor) de la imagen de
 * portada de una categoría. `value` es la URL (secure_url) o null.
 */
export function CategoryImageUploader({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | null) {
    if (!file) return;
    setError(null);
    setUploading(true);
    const sig = await signCategoryImageUpload();
    if (!sig.ok) {
      setError("Cloudinary no está configurado (faltan llaves en el servidor).");
      setUploading(false);
      return;
    }
    const fd = new FormData();
    fd.append("file", file);
    fd.append("api_key", sig.apiKey);
    fd.append("timestamp", String(sig.timestamp));
    fd.append("signature", sig.signature);
    fd.append("folder", sig.folder);
    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
        { method: "POST", body: fd },
      );
      const data = await res.json();
      if (data.secure_url) onChange(data.secure_url);
      else setError(data.error?.message ?? "No se pudo subir la imagen.");
    } catch {
      setError("Error de red al subir a Cloudinary.");
    }
    setUploading(false);
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {value ? (
          <div className="relative aspect-square overflow-hidden rounded-md border border-linea bg-surface-1">
            <Image src={value} alt="" fill sizes="120px" className="object-cover" />
            <button
              type="button"
              onClick={() => onChange(null)}
              aria-label="Quitar"
              className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-noir/80 text-humo transition-colors hover:text-red-500"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ) : (
          <label
            className={cn(
              "flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-linea text-humo transition-colors hover:border-neon hover:text-neon",
              uploading && "pointer-events-none opacity-60",
            )}
          >
            <Upload className="size-5" />
            <span className="text-[10px] uppercase tracking-wide">
              {uploading ? "Subiendo…" : "Subir"}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
          </label>
        )}
      </div>
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
