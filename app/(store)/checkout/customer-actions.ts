"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth-guard";
import {
  customerInfoSchema,
  type CustomerInfo,
} from "@/lib/schemas/customer-info";

/**
 * Copia en la cuenta de los datos de facturación que el cliente marcó como
 * "guardar". Los invitados solo tienen la copia de localStorage; para quien
 * tiene sesión, esta es la que sobrevive al cambio de dispositivo.
 *
 * Todas las acciones derivan el usuario de la sesión (nunca del cliente) y
 * son no-op silenciosas sin sesión: el checkout las llama siempre, tenga o
 * no cuenta el comprador.
 */

const select = {
  nombre: true,
  email: true,
  telefono: true,
  direccion: true,
  departamento: true,
  municipio: true,
  barrio: true,
  indicaciones: true,
} as const;

/** Datos guardados del usuario en sesión, o `null` (sin sesión o sin guardar). */
export async function getSavedCustomerInfo(): Promise<CustomerInfo | null> {
  const session = await getSession();
  if (!session) return null;
  return prisma.savedAddress.findUnique({
    where: { userId: session.user.id },
    select,
  });
}

export interface CheckoutPrefill {
  /** Hay sesión iniciada: cambia el texto de "guardar" y habilita la copia en cuenta. */
  conCuenta: boolean;
  /** Datos guardados en la cuenta, o `null`. */
  guardados: CustomerInfo | null;
  /** Nombre y correo de la sesión, para cuando no hay nada guardado todavía. */
  sugerencia: { nombre: string; email: string } | null;
}

/**
 * Todo lo que el checkout necesita saber del usuario en un solo viaje: si
 * tiene sesión, qué guardó antes, y con qué prellenar si no guardó nada.
 */
export async function getCheckoutPrefill(): Promise<CheckoutPrefill> {
  const session = await getSession();
  if (!session) return { conCuenta: false, guardados: null, sugerencia: null };

  const guardados = await prisma.savedAddress.findUnique({
    where: { userId: session.user.id },
    select,
  });

  return {
    conCuenta: true,
    guardados,
    sugerencia: guardados
      ? null
      : { nombre: session.user.name ?? "", email: session.user.email ?? "" },
  };
}

export type SaveResult =
  | { ok: true; saved: boolean }
  | { ok: false; error: string };

/**
 * Guarda (o reemplaza) los datos del usuario en sesión.
 * `saved: false` significa "no había sesión": el llamador ya persistió la
 * copia local, así que no es un error.
 */
export async function saveCustomerInfo(input: unknown): Promise<SaveResult> {
  const parsed = customerInfoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const session = await getSession();
  if (!session) return { ok: true, saved: false };

  const data = parsed.data;
  await prisma.savedAddress.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...data },
    update: data,
  });

  revalidatePath("/cuenta");
  return { ok: true, saved: true };
}

/** Borra los datos guardados del usuario en sesión. */
export async function deleteSavedCustomerInfo(): Promise<{ ok: true }> {
  const session = await getSession();
  if (session) {
    // deleteMany: no falla si el usuario nunca guardó nada.
    await prisma.savedAddress.deleteMany({ where: { userId: session.user.id } });
    revalidatePath("/cuenta");
  }
  return { ok: true };
}
