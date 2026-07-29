import { Star } from "@/components/icons";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  /** Valor de 0 a 5. */
  value: number;
  /** Número de reseñas, opcional (se muestra entre paréntesis). */
  reviews?: number;
  className?: string;
}

/** Estrellas de calificación (rellenas hasta `value`). */
export function RatingStars({ value, reviews, className }: RatingStarsProps) {
  const rounded = Math.round(value);
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <span
        className="flex text-neon"
        role="img"
        aria-label={`${value} de 5 estrellas`}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn("size-4", i < rounded ? "fill-neon" : "opacity-30")}
          />
        ))}
      </span>
      {reviews !== undefined && (
        <span className="text-xs text-humo">({reviews})</span>
      )}
    </div>
  );
}
