import { z } from "zod";

const hex = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Color hex inválido");

/** Un color puede ser sólido (from) o degradado (from → to). */
export const colorSpecSchema = z
  .object({
    nombre: z.string().min(1, "Requerido"),
    tipo: z.enum(["solid", "gradient"]),
    from: hex,
    to: hex.nullable(),
  })
  .refine((c) => c.tipo === "solid" || (c.to != null && c.to !== ""), {
    message: "El degradado necesita un segundo color",
    path: ["to"],
  });

export type ColorSpec = z.infer<typeof colorSpecSchema>;

export const productSchema = z
  .object({
    nombre: z.string().min(2, "Mínimo 2 caracteres").max(80),
    slug: z
      .string()
      .min(2)
      .max(80)
      .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
    tipo: z.enum(["peluca", "lente"]),
    descripcion: z.string().min(10, "Mínimo 10 caracteres"),
    categoryId: z.string().min(1, "Selecciona una categoría"),
    precioCop: z.number().int().min(0, "Precio inválido"),
    precioOfertaCop: z.number().int().min(0).nullable(),
    rating: z.number().min(0).max(5),
    reviews: z.number().int().min(0),
    nuevo: z.boolean(),
    activo: z.boolean(),
    colores: z.array(colorSpecSchema).min(1, "Agrega al menos un color"),
    features: z.array(z.string().min(1)),
    imagenes: z.array(z.string().url()),
    videos: z.array(z.string().url()),
  })
  .refine(
    (p) => p.precioOfertaCop == null || p.precioOfertaCop < p.precioCop,
    {
      message: "La oferta debe ser menor al precio",
      path: ["precioOfertaCop"],
    },
  );

export type ProductInput = z.infer<typeof productSchema>;
