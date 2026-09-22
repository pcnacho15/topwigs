import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";

export interface PublicTestimonial {
  id: string;
  nombre: string;
  ubicacion: string;
  texto: string;
  rating: number;
  avatarUrl: string | null;
}

/** Testimonios activos para el Home, en el orden que definió el admin. */
export const getTestimonials = cache(
  async (): Promise<PublicTestimonial[]> => {
    const rows = await prisma.testimonial.findMany({
      where: { activo: true },
      orderBy: { orden: "asc" },
      select: {
        id: true,
        nombre: true,
        ubicacion: true,
        texto: true,
        rating: true,
        avatarUrl: true,
      },
    });
    return rows;
  },
);
