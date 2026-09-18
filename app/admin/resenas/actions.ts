"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { recomputeProductRating } from "@/lib/reviews";

export type ActionResult = { ok: true } | { ok: false; error: string };

/** Borra una reseña inapropiada. Cualquier admin puede hacerlo. */
export async function deleteResena(id: string): Promise<ActionResult> {
  await requireAdmin();
  const review = await prisma.review.findUnique({
    where: { id },
    select: { productId: true },
  });
  if (!review) return { ok: false, error: "La reseña ya no existe." };

  await prisma.review.delete({ where: { id } });
  await recomputeProductRating(review.productId);

  revalidatePath("/admin/resenas");
  revalidatePath("/producto/[slug]", "page");
  return { ok: true };
}
