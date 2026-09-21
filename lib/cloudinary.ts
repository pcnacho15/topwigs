import "server-only";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export function cloudinaryConfigured(): boolean {
  return (
    !!process.env.CLOUDINARY_CLOUD_NAME &&
    !!process.env.CLOUDINARY_API_KEY &&
    !!process.env.CLOUDINARY_API_SECRET
  );
}

/**
 * Extrae el `public_id` (con carpeta) y el resource_type de una URL de
 * Cloudinary, p. ej. `https://res.cloudinary.com/<cloud>/image/upload/
 * v169.../topwigs/pelucas/abc123.jpg` → `{ publicId: "topwigs/pelucas/abc123",
 * resourceType: "image" }`. `null` si la URL no es de Cloudinary o no tiene
 * la forma esperada.
 */
export function cloudinaryPublicIdFromUrl(
  url: string,
): { publicId: string; resourceType: "image" | "video" } | null {
  try {
    const u = new URL(url);
    if (!u.hostname.endsWith("res.cloudinary.com")) return null;
    const parts = u.pathname.split("/").filter(Boolean);
    const resourceTypeIdx = parts.findIndex((p) => p === "image" || p === "video");
    if (resourceTypeIdx === -1) return null;
    const resourceType = parts[resourceTypeIdx] as "image" | "video";
    const uploadIdx = parts.indexOf("upload", resourceTypeIdx);
    if (uploadIdx === -1) return null;
    let rest = parts.slice(uploadIdx + 1);
    // La versión ("v1699999999") es opcional en la URL: se descarta si está.
    if (rest[0] && /^v\d+$/.test(rest[0])) rest = rest.slice(1);
    if (rest.length === 0) return null;
    const last = rest[rest.length - 1].replace(/\.[a-zA-Z0-9]+$/, "");
    const publicId = [...rest.slice(0, -1), last].join("/");
    return { publicId, resourceType };
  } catch {
    return null;
  }
}

/**
 * Borra en Cloudinary los archivos detrás de estas URLs (best-effort: un
 * fallo puntual no debe tumbar el guardado/borrado del producto que lo pidió).
 */
export async function destroyCloudinaryAssets(urls: string[]): Promise<void> {
  if (!cloudinaryConfigured() || urls.length === 0) return;
  await Promise.all(
    urls.map(async (url) => {
      const parsed = cloudinaryPublicIdFromUrl(url);
      if (!parsed) return;
      try {
        await cloudinary.uploader.destroy(parsed.publicId, {
          resource_type: parsed.resourceType,
        });
      } catch (e) {
        console.error(`No se pudo borrar ${url} de Cloudinary`, e);
      }
    }),
  );
}
