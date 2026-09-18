import { z } from "zod";

export const reviewSchema = z.object({
  rating: z.number().int().min(1, "Selecciona una calificación").max(5),
  comentario: z.string().trim().max(1000, "Máximo 1000 caracteres"),
  imagenes: z.array(z.url()).max(4, "Máximo 4 imágenes"),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
