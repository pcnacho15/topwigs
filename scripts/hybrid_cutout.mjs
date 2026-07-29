import sharp from "sharp";
import path from "node:path";

/**
 * Recorte híbrido:
 *  - Base = flood-fill por bordes (conserva TODO el diseño, sin halo).
 *  - Extra = quita los "bolsillos" de fondo interiores (p. ej. el hueco
 *    entre las piernas) usando la máscara de rembg, PERO solo en píxeles
 *    claros. Así no borra props oscuros (mazas, cadenas) que rembg pudo
 *    haber recortado de más, ni los blancos de diseño (delantal, ojos),
 *    que rembg marca como sujeto.
 *
 * Requiere que la máscara rembg ya exista en <dir>/<name>.png (se
 * sobrescribe con el resultado final).
 */
async function hybrid(dir, name) {
  const src = path.join(dir, `${name}.jpeg`);
  const rembgPng = path.join(dir, `${name}.png`);

  const T = 222; // umbral flood-fill (claro por canal)
  const maxSpread = 26; // near-gray
  const featherLo = 200;
  const lightMin = 205; // "claro" para permitir borrado por máscara rembg

  const { data, info } = await sharp(src)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const N = width * height;

  // Alpha de rembg (mismo tamaño)
  const rb = await sharp(rembgPng)
    .resize(width, height, { fit: "fill" })
    .ensureAlpha()
    .raw()
    .toBuffer();

  const idx = (x, y) => (y * width + x) * 4;
  const isLight = (p) => {
    const r = data[p],
      g = data[p + 1],
      b = data[p + 2];
    return Math.min(r, g, b) >= T && Math.max(r, g, b) - Math.min(r, g, b) <= maxSpread;
  };

  // --- Flood-fill desde bordes ---
  const bg = new Uint8Array(N);
  const stack = [];
  const push = (x, y) => {
    const flat = y * width + x;
    if (bg[flat]) return;
    if (isLight(idx(x, y))) {
      bg[flat] = 1;
      stack.push(flat);
    }
  };
  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
  }
  while (stack.length) {
    const flat = stack.pop();
    const x = flat % width;
    const y = (flat - x) / width;
    if (x > 0) push(x - 1, y);
    if (x < width - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < height - 1) push(x, y + 1);
  }

  // --- Composición del alpha final ---
  let removed = 0;
  for (let flat = 0; flat < N; flat++) {
    const p = flat * 4;
    const r = data[p],
      g = data[p + 1],
      b = data[p + 2];
    const mn = Math.min(r, g, b);

    if (bg[flat]) {
      data[p + 3] = 0;
      removed++;
      continue;
    }

    // Bolsillo interior: rembg dice fondo (alpha bajo) y el píxel es claro
    const rembgBg = rb[p + 3] < 110;
    if (rembgBg && mn > lightMin) {
      data[p + 3] = 0;
      removed++;
      continue;
    }

    // Feather del borde flood-fill para evitar halo blanco
    if (mn > featherLo) {
      const x = flat % width;
      const y = (flat - x) / width;
      const touchesBg =
        (x > 0 && bg[flat - 1]) ||
        (x < width - 1 && bg[flat + 1]) ||
        (y > 0 && bg[flat - width]) ||
        (y < height - 1 && bg[flat + width]);
      if (touchesBg) {
        const t = (mn - featherLo) / (255 - featherLo);
        data[p + 3] = Math.round(255 * (1 - t));
      }
    }
  }

  await sharp(data, { raw: { width, height, channels: 4 } })
    .png()
    .toFile(rembgPng);
  console.log(
    `${name}.png — ${width}x${height}, fondo removido ${((removed / N) * 100).toFixed(1)}%`,
  );
}

const dir = process.argv[2];
for (const name of process.argv.slice(3)) await hybrid(dir, name);
