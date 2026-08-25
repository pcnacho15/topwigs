"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { PublicProduct } from "@/lib/public-product";
import { colorToCss, descuentoPct } from "@/lib/public-product";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PriceTag, formatCOP } from "@/components/ui/price";
import { RatingStars } from "@/components/ui/rating-stars";
import { HeartDrip, Minus, Plus, Star } from "@/components/icons";
import { useCart } from "@/components/cart/cart-context";
import { cn } from "@/lib/utils";

type Media = { type: "image" | "video"; url: string };

export function ProductDetail({ product }: { product: PublicProduct }) {
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

  const buildItem = () => ({
    slug: product.slug,
    nombre: product.nombre,
    precio: product.precioOfertaCop ?? product.precioCop,
    colorNombre: activeColor?.nombre ?? "Único",
    colorHex: activeColor?.from ?? "#ff2f92",
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
      <div className="space-y-3">
        <div
          className="relative flex aspect-square items-center justify-center overflow-hidden rounded-goth border border-linea bg-surface-1"
          style={
            media.length === 0
              ? {
                  background: `radial-gradient(120% 100% at 50% 0%, ${activeCss}, #0a0a0d 80%)`,
                }
              : undefined
          }
        >
          {product.agotado ? (
            <Badge tone="agotado" className="absolute left-4 top-4 z-10">
              Agotado
            </Badge>
          ) : (
            <>
              {product.nuevo ? (
                <Badge className="absolute left-4 top-4 z-10">Nuevo</Badge>
              ) : null}
              {desc ? (
                <Badge tone="violeta" className="absolute right-4 top-4 z-10">
                  -{desc}%
                </Badge>
              ) : null}
            </>
          )}
          {activeMedia ? (
            activeMedia.type === "image" ? (
              <Image
                src={activeMedia.url}
                alt={product.nombre}
                fill
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="object-contain"
              />
            ) : (
              <video
                src={activeMedia.url}
                controls
                className="size-full object-cover"
              />
            )
          ) : (
            <HeartDrip className="size-20 text-white/40" />
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
                  <Image src={m.url} alt="" fill sizes="64px" className="object-cover" />
                ) : (
                  <video src={m.url} muted className="size-full object-cover" />
                )}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Información */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-extrabold uppercase text-glow sm:text-4xl">
            {product.nombre}
          </h1>
          <RatingStars value={product.rating} reviews={product.reviews} />
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
            <PriceTag value={product.precioCop} showCurrency className="text-2xl" />
          )}
          {product.agotado ? (
            <p className="font-heading text-sm font-bold uppercase tracking-wide text-humo">
              Producto agotado
            </p>
          ) : null}
        </div>

        <p className="leading-relaxed text-humo">{product.descripcion}</p>

        {product.features.length > 0 ? (
          <ul className="space-y-2">
            {product.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-humo">
                <Star className="size-4 shrink-0 fill-neon text-neon" />
                {f}
              </li>
            ))}
          </ul>
        ) : null}

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
          <div className="flex items-center rounded-full border border-linea">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Disminuir cantidad"
              className="grid size-10 cursor-pointer place-items-center text-humo transition-colors hover:text-neon"
            >
              <Minus className="size-4" />
            </button>
            <span className="w-10 text-center font-heading font-bold">{qty}</span>
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
          <Button onClick={handleAdd} disabled={product.agotado} className="flex-1">
            {product.agotado ? "Agotado" : "Agregar al carrito"}
          </Button>
          <Button
            variant="outline"
            onClick={handleBuy}
            disabled={product.agotado}
            className="flex-1"
          >
            Comprar ahora
          </Button>
        </div>
      </div>
    </div>
  );
}
