import Link from "next/link";
import { getSession } from "@/lib/auth-guard";
import { getProductReviews } from "@/lib/reviews";
import { RatingStars } from "@/components/ui/rating-stars";
import { ReviewForm } from "@/components/ui/review-form";
import { ReviewImageGallery } from "@/components/ui/review-image-gallery";
import { User } from "@/components/icons";
import { SectionHeading } from "@/components/ui/section-heading";

export async function ProductReviews({
  productId,
  productSlug,
  rating,
  reviewCount,
}: {
  productId: string;
  productSlug: string;
  rating: number;
  reviewCount: number;
}) {
  const session = await getSession();
  const reviews = await getProductReviews(productId, session?.user.id);
  const propia = reviews.find((r) => r.esPropia);
  const ajenas = reviews.filter((r) => !r.esPropia);

  return (
    <section className="space-y-8">
      <SectionHeading>Reseñas de nuestras girls</SectionHeading>

      <div className="flex items-center justify-center gap-3">
        <RatingStars value={rating} />
        <span className="text-sm text-humo">
          {reviewCount > 0
            ? `${rating.toFixed(1)} · ${reviewCount} reseña${reviewCount === 1 ? "" : "s"}`
            : "Sin reseñas todavía"}
        </span>
      </div>

      <div className="mx-auto max-w-2xl space-y-6">
        {ajenas.length > 0 ? (
          <ul className="space-y-4">
            {ajenas.map((r) => (
              <li
                key={r.id}
                className="rounded-goth border border-linea bg-surface-1 p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-2 text-humo">
                      <User className="size-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-blanco">
                        {r.autor}
                      </p>
                      <RatingStars
                        value={r.rating}
                        className="mt-0.5"
                      />
                    </div>
                  </div>
                  <span className="text-xs text-humo">
                    {r.createdAt.toLocaleDateString("es-CO", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                {r.comentario ? (
                  <p className="mt-3 text-sm leading-relaxed text-humo">
                    {r.comentario}
                  </p>
                ) : null}
                <ReviewImageGallery images={r.imagenes} />
              </li>
            ))}
          </ul>
        ) : reviewCount === 0 ? (
          <p className="text-center text-sm text-humo">
            Sé el primero en dejar una reseña.
          </p>
        ) : null}
        <div className="rounded-goth border border-linea bg-surface-1 p-5">
          {session ? (
            <ReviewForm
              productSlug={productSlug}
              initial={
                propia
                  ? {
                      rating: propia.rating,
                      comentario: propia.comentario,
                      imagenes: propia.imagenes,
                    }
                  : null
              }
            />
          ) : (
            <p className="text-sm text-humo">
              <Link
                href={`/login?next=/producto/${productSlug}`}
                className="text-neon hover:underline"
              >
                Inicia sesión
              </Link>{" "}
              para calificar y comentar este producto.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
