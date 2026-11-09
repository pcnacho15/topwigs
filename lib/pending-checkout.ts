/**
 * Referencia del último checkout iniciado en este navegador y aún sin
 * pagar. Permite que, si la persona vuelve de Wompi sin pagar y reintenta,
 * el servidor libere su reserva anterior en vez de bloquearla contra sí
 * misma (ver `lib/stock-reservations.ts`). Solo cliente.
 */
const KEY = "topwigs.pendingCheckout";

export function readPendingCheckout(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function writePendingCheckout(reference: string): void {
  try {
    localStorage.setItem(KEY, reference);
  } catch {
    // sin persistencia: en el peor caso su reserva vence sola
  }
}

export function clearPendingCheckout(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // nada que limpiar
  }
}
