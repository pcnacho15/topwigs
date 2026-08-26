import { ANNOUNCEMENT } from "@/data/site";
import { Package } from "../icons";
import { Package2, TruckElectric } from "lucide-react";

/** Cuántas veces se repite el mensaje dentro de cada copia del track: con
 * pocas repeticiones el texto no alcanza a cubrir una pantalla ancha y se
 * verían huecos entre pasadas. */
const REPETICIONES = 4;

/**
 * Cinta de anuncio del header: el mensaje se desplaza en bucle de izquierda
 * a derecha. Es CSS puro (`animate-marquee`), sin JS ni estado.
 *
 * El track se duplica para que el bucle sea continuo; todo él va
 * `aria-hidden` y el mensaje se expone una sola vez a lectores de pantalla.
 */
export function AnnouncementBar() {
  return (
    <div className="overflow-hidden border-b border-neon/25 bg-linear-to-r from-violeta/50 via-neon/80 to-violeta/50 py-1.5">
      <span className="sr-only">{ANNOUNCEMENT}</span>
      <div
        aria-hidden
        className="flex w-max animate-marquee motion-reduce:animate-none"
      >
        {[0, 1].map((copia) => (
          <div
            key={copia}
            className="flex shrink-0"
          >
            {Array.from({ length: REPETICIONES }, (_, i) => (
              <span
                key={i}
                className="flex gap-7 sm:gap-10 items-center px-4 sm:px-6 font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-white/90"
              >
                {ANNOUNCEMENT}
                <TruckElectric size={20} />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
