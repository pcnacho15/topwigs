"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { ReviewImageUploader } from "@/components/ui/review-image-uploader";
import { cn } from "@/lib/utils";
import { reviewSchema } from "@/lib/schemas/review";
import { submitReview, deleteOwnReview } from "@/app/(store)/producto/[slug]/actions";

interface ReviewFormProps {
  productSlug: string;
  initial?: { rating: number; comentario: string; imagenes: string[] } | null;
}

export function ReviewForm({ productSlug, initial }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [comentario, setComentario] = useState(initial?.comentario ?? "");
  const [imagenes, setImagenes] = useState<string[]>(initial?.imagenes ?? []);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const shown = hover || rating;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = reviewSchema.safeParse({ rating, comentario, imagenes });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Datos inválidos");
      return;
    }
    startTransition(async () => {
      const result = await submitReview(productSlug, parsed.data);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function onDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteOwnReview(productSlug);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setRating(0);
      setComentario("");
      setImagenes([]);
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <p className="mb-1.5 font-heading text-xs font-semibold uppercase tracking-wide text-humo">
          Tu calificación
        </p>
        <div
          className="flex gap-1"
          onMouseLeave={() => setHover(0)}
        >
          {Array.from({ length: 5 }).map((_, i) => {
            const value = i + 1;
            return (
              <button
                key={value}
                type="button"
                aria-label={`${value} estrella${value > 1 ? "s" : ""}`}
                onMouseEnter={() => setHover(value)}
                onClick={() => setRating(value)}
                className="cursor-pointer p-0.5"
              >
                <Star
                  className={cn(
                    "size-6 transition-colors",
                    value <= shown ? "fill-neon text-neon" : "text-humo/40",
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>

      <Textarea
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        placeholder="¿Qué te pareció el producto? (opcional)"
        maxLength={1000}
        rows={3}
      />

      <div>
        <p className="mb-1.5 font-heading text-xs font-semibold uppercase tracking-wide text-humo">
          Fotos (opcional)
        </p>
        <ReviewImageUploader value={imagenes} onChange={setImagenes} />
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={pending}>
          {initial ? "Actualizar reseña" : "Publicar reseña"}
        </Button>
        {initial ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={onDelete}
          >
            Borrar mi reseña
          </Button>
        ) : null}
      </div>
    </form>
  );
}
