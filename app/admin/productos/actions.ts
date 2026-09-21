"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import {
  cloudinary,
  cloudinaryConfigured,
  destroyCloudinaryAssets,
} from "@/lib/cloudinary";
import { productSchema } from "@/lib/schemas/product";

export type ActionResult = { ok: true } | { ok: false; error: string };

const json = (v: unknown) => v as Prisma.InputJsonValue;

function revalidate() {
  revalidatePath("/admin/productos");
  revalidatePath("/admin");
  // Todos los catálogos: la ruta es dinámica, así que se revalida el patrón.
  revalidatePath("/[catalogo]", "page");
  revalidatePath("/"); // categorías destacadas (dependen de los productos)
}

function toData(d: import("@/lib/schemas/product").ProductInput) {
  return {
    nombre: d.nombre,
    descripcion: d.descripcion,
    precioCop: d.precioCop,
    precioOfertaCop: d.precioOfertaCop,
    categoryId: d.categoryId,
    nuevo: d.nuevo,
    stock: d.stock,
    activo: d.activo,
    colores: json(d.colores),
    features: json(d.features),
    tips: json(d.tips),
    imagenes: json(d.imagenes),
    videos: json(d.videos),
  };
}

export async function createProducto(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  try {
    await prisma.product.create({
      data: { slug: parsed.data.slug, ...toData(parsed.data) },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: "Ya existe un producto con ese slug." };
    }
    throw e;
  }
  revalidate();
  return { ok: true };
}

export async function updateProducto(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  // Se guarda antes de sobrescribir: es lo único que permite saber después
  // qué archivos dejaron de estar en el producto (y por lo tanto hay que
  // borrar de Cloudinary, o quedan huérfanos ahí para siempre).
  const previous = await prisma.product.findUnique({
    where: { id },
    select: { imagenes: true, videos: true },
  });
  try {
    await prisma.product.update({
      where: { id },
      data: { slug: parsed.data.slug, ...toData(parsed.data) },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: "Ya existe un producto con ese slug." };
    }
    throw e;
  }
  if (previous) {
    const prevImagenes = (previous.imagenes as unknown as string[]) ?? [];
    const prevVideos = (previous.videos as unknown as string[]) ?? [];
    const removidas = [
      ...prevImagenes.filter((u) => !parsed.data.imagenes.includes(u)),
      ...prevVideos.filter((u) => !parsed.data.videos.includes(u)),
    ];
    await destroyCloudinaryAssets(removidas);
  }
  revalidate();
  return { ok: true };
}

export async function deleteProducto(id: string): Promise<ActionResult> {
  await requireAdmin();
  const producto = await prisma.product.findUnique({
    where: { id },
    select: { imagenes: true, videos: true },
  });
  await prisma.product.delete({ where: { id } });
  if (producto) {
    const urls = [
      ...(((producto.imagenes as unknown as string[]) ?? [])),
      ...(((producto.videos as unknown as string[]) ?? [])),
    ];
    await destroyCloudinaryAssets(urls);
  }
  revalidate();
  return { ok: true };
}

/**
 * Firma una subida directa a Cloudinary (imagen o video). Organiza los
 * archivos en una carpeta por tipo de producto (`topwigs/pelucas`,
 * `topwigs/lentes`, …). El slug se valida contra la base de datos: el cliente
 * no puede inventarse una carpeta.
 */
export async function signCloudinaryUpload(
  resourceType: "image" | "video",
  tipoSlug: string,
) {
  await requireAdmin();
  if (!cloudinaryConfigured()) {
    return { ok: false as const, error: "cloudinary_missing" };
  }
  const tipo = await prisma.productType.findUnique({
    where: { slug: tipoSlug },
    select: { slug: true },
  });
  if (!tipo) {
    return { ok: false as const, error: "tipo_desconocido" };
  }
  const timestamp = Math.round(Date.now() / 1000);
  const folder = `topwigs/${tipo.slug}`;
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
    resourceType,
  };
}
