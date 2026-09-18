"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { signReviewImageUpload } from "@/app/(store)/producto/[slug]/actions";
import { cn } from "@/lib/utils";

const MAX_IMAGES = 4;

/**
 * Subida de fotos de una reseña (p. ej. cómo le quedó la peluca). Igual que
 * `MediaUploader` del admin pero sin necesitar rol admin ni elegir carpeta:
 * cualquier cliente con sesión puede subir hasta `MAX_IMAGES` fotos.
 */
export function ReviewImageUploader({
  value,
  onChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    const disponibles = MAX_IMAGES - value.length;
    if (disponibles <= 0) {
      setError(`Máximo ${MAX_IMAGES} fotos por reseña.`);
      return;
    }
    setUploading(true);
    const uploaded: string[] = [];
    for (const file of Array.from(files).slice(0, disponibles)) {
      const sig = await signReviewImageUpload();
      if (!sig.ok) {
        setError(
          sig.error === "sin_sesion"
            ? "Inicia sesión para subir fotos."
            : "No se pudo subir la foto (falta configuración del servidor).",
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
          `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
          { method: "POST", body: fd },
        );
        const data = await res.json();
        if (data.secure_url) uploaded.push(data.secure_url);
        else setError(data.error?.message ?? "No se pudo subir la foto.");
      } catch {
        setError("Error de red al subir la foto.");
      }
    }
    if (uploaded.length) onChange([...value, ...uploaded]);
    setUploading(false);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((url) => (
          <div
            key={url}
            className="relative size-16 shrink-0 overflow-hidden rounded-md border border-linea bg-surface-1"
          >
            <Image src={url} alt="" fill sizes="64px" className="object-cover" />
            <button
              type="button"
              onClick={() => onChange(value.filter((u) => u !== url))}
              aria-label="Quitar foto"
              className="absolute right-0.5 top-0.5 grid size-5 place-items-center rounded-full bg-black/80 text-white/80 transition-colors hover:text-red-500"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}

        {value.length < MAX_IMAGES ? (
          <label
            className={cn(
              "flex size-16 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-linea text-humo transition-colors hover:border-neon hover:text-neon",
              uploading && "pointer-events-none opacity-60",
            )}
          >
            <Upload className="size-4" />
            <span className="text-[9px] uppercase tracking-wide">
              {uploading ? "…" : "Foto"}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        ) : null}
      </div>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
