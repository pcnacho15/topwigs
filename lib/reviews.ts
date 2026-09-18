import "server-only";
import { prisma } from "@/lib/db";

export interface PublicReview {
  id: string;
  autor: string;
  rating: number;
  comentario: string;
  imagenes: string[];
  createdAt: Date;
  /** Reseña del usuario que ve la página: puede editar/borrar la suya. */
  esPropia: boolean;
}

/**
 * Reseñas de un producto, más recientes primero. `viewerUserId` marca cuál
 * (si alguna) le pertenece al usuario en sesión.
 */
export async function getProductReviews(
  productId: string,
  viewerUserId?: string,
): Promise<PublicReview[]> {
  const rows = await prisma.review.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    autor: r.user.name,
    rating: r.rating,
    comentario: r.comentario,
    imagenes: (r.imagenes as unknown as string[]) ?? [],
    createdAt: r.createdAt,
    esPropia: r.userId === viewerUserId,
  }));
}

/**
 * Recalcula el rating/conteo cacheado del producto a partir de sus reseñas
 * reales. Se llama después de crear, editar o borrar cualquier reseña
 * (desde la tienda o desde el panel admin) para que ambos caminos queden
 * consistentes.
 */
export async function recomputeProductRating(productId: string): Promise<void> {
  const agg = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: agg._avg.rating ?? 0,
      reviews: agg._count,
    },
  });
}
