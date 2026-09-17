import "server-only";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM ?? "TOPWIGS <pedidos@topwigs.co>";
const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://topwigs.co";
const WHATSAPP_URL = "https://api.whatsapp.com/send?phone=573005522419";

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
  direccion: string;
  barrio: string;
  municipio: string;
  departamento: string;
  indicaciones?: string | null;
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
    ? `¡Gracias por tu compra! · ${params.reference} — TOPWIGS`
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
      (item, i) => `
        <tr>
          <td style="padding:12px 0;border-top:1px solid #eeeeee;color:#171319;font-size:14px;font-family:Arial,Helvetica,sans-serif;">
            ${escapeHtml(item.nombre)}${
              item.colorNombre
                ? `<br/><span style="color:#8a8390;font-size:12px;">${escapeHtml(item.colorNombre)}</span>`
                : ""
            }
          </td>
          <td style="padding:12px 0;border-top:1px solid #eeeeee;color:#8a8390;font-size:14px;font-family:Arial,Helvetica,sans-serif;text-align:center;">
            x${item.qty}
          </td>
          <td style="padding:12px 0;border-top:1px solid #eeeeee;color:#171319;font-size:14px;font-family:Arial,Helvetica,sans-serif;text-align:right;white-space:nowrap;">
            ${copFormatter.format(item.precio * item.qty)}
          </td>
        </tr>`,
    )
    .join("");

  const heading = isApproved ? "¡Pedido confirmado!" : "Tu pago no fue aprobado";
  const message = isApproved
    ? "Confirmamos que tu pago fue aprobado y ya estamos preparando tu pedido. Te avisaremos cuando salga hacia tu dirección. ¡Gracias por tu compra!"
    : "No pudimos procesar el pago de este pedido. Tu carrito no fue afectado, puedes intentarlo de nuevo desde nuestra tienda cuando quieras.";
  const badgeColor = isApproved ? "#16a34a" : "#dc2626";
  const badgeBg = isApproved ? "#f0fdf4" : "#fef2f2";
  const badgeLabel = isApproved ? "Pago aprobado" : "Pago rechazado";
  const ctaLabel = isApproved ? "Ver más productos" : "Volver a la tienda";

  const direccionLinea = [params.barrio, params.municipio, params.departamento]
    .filter(Boolean)
    .join(", ");

  const shippingSection = isApproved
    ? `
      <tr>
        <td style="padding:24px 32px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f2f7;border-radius:8px;">
            <tr>
              <td style="padding:16px 20px;">
                <p style="margin:0 0 6px;color:#706a78;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;">
                  Dirección de envío
                </p>
                <p style="margin:0;color:#171319;font-size:14px;line-height:1.5;font-family:Arial,Helvetica,sans-serif;">
                  ${escapeHtml(params.customerName)}<br/>
                  ${escapeHtml(params.direccion)}<br/>
                  ${escapeHtml(direccionLinea)}
                  ${
                    params.indicaciones
                      ? `<br/><span style="color:#706a78;">${escapeHtml(params.indicaciones)}</span>`
                      : ""
                  }
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    : "";

  return `
  <div style="background-color:#f4f0f3;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #eeeeee;">
      <tr>
        <td style="padding:28px 32px;text-align:center;border-bottom:1px solid #eeeeee;">
          <span style="font-family:Arial,Helvetica,sans-serif;font-weight:900;font-style:italic;font-size:24px;letter-spacing:0.02em;">
            <span style="color:#ff2f92;">TOP</span><span style="color:#171319;">WIGS</span>
          </span>
        </td>
      </tr>

      <tr>
        <td style="padding:32px 32px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="background-color:${badgeBg};border-radius:20px;padding:6px 14px;">
                <span style="color:${badgeColor};font-size:12px;font-weight:bold;font-family:Arial,Helvetica,sans-serif;">
                  ${badgeLabel}
                </span>
              </td>
            </tr>
          </table>
          <h1 style="color:#171319;font-size:22px;margin:16px 0 8px;font-family:Arial,Helvetica,sans-serif;">${heading}</h1>
          <p style="color:#706a78;font-size:14px;line-height:1.6;margin:0;font-family:Arial,Helvetica,sans-serif;">
            Hola ${escapeHtml(params.customerName)}, ${message}
          </p>
        </td>
      </tr>

      <tr>
        <td style="padding:24px 32px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${rows}
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
            <tr>
              <td style="padding:6px 0;color:#706a78;font-size:13px;font-family:Arial,Helvetica,sans-serif;">Subtotal</td>
              <td style="padding:6px 0;color:#171319;font-size:13px;text-align:right;font-family:Arial,Helvetica,sans-serif;">${copFormatter.format(params.subtotalCop)}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#706a78;font-size:13px;font-family:Arial,Helvetica,sans-serif;">Envío</td>
              <td style="padding:6px 0;color:#171319;font-size:13px;text-align:right;font-family:Arial,Helvetica,sans-serif;">${
                params.shippingCop === 0 ? "Gratis" : copFormatter.format(params.shippingCop)
              }</td>
            </tr>
            <tr>
              <td style="padding:12px 0 0;border-top:1px solid #eeeeee;color:#171319;font-size:15px;font-weight:bold;font-family:Arial,Helvetica,sans-serif;">Total</td>
              <td style="padding:12px 0 0;border-top:1px solid #eeeeee;color:#171319;font-size:15px;font-weight:bold;text-align:right;font-family:Arial,Helvetica,sans-serif;">${copFormatter.format(params.totalCop)}</td>
            </tr>
          </table>
        </td>
      </tr>

      ${shippingSection}

      <tr>
        <td style="padding:28px 32px;text-align:center;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
            <tr>
              <td style="background-color:#171319;border-radius:8px;">
                <a href="${SITE_URL}" style="display:inline-block;padding:12px 28px;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">
                  ${ctaLabel}
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <tr>
        <td style="padding:20px 32px;background-color:#faf7f9;border-top:1px solid #eeeeee;text-align:center;">
          <p style="margin:0 0 4px;color:#706a78;font-size:12px;font-family:Arial,Helvetica,sans-serif;">
            Pedido ${escapeHtml(params.reference)}
          </p>
          <p style="margin:0;color:#706a78;font-size:12px;font-family:Arial,Helvetica,sans-serif;">
            ¿Dudas? Escríbenos por <a href="${WHATSAPP_URL}" style="color:#ff2f92;text-decoration:none;">WhatsApp</a>
          </p>
        </td>
      </tr>
    </table>
  </div>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
