import "server-only";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM ?? "TOPWIGS <onboarding@resend.dev>";

const copFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

interface OrderItem {
  slug: string;
  nombre: string;
  precio: number;
  colorNombre: string | null;
  qty: number;
}

interface OrderStatusEmailParams {
  to: string;
  customerName: string;
  reference: string;
  subtotalCop: number;
  shippingCop: number;
  totalCop: number;
  items: OrderItem[];
  status: "APPROVED" | "DECLINED" | "VOIDED" | "ERROR";
}

/**
 * Envía el correo de agradecimiento (pago aprobado) o de aviso de rechazo.
 * No lanza: un fallo en el envío no debe romper el flujo de pago, solo se
 * registra en logs (el estado del pedido ya quedó guardado en la DB).
 */
export async function sendOrderStatusEmail(params: OrderStatusEmailParams): Promise<void> {
  if (!resend) {
    console.error(
      `Resend no configurado (falta RESEND_API_KEY): no se envió correo para el pedido ${params.reference}.`,
    );
    return;
  }

  const isApproved = params.status === "APPROVED";
  const subject = isApproved
    ? `¡Gracias por tu compra! Pedido ${params.reference} — TOPWIGS`
    : `Tu pago no fue aprobado — pedido ${params.reference} — TOPWIGS`;

  try {
    await resend.emails.send({
      from: FROM,
      to: params.to,
      subject,
      html: buildOrderEmailHtml(params, isApproved),
    });
  } catch (err) {
    console.error(`Error enviando correo de pedido ${params.reference}:`, err);
  }
}

function buildOrderEmailHtml(params: OrderStatusEmailParams, isApproved: boolean): string {
  const rows = params.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;color:#e5e5e5;">${escapeHtml(item.nombre)}${
            item.colorNombre ? ` <span style="color:#999;">(${escapeHtml(item.colorNombre)})</span>` : ""
          }</td>
          <td style="padding:8px 0;color:#999;text-align:center;">x${item.qty}</td>
          <td style="padding:8px 0;color:#e5e5e5;text-align:right;">${copFormatter.format(
            item.precio * item.qty,
          )}</td>
        </tr>`,
    )
    .join("");

  const heading = isApproved ? "¡Gracias por tu compra!" : "Tu pago no fue aprobado";
  const message = isApproved
    ? "Confirmamos que tu pago fue aprobado y ya estamos preparando tu pedido. Te avisaremos cuando salga hacia tu dirección."
    : "No pudimos procesar el pago de este pedido. Tu carrito no fue afectado, puedes intentarlo de nuevo desde nuestra tienda cuando quieras.";
  const accent = isApproved ? "#39ff88" : "#ff4d4d";

  return `
  <div style="background:#0a0a0d;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:520px;margin:0 auto;background:#111114;border:1px solid #26262b;border-radius:12px;padding:32px;">
      <h1 style="color:${accent};font-size:22px;margin:0 0 8px;">${heading}</h1>
      <p style="color:#c9c9c9;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Hola ${escapeHtml(params.customerName)}, ${message}
      </p>
      <table style="width:100%;border-collapse:collapse;">${rows}</table>
      <div style="border-top:1px solid #26262b;margin-top:16px;padding-top:16px;">
        <div style="display:flex;justify-content:space-between;color:#999;font-size:13px;padding:2px 0;">
          <span>Subtotal</span>
          <span style="float:right;">${copFormatter.format(params.subtotalCop)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;color:#999;font-size:13px;padding:2px 0;">
          <span>Envío · Interrápidísimo</span>
          <span style="float:right;">${
            params.shippingCop === 0
              ? "Gratis"
              : copFormatter.format(params.shippingCop)
          }</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding-top:8px;">
          <span style="color:#999;font-size:13px;">Total</span>
          <span style="color:#fff;font-weight:bold;font-size:16px;float:right;">${copFormatter.format(
            params.totalCop,
          )}</span>
        </div>
      </div>
      <p style="color:#666;font-size:11px;letter-spacing:0.05em;text-transform:uppercase;margin-top:24px;">
        Pedido ${params.reference}
      </p>
    </div>
  </div>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
