"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { cloudinary, cloudinaryConfigured } from "@/lib/cloudinary";
import { categorySchema } from "@/lib/schemas/category";

export type ActionResult = { ok: true } | { ok: false; error: string };

function revalidate() {
  revalidatePath("/admin/categorias");
  revalidatePath("/admin");
  // Todos los catálogos: la ruta es dinámica, así que se revalida el patrón.
  revalidatePath("/[catalogo]", "page");
  revalidatePath("/"); // tarjetas de categoría del Home
}

export async function createCategoria(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  try {
    await prisma.category.create({ data: parsed.data });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return {
        ok: false,
        error: "Ya existe una categoría con ese slug en ese tipo de producto.",
      };
    }
    throw e;
  }
  revalidate();
  return { ok: true };
}

export async function updateCategoria(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  try {
    await prisma.category.update({ where: { id }, data: parsed.data });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return {
        ok: false,
        error: "Ya existe una categoría con ese slug en ese tipo de producto.",
      };
    }
    throw e;
  }
  revalidate();
  return { ok: true };
}

export async function deleteCategoria(id: string): Promise<ActionResult> {
  await requireAdmin();
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) {
    return {
      ok: false,
      error: `No se puede borrar: tiene ${count} producto(s). Reasígnalos primero.`,
    };
  }
  await prisma.category.delete({ where: { id } });
  revalidate();
  return { ok: true };
}

/** Firma una subida directa a Cloudinary para la imagen de portada de una categoría. */
export async function signCategoryImageUpload() {
  await requireAdmin();
  if (!cloudinaryConfigured()) {
    return { ok: false as const, error: "cloudinary_missing" };
  }
  const timestamp = Math.round(Date.now() / 1000);
  const folder = "topwigs/categorias";
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
