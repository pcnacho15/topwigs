"use client";

import {
  customerInfoSchema,
  type CustomerInfo,
} from "@/lib/schemas/customer-info";

/**
 * Persistencia local de los datos de facturación ("Guardar mi información").
 *
 * Vive en el navegador para que también funcione con invitados, sin cuenta.
 * Si además hay sesión, el checkout guarda una copia en la BD (ver
 * `checkout/customer-actions.ts`) y esa copia manda, porque viaja entre
 * dispositivos.
 */
const STORAGE_KEY = "topwigs.customer";
const STORAGE_VERSION = 1;

/** Lee los datos guardados en este navegador. `null` si no hay o están rotos. */
export function readLocalCustomerInfo(): CustomerInfo | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.v !== STORAGE_VERSION) return null;
    const result = customerInfoSchema.safeParse(parsed.info);
    return result.success ? result.data : null;
  } catch {
    // storage no disponible (modo incógnito estricto) o JSON corrupto
    return null;
  }
}

export function writeLocalCustomerInfo(info: CustomerInfo) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ v: STORAGE_VERSION, info }),
    );
  } catch {
    // sin persistencia: el checkout sigue funcionando igual
  }
}

export function clearLocalCustomerInfo() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // nada que limpiar
  }
}
