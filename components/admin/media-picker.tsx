"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Elige un subconjunto de los medios ya subidos al producto (no sube nada).
 * Se usa para decir qué imágenes/videos pertenecen a cada color.
 */
export function MediaPicker({
  options,
  value,
  onChange,
  resourceType,
  emptyHint,
}: {
  options: string[];
  value: string[];
  onChange: (urls: string[]) => void;
  resourceType: "image" | "video";
  emptyHint: string;
}) {
  if (options.length === 0) {
    return <p className="text-xs text-humo/70">{emptyHint}</p>;
  }

  function toggle(url: string) {
    onChange(
      value.includes(url)
        ? value.filter((u) => u !== url)
        : // Se respeta el orden de la galería para que la ficha muestre
          // los medios en la misma secuencia en la que se subieron.
          options.filter((o) => o === url || value.includes(o)),
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
      {options.map((url) => {
        const selected = value.includes(url);
        return (
          <button
            key={url}
            type="button"
            onClick={() => toggle(url)}
            aria-pressed={selected}
            aria-label={
              selected
                ? `Quitar ${resourceType === "video" ? "video" : "imagen"} de este color`
                : `Asignar ${resourceType === "video" ? "video" : "imagen"} a este color`
            }
            className={cn(
              "relative aspect-square cursor-pointer overflow-hidden rounded-md border-2 bg-surface-1 transition-opacity",
              selected ? "border-neon" : "border-linea opacity-50 hover:opacity-80",
            )}
          >
            {resourceType === "image" ? (
              <Image src={url} alt="" fill sizes="80px" className="object-cover" />
            ) : (
              <video src={url} muted playsInline className="size-full object-cover" />
            )}
            {selected ? (
              <span className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-neon text-ink">
                <Check className="size-3" />
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
