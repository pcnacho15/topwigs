import { z } from "zod";

/**
 * El slug de un tipo de producto es una ruta de primer nivel (`/pelucas`), así
 * que no puede chocar con las páginas que ya existen o el catálogo taparía a
 * la página real.
 */
export const SLUGS_RESERVADOS = [
  "admin",
  "api",
  "producto",
  "checkout",
  "cuenta",
  "login",
  "registro",
  "estilo",
  "catalogo",
  "carrito",
] as const;

export const productTypeSchema = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres").max(40),
  label: z.string().min(2, "Mínimo 2 caracteres").max(40),
  slug: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(40)
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones")
    .refine(
      (s) => !SLUGS_RESERVADOS.includes(s as (typeof SLUGS_RESERVADOS)[number]),
      "Ese slug lo usa otra página del sitio. Elige otro.",
    ),
  descripcion: z.string().max(200, "Máximo 200 caracteres"),
  orden: z.number().int().min(0),
  activo: z.boolean(),
});

export type ProductTypeInput = z.infer<typeof productTypeSchema>;
