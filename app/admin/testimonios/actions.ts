"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import {
  cloudinary,
  cloudinaryConfigured,
  destroyCloudinaryAssets,
} from "@/lib/cloudinary";
import { testimonialSchema } from "@/lib/schemas/testimonial";

export type ActionResult = { ok: true } | { ok: false; error: string };

function revalidate() {
  revalidatePath("/admin/testimonios");
  revalidatePath("/");
}

export async function createTestimonio(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = testimonialSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  await prisma.testimonial.create({ data: parsed.data });
  revalidate();
  return { ok: true };
}

export async function updateTestimonio(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = testimonialSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const previous = await prisma.testimonial.findUnique({
    where: { id },
    select: { avatarUrl: true },
  });
  await prisma.testimonial.update({ where: { id }, data: parsed.data });
  if (previous?.avatarUrl && previous.avatarUrl !== parsed.data.avatarUrl) {
    await destroyCloudinaryAssets([previous.avatarUrl]);
  }
  revalidate();
  return { ok: true };
}

export async function deleteTestimonio(id: string): Promise<ActionResult> {
  await requireAdmin();
  const testimonio = await prisma.testimonial.findUnique({
    where: { id },
    select: { avatarUrl: true },
  });
  await prisma.testimonial.delete({ where: { id } });
  if (testimonio?.avatarUrl) {
    await destroyCloudinaryAssets([testimonio.avatarUrl]);
  }
  revalidate();
  return { ok: true };
}

/** Firma una subida directa a Cloudinary de la foto del cliente. */
export async function signTestimonialAvatarUpload() {
  await requireAdmin();
  if (!cloudinaryConfigured()) {
    return { ok: false as const, error: "cloudinary_missing" };
  }
  const timestamp = Math.round(Date.now() / 1000);
  const folder = "topwigs/testimonios";
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
