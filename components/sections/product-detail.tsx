"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { PublicProduct } from "@/lib/public-product";
import { colorToCss, descuentoPct } from "@/lib/public-product";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DiscountRibbon } from "@/components/ui/discount-ribbon";
import { PriceTag, formatCOP } from "@/components/ui/price";
import { RatingStars } from "@/components/ui/rating-stars";
import { HeartDrip, Minus, Plus } from "@/components/icons";
import { useCart } from "@/components/cart/cart-context";
import { ShippingEstimate } from "@/components/ui/shipping-estimate";
import type { DeliveryEstimate } from "@/lib/delivery";
import { cn } from "@/lib/utils";
import { ProductInfoAccordion } from "./product-info-accordion";

type Media = { type: "image" | "video"; url: string };

export function ProductDetail({
  product,
  envio,
}: {
  product: PublicProduct;
  envio: DeliveryEstimate;
}) {
  const { add, open } = useCart();
  const router = useRouter();
  const [color, setColor] = useState(0);
  const [qty, setQty] = useState(1);
  const [mediaIndex, setMediaIndex] = useState(0);

  const activeColor = product.colores[color];

  /**
   * La galería muestra solo los medios asignados al color elegido. Si el
   * producto no tiene colores, se usan los del producto completo; si el
   * color no tiene nada asignado, la galería queda vacía (placeholder).
   */
  const media: Media[] = useMemo(() => {
    const imagenes = activeColor ? activeColor.imagenes : product.imagenes;
    const videos = activeColor ? activeColor.videos : product.videos;
    return [
      ...imagenes.map((url) => ({ type: "image" as const, url })),
      ...videos.map((url) => ({ type: "video" as const, url })),
    ];
  }, [activeColor, product.imagenes, product.videos]);

  const activeCss = activeColor ? colorToCss(activeColor) : "#ff2f92";
  const desc = descuentoPct(product.precioCop, product.precioOfertaCop);
  const activeMedia = media[Math.min(mediaIndex, media.length - 1)];

  /** Al cambiar de color la galería es otra: vuelve al primer medio. */
  const handleColor = (i: number) => {
    setColor(i);
    setMediaIndex(0);
  };

  // Swipe táctil en la imagen/video principal (solo mobile: en desktop se
  // navega con las miniaturas). Un gesto mayormente vertical se ignora para
  // no robarle el scroll de la página al dedo.
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const SWIPE_THRESHOLD_PX = 40;

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || media.length < 2) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX || Math.abs(dx) < Math.abs(dy)) return;
    setMediaIndex((i) => (dx < 0 ? (i + 1) % media.length : (i - 1 + media.length) % media.length));
  };

  const buildItem = () => ({
    slug: product.slug,
    nombre: product.nombre,
    precio: product.precioOfertaCop ?? product.precioCop,
    colorNombre: activeColor?.nombre ?? "Único",
    colorHex: activeColor?.from ?? "#ff2f92",
    // La línea del carrito es un color concreto: se prefiere su primera
    // imagen y, si ese color no tiene ninguna, la primera del producto.
    imagen: activeColor?.imagenes[0] ?? product.imagenes[0],
  });
  const handleAdd = () => {
    add(buildItem(), qty);
    open();
  };
  const handleBuy = () => {
    add(buildItem(), qty);
    router.push("/checkout");
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      {/* Galería */}
      <div className="min-w-0 space-y-3">
        <div
          className="relative flex aspect-4/5 items-center justify-center overflow-hidden rounded-goth border border-linea bg-surface-1 touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={
            media.length === 0
              ? {
                  background: `radial-gradient(120% 100% at 50% 0%, ${activeCss}, var(--color-surface-3) 80%)`,
                }
              : undefined
          }
        >
          {product.agotado ? (
            <Badge
              tone="agotado"
              className="absolute left-4 top-4 z-10"
            >
              Agotado
            </Badge>
          ) : (
            <>
              {product.nuevo ? (
                
                <Badge tone="violeta" className="absolute text-white left-4 top-4 z-10">Nuevo</Badge>
              ) : null}
              {desc ? <DiscountRibbon pct={desc} /> : null}
            </>
          )}
          {activeMedia ? (
            activeMedia.type === "image" ? (
              <Image
                src={activeMedia.url}
                alt={product.nombre}
                fill
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="object-cover"
              />
            ) : (
              <video
                src={activeMedia.url}
                controls
                // Igual que la <Image fill>: absoluto para que su resolución
                // nativa no "empuje" el ancho del grid/flex y desborde la
                // pantalla en mobile (min-width:auto por defecto en flex).
                className="absolute inset-0 size-full object-cover"
              />
            )
          ) : (
            <HeartDrip className="size-20 text-humo/50" />
          )}
        </div>

        {media.length > 1 ? (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {media.map((m, i) => (
              <button
                key={m.url}
                onClick={() => setMediaIndex(i)}
                aria-label={`Ver ${m.type === "video" ? "video" : "imagen"} ${i + 1}`}
                className={cn(
                  "relative size-16 shrink-0 overflow-hidden rounded-md border-2",
                  i === mediaIndex ? "border-neon" : "border-linea",
                )}
              >
                {m.type === "image" ? (
                  <Image
                    src={m.url}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <video
                    src={m.url}
                    muted
                    className="size-full object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Información */}
      <div className="min-w-0 space-y-6">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-extrabold uppercase text-glow sm:text-4xl">
            {product.nombre}
          </h1>
          {product.reviews ? (
            <RatingStars
              value={product.rating}
              reviews={product.reviews}
            />
          ) : null}
          {product.precioOfertaCop ? (
            <div className="flex flex-wrap items-baseline gap-3">
              <PriceTag
                value={product.precioOfertaCop}
                showCurrency
                className="text-2xl text-neon"
              />
              <span className="text-lg text-humo line-through">
                {formatCOP(product.precioCop)}
              </span>
            </div>
          ) : (
            <PriceTag
              value={product.precioCop}
              showCurrency
              className="text-xl"
            />
          )}
          {product.agotado ? (
            <p className="font-heading text-sm font-bold uppercase tracking-wide text-humo">
              Producto agotado
            </p>
          ) : null}
        </div>

        {/* Selector de color */}
        {product.colores.length > 0 ? (
          <div>
            <p className="mb-2 font-heading text-xs font-semibold uppercase tracking-wide text-humo">
              Color: <span className="text-blanco">{activeColor?.nombre}</span>
            </p>
            <div className="flex flex-wrap gap-2.5">
              {product.colores.map((c, i) => (
                <button
                  key={`${c.nombre}-${i}`}
                  onClick={() => handleColor(i)}
                  aria-label={c.nombre}
                  aria-pressed={i === color}
                  className={cn(
                    "size-9 cursor-pointer rounded-full border-2 transition-transform hover:scale-110",
                    i === color ? "border-neon" : "border-linea",
                  )}
                  style={{ background: colorToCss(c) }}
                />
              ))}
            </div>
          </div>
        ) : null}

        {/* Cantidad */}
        <div className="flex items-center gap-4">
          <span className="font-heading text-xs font-semibold uppercase tracking-wide text-humo">
            Cantidad
          </span>
          <div className="flex items-center rounded-md border border-linea bg-linea/50">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Disminuir cantidad"
              className="grid size-10 cursor-pointer place-items-center text-humo transition-colors hover:text-neon"
            >
              <Minus className="size-4" />
            </button>
            <span className="w-10 text-center font-heading font-bold">
              {qty}
            </span>
            <button
              onClick={() => setQty((q) => Math.min(10, q + 1))}
              aria-label="Aumentar cantidad"
              className="grid size-10 cursor-pointer place-items-center text-humo transition-colors hover:text-neon"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={handleAdd}
            disabled={product.agotado}
            className="flex-none sm:flex-1 text-white"
          >
            {product.agotado ? "Agotado" : "Agregar al carrito"}
          </Button>
          <Button
            variant="outline"
            onClick={handleBuy}
            disabled={product.agotado}
            className="flex-none sm:flex-1"
          >
            Comprar ahora
          </Button>
        </div>

        {/* Tiempos de envío: justo bajo la decisión de compra. */}
        <ShippingEstimate estimate={envio} />
        {/* Características del producto */}
        <ProductInfoAccordion product={product} />
      </div>
    </div>
  );
}
