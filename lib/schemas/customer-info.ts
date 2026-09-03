import { z } from "zod";

/**
 * Datos de facturación / envío del cliente. Es la misma forma que viaja al
 * checkout, que se guarda en localStorage y que se persiste en la BD, para
 * que las tres fuentes sean intercambiables sin adaptadores.
 */
export const customerInfoSchema = z.object({
  nombre: z.string().trim().min(2, "Mínimo 2 caracteres").max(120),
  email: z.email("Correo inválido").max(160),
  telefono: z.string().trim().min(7, "Teléfono inválido").max(30),
  direccion: z.string().trim().min(4, "Dirección muy corta").max(200),
  departamento: z.string().trim().min(2, "Mínimo 2 caracteres").max(80),
  municipio: z.string().trim().min(2, "Mínimo 2 caracteres").max(80),
  barrio: z.string().trim().min(2, "Mínimo 2 caracteres").max(80),
  indicaciones: z.string().trim().max(500).default(""),
});

export type CustomerInfo = z.infer<typeof customerInfoSchema>;

export const EMPTY_CUSTOMER_INFO: CustomerInfo = {
  nombre: "",
  email: "",
  telefono: "",
  direccion: "",
  departamento: "",
  municipio: "",
  barrio: "",
  indicaciones: "",
};
