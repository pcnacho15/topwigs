import type { PublicProduct } from "@/lib/public-product";
import { AccordionItem } from "@/components/ui/accordion";
import { Star } from "@/components/icons";

/**
 * Descripción, características y tips del producto en un acordeón (en vez
 * de mostrarlos siempre abiertos junto al botón de compra): así la ficha
 * del producto no queda saturada de texto, y el admin puede agregar tips
 * de cuidado sin que ocupen espacio permanente.
 */
export function ProductInfoAccordion({ product }: { product: PublicProduct }) {
  return (
    <div className="mx-auto max-w-2xl">
      <AccordionItem title="Descripción" defaultOpen>
        <p className="leading-relaxed">{product.descripcion}</p>
      </AccordionItem>

      {product.features.length > 0 ? (
        <AccordionItem title="Características">
          <ul className="space-y-2">
            {product.features.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Star className="size-4 shrink-0 fill-neon text-neon" />
                {f}
              </li>
            ))}
          </ul>
        </AccordionItem>
      ) : null}

      {product.tips.length > 0 ? (
        <AccordionItem title="Tips de cuidado">
          <ul className="space-y-2">
            {product.tips.map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Star className="size-4 shrink-0 fill-violeta text-violeta" />
                {t}
              </li>
            ))}
          </ul>
        </AccordionItem>
      ) : null}
    </div>
  );
}
