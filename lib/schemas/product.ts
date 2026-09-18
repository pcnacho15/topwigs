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
    /** Subconjunto de `imagenes`/`videos` del producto que se muestra al
     * elegir este color. Vacío = la galería queda sin medios. Los colores
     * guardados antes de esta función se normalizan al leerlos. */
    imagenes: z.array(z.url()),
    videos: z.array(z.url()),
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
    // El tipo de producto no se guarda aquí: lo define la categoría elegida.
    descripcion: z.string().min(10, "Mínimo 10 caracteres"),
    categoryId: z.string().min(1, "Selecciona una categoría"),
    precioCop: z.number().int().min(0, "Precio inválido"),
    precioOfertaCop: z.number().int().min(0).nullable(),
    nuevo: z.boolean(),
    stock: z.number().int().min(0, "No puede ser negativo"),
    activo: z.boolean(),
    colores: z.array(colorSpecSchema).min(1, "Agrega al menos un color"),
    features: z.array(z.string().min(1)),
    tips: z.array(z.string().min(1)),
    imagenes: z.array(z.url()),
    videos: z.array(z.url()),
  })
  .refine(
    (p) => p.precioOfertaCop == null || p.precioOfertaCop < p.precioCop,
    {
      message: "La oferta debe ser menor al precio",
      path: ["precioOfertaCop"],
    },
  )
  // Un color solo puede apuntar a medios que sigan en la galería del
  // producto (si se borra una imagen, el form limpia las asignaciones).
  .refine(
    (p) =>
      p.colores.every(
        (c) =>
          c.imagenes.every((u) => p.imagenes.includes(u)) &&
          c.videos.every((u) => p.videos.includes(u)),
      ),
    {
      message:
        "Un color tiene asignado un archivo que ya no está en la galería del producto",
      path: ["colores"],
    },
  );

export type ProductInput = z.infer<typeof productSchema>;
