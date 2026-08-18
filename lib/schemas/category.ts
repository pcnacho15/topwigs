import { z } from "zod";

export const categorySchema = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres").max(60),
  slug: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  imagen: z.string().url().nullable(),
  orden: z.number().int().min(0),
  activa: z.boolean(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
