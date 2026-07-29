import sharp from "sharp";
import path from "node:path";

/**
 * Recorta el fondo (blanco/claro) de una ilustración con contorno oscuro.
 * Estrategia: flood-fill desde los bordes sobre píxeles "casi blancos".
 * Solo el fondo contiguo al borde se vuelve transparente; los blancos
 * internos (camisas, delantales, ojos) quedan intactos porque el contorno
 * negro detiene el flood.
 */
async function cutout(input, output, opts = {}) {
  const T = opts.threshold ?? 222; // umbral de "claro" por canal
  const maxSpread = opts.maxSpread ?? 26; // diferencia máx entre canales (near-gray)
  const featherLo = opts.featherLo ?? 200; // inicio del degradado de borde

  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const N = width * height;
  const alpha0 = new Uint8Array(N); // 1 = fondo (transparente)
  const stack = [];

  const idx = (x, y) => (y * width + x) * 4;
  const isLight = (p) => {
    const r = data[p],
      g = data[p + 1],
      b = data[p + 2];
    const mn = Math.min(r, g, b);
    const mx = Math.max(r, g, b);
    return mn >= T && mx - mn <= maxSpread;
  };

  const push = (x, y) => {
    const flat = y * width + x;
    if (alpha0[flat]) return;
    if (isLight(idx(x, y))) {
      alpha0[flat] = 1;
      stack.push(flat);
    }
  };

  // Semillas: todo el marco exterior
  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
  }

  // BFS 4-vecinos
  while (stack.length) {
    const flat = stack.pop();
    const x = flat % width;
    const y = (flat - x) / width;
    if (x > 0) push(x - 1, y);
    if (x < width - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < height - 1) push(x, y + 1);
  }

  // Aplica transparencia + feather en el borde para reducir halo blanco
  let removed = 0;
  for (let flat = 0; flat < N; flat++) {
    const p = flat * 4;
    if (alpha0[flat]) {
      data[p + 3] = 0;
      removed++;
      continue;
    }
    // Suaviza píxeles claros que tocan el fondo transparente
    const x = flat % width;
    const y = (flat - x) / width;
    const r = data[p],
      g = data[p + 1],
      b = data[p + 2];
    const mn = Math.min(r, g, b);
    if (mn > featherLo) {
      const touchesBg =
        (x > 0 && alpha0[flat - 1]) ||
        (x < width - 1 && alpha0[flat + 1]) ||
        (y > 0 && alpha0[flat - width]) ||
        (y < height - 1 && alpha0[flat + width]);
      if (touchesBg) {
        // cuanto más claro, más transparente (255→~0, featherLo→255)
        const t = (mn - featherLo) / (255 - featherLo);
        data[p + 3] = Math.round(255 * (1 - t));
      }
    }
  }

  await sharp(data, { raw: { width, height, channels: 4 } })
    .png()
    .toFile(output);

  const pct = ((removed / N) * 100).toFixed(1);
  console.log(`${path.basename(output)} — ${width}x${height}, fondo removido ${pct}%`);
}

const dir = process.argv[2];
const names = process.argv.slice(3);
for (const name of names) {
  await cutout(
    path.join(dir, `${name}.jpeg`),
    path.join(dir, `${name}.png`),
  );
}
