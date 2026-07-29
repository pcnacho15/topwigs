"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { categorySchema } from "@/lib/schemas/category";

export type ActionResult = { ok: true } | { ok: false; error: string };

function revalidate() {
  revalidatePath("/admin/categorias");
  revalidatePath("/admin");
  revalidatePath("/catalogo");
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
      return { ok: false, error: "Ya existe una categoría con ese slug." };
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
      return { ok: false, error: "Ya existe una categoría con ese slug." };
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
