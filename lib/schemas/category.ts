import { z } from "zod";

/**
 * Una característica de la ficha informativa de la categoría (p. ej.
 * "Lace front pequeño"): título, foto opcional con su pie y puntos clave.
 * La numeración ① ② se deriva del orden, no se guarda.
 */
export const caracteristicaSchema = z.object({
  titulo: z.string().trim().min(1, "Escribe el título de la característica").max(80),
  imagen: z.string().url().nullable(),
  pieImagen: z.string().trim().max(160, "Máximo 160 caracteres"),
  puntos: z
    .array(z.string().trim().min(1, "Escribe el texto del punto o bórralo").max(200))
    .min(1, "Agrega al menos un punto"),
});

export type Caracteristica = z.infer<typeof caracteristicaSchema>;

export const categorySchema = z.object({
  /** Catálogo al que pertenece la categoría (y, por herencia, sus productos). */
  productTypeId: z.string().min(1, "Selecciona un tipo de producto"),
  nombre: z.string().min(2, "Mínimo 2 caracteres").max(60),
  slug: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  imagen: z.string().url().nullable(),
  orden: z.number().int().min(0),
  activa: z.boolean(),
  destacada: z.boolean(),
  resumen: z.string().trim().max(200, "Máximo 200 caracteres"),
  caracteristicas: z.array(caracteristicaSchema).max(10, "Máximo 10 características"),
});

export type CategoryInput = z.infer<typeof categorySchema>;
