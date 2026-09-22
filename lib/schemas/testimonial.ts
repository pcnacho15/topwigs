import { z } from "zod";

export const testimonialSchema = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres").max(60),
  ubicacion: z.string().max(60),
  texto: z.string().min(10, "Mínimo 10 caracteres").max(500),
  rating: z.number().int().min(1).max(5),
  avatarUrl: z.url().nullable(),
  orden: z.number().int().min(0),
  activo: z.boolean(),
});

export type TestimonialInput = z.infer<typeof testimonialSchema>;
