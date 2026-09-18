"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth-guard";
import { recomputeProductRating } from "@/lib/reviews";
import { reviewSchema } from "@/lib/schemas/review";
import { cloudinary, cloudinaryConfigured } from "@/lib/cloudinary";

export type ReviewActionResult = { ok: true } | { ok: false; error: string };

const json = (v: unknown) => v as Prisma.InputJsonValue;

/**
 * Crea o reemplaza la reseña del usuario en sesión para este producto (una
 * por usuario: reenviar el formulario la actualiza en vez de duplicarla).
 */
export async function submitReview(
  productSlug: string,
  input: unknown,
): Promise<ReviewActionResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Inicia sesión para dejar una reseña." };

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const product = await prisma.product.findUnique({
    where: { slug: productSlug },
    select: { id: true },
  });
  if (!product) return { ok: false, error: "Producto no encontrado." };

  const data = { ...parsed.data, imagenes: json(parsed.data.imagenes) };
  await prisma.review.upsert({
    where: { productId_userId: { productId: product.id, userId: session.user.id } },
    create: { productId: product.id, userId: session.user.id, ...data },
    update: data,
  });
  await recomputeProductRating(product.id);

  revalidatePath(`/producto/${productSlug}`);
  return { ok: true };
}

/**
 * Firma una subida directa a Cloudinary para la foto de una reseña. Solo
 * exige sesión (no admin): cualquier cliente puede ilustrar su reseña con
 * una foto del producto que le llegó.
 */
export async function signReviewImageUpload() {
  const session = await getSession();
  if (!session) return { ok: false as const, error: "sin_sesion" };
  if (!cloudinaryConfigured()) {
    return { ok: false as const, error: "cloudinary_missing" };
  }
  const timestamp = Math.round(Date.now() / 1000);
  const folder = "topwigs/resenas";
  const signature = cloudinary.utils.api_sign_request(
    { folder, timestamp },
    process.env.CLOUDINARY_API_SECRET as string,
  );
  return {
    ok: true as const,
    signature,
    timestamp,
    folder,
    apiKey: process.env.CLOUDINARY_API_KEY as string,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
  };
}

/** Borra la reseña propia del usuario en sesión para este producto. */
export async function deleteOwnReview(productSlug: string): Promise<ReviewActionResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Inicia sesión." };

  const product = await prisma.product.findUnique({
    where: { slug: productSlug },
    select: { id: true },
  });
  if (!product) return { ok: false, error: "Producto no encontrado." };

  await prisma.review.deleteMany({
    where: { productId: product.id, userId: session.user.id },
  });
  await recomputeProductRating(product.id);

  revalidatePath(`/producto/${productSlug}`);
  return { ok: true };
}
