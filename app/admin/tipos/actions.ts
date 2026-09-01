"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { productTypeSchema } from "@/lib/schemas/product-type";

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Un tipo de producto toca todo el sitio: es una ruta de catálogo y además
 * alimenta los links del navbar y el pie, que viven en el layout.
 */
function revalidate() {
  revalidatePath("/admin/tipos");
  revalidatePath("/admin/categorias");
  revalidatePath("/admin");
  revalidatePath("/", "layout");
}

export async function createTipo(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = productTypeSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }
  try {
    await prisma.productType.create({ data: parsed.data });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: "Ya existe un tipo de producto con ese slug." };
    }
    throw e;
  }
  revalidate();
  return { ok: true };
}

export async function updateTipo(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = productTypeSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }
  try {
    await prisma.productType.update({ where: { id }, data: parsed.data });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: "Ya existe un tipo de producto con ese slug." };
    }
    throw e;
  }
  revalidate();
  return { ok: true };
}

export async function deleteTipo(id: string): Promise<ActionResult> {
  await requireAdmin();
  const count = await prisma.category.count({ where: { productTypeId: id } });
  if (count > 0) {
    return {
      ok: false,
      error: `No se puede borrar: tiene ${count} categoría(s). Bórralas o muévelas primero.`,
    };
  }
  await prisma.productType.delete({ where: { id } });
  revalidate();
  return { ok: true };
}
