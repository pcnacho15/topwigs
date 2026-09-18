"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Miniaturas de las fotos de una reseña + lightbox propio (portal a
 * `document.body`, no un link a la imagen): así el clic no saca al cliente
 * del sitio a una pestaña nueva de Cloudinary.
 */
export function ReviewImageGallery({ images }: { images: string[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    if (openIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenIndex(null);
      if (e.key === "ArrowRight") setOpenIndex((i) => (i === null ? i : (i + 1) % images.length));
      if (e.key === "ArrowLeft") {
        setOpenIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length));
      }
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [openIndex, images.length]);

  if (images.length === 0) return null;

  return (
    <>
      <div className="mt-3 flex flex-wrap gap-2">
        {images.map((url, i) => (
          <button
            key={url}
            type="button"
            onClick={() => setOpenIndex(i)}
            aria-label={`Ver foto ${i + 1} de la reseña`}
            className="relative size-16 shrink-0 cursor-pointer overflow-hidden rounded-md border border-linea transition-opacity hover:opacity-80"
          >
            <Image src={url} alt="" fill sizes="64px" className="object-cover" />
          </button>
        ))}
      </div>

      {openIndex !== null
        ? createPortal(
            <div
              className="fixed inset-0 z-200 flex items-center justify-center bg-black/90 p-4"
              onClick={() => setOpenIndex(null)}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(null)}
                aria-label="Cerrar"
                className="absolute right-4 top-4 grid size-10 cursor-pointer place-items-center rounded-full bg-black/60 text-white transition-colors hover:text-neon"
              >
                <X className="size-5" />
              </button>

              {images.length > 1 ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length));
                  }}
                  aria-label="Foto anterior"
                  className="absolute left-4 top-1/2 grid size-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-black/60 text-white transition-colors hover:text-neon"
                >
                  <ChevronLeft className="size-5" />
                </button>
              ) : null}

              {/* eslint-disable-next-line @next/next/no-img-element -- tamaño
                  intrínseco: con next/image + fill, la caja fija (80vh) le
                  ganaba al alto real de fotos verticales y dejaba franjas
                  vacías a los lados. */}
              <img
                src={images[openIndex]}
                alt=""
                onClick={(e) => e.stopPropagation()}
                className="max-h-[85vh] max-w-[92vw] rounded-md object-contain"
              />

              {images.length > 1 ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenIndex((i) => (i === null ? i : (i + 1) % images.length));
                  }}
                  aria-label="Foto siguiente"
                  className="absolute right-4 top-1/2 grid size-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-black/60 text-white transition-colors hover:text-neon"
                >
                  <ChevronRight className="size-5" />
                </button>
              ) : null}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
