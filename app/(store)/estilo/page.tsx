import type { Metadata } from "next";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RetroWindow } from "@/components/ui/retro-window";
import { Input, Textarea, FieldLabel } from "@/components/ui/input";
import { RatingStars } from "@/components/ui/rating-stars";
import { PriceTag } from "@/components/ui/price";
import { ImagePlaceholder } from "@/components/ui/placeholder";
import {
  Star,
  Sparkle,
  Heart,
  HeartDrip,
  Bunny,
  Chain,
  Cart,
  User,
  Search,
  Instagram,
  TikTok,
  WhatsApp,
  Mail,
  Fire,
  Thermometer,
  Truck,
  Mask,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "Guía de estilo",
  description: "Sistema de diseño de TOPWIGS — tokens y componentes.",
};

const swatches = [
  { name: "noir", hex: "#000000", cls: "bg-noir border border-linea" },
  { name: "neon", hex: "#FF2F92", cls: "bg-neon" },
  { name: "blanco", hex: "#FFFFFF", cls: "bg-blanco" },
  { name: "humo", hex: "#BABABA", cls: "bg-humo" },
  { name: "violeta", hex: "#BA2BE2", cls: "bg-violeta" },
];

const icons = [
  ["Star", Star],
  ["Sparkle", Sparkle],
  ["Heart", Heart],
  ["HeartDrip", HeartDrip],
  ["Bunny", Bunny],
  ["Chain", Chain],
  ["Cart", Cart],
  ["User", User],
  ["Search", Search],
  ["Instagram", Instagram],
  ["TikTok", TikTok],
  ["WhatsApp", WhatsApp],
  ["Mail", Mail],
  ["Fire", Fire],
  ["Thermometer", Thermometer],
  ["Truck", Truck],
  ["Mask", Mask],
] as const;

function Section({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5">
      <h2 className="flex items-center gap-3 font-heading text-xl font-bold uppercase tracking-wide">
        <Badge tone="outline">{n}</Badge>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function StyleGuide() {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-14 px-4 py-12">
      <header className="space-y-3">
        <Logo size="lg" />
        <p className="font-pixel text-[10px] uppercase text-humo">
          Sistema de diseño · Fase 1
        </p>
      </header>

      {/* Colores */}
      <Section n="01" title="Paleta">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {swatches.map((s) => (
            <div key={s.name} className="space-y-2">
              <div className={`h-20 rounded-goth ${s.cls}`} />
              <div className="font-heading text-sm font-semibold">{s.name}</div>
              <div className="font-pixel text-[9px] text-humo">{s.hex}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Tipografía */}
      <Section n="02" title="Tipografía">
        <div className="space-y-4">
          <div>
            <p className="font-pixel text-[9px] uppercase text-humo">
              Montserrat · títulos
            </p>
            <p className="font-heading text-3xl font-bold">
              Cambia tu look, cambia tu energía
            </p>
          </div>
          <div>
            <p className="font-pixel text-[9px] uppercase text-humo">
              Raleway · cuerpo
            </p>
            <p className="max-w-2xl text-humo">
              Peluca de fibra seminatural, resistente al calor. Ideal para uso
              diario o looks especiales. No necesita pegamento y viene con malla
              frontal amplia.
            </p>
          </div>
          <div>
            <p className="font-pixel text-[9px] uppercase text-humo">
              Press Start 2P · acento pixel
            </p>
            <p className="font-pixel text-xs">GAME OVER? YES / NO</p>
          </div>
        </div>
      </Section>

      {/* Botones */}
      <Section n="03" title="Botones">
        <div className="flex flex-wrap items-center gap-4">
          <Button>Comprar ahora</Button>
          <Button variant="outline">Ver más</Button>
          <Button variant="ghost">Agregar</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Deshabilitado</Button>
        </div>
      </Section>

      {/* Badges + rating + precio */}
      <Section n="04" title="Etiquetas · Rating · Precio">
        <div className="flex flex-wrap items-center gap-4">
          <Badge>Nuevo</Badge>
          <Badge tone="violeta">Fantasía</Badge>
          <Badge tone="outline">Cosplay</Badge>
          <RatingStars value={4} reviews={24} />
          <PriceTag value={160000} showCurrency />
          <PriceTag value={45000} />
        </div>
      </Section>

      {/* Iconos */}
      <Section n="05" title="Iconos">
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
          {icons.map(([name, Icon]) => (
            <div
              key={name}
              className="flex flex-col items-center gap-2 rounded-goth border border-linea bg-surface-2 py-4 text-neon"
            >
              <Icon className="size-7" />
              <span className="font-pixel text-[8px] text-humo">{name}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Campos de formulario */}
      <Section n="06" title="Formulario">
        <div className="max-w-md space-y-4">
          <div>
            <FieldLabel htmlFor="sg-nombre">Nombre</FieldLabel>
            <Input id="sg-nombre" placeholder="Tu nombre" />
          </div>
          <div>
            <FieldLabel htmlFor="sg-msg">Mensaje</FieldLabel>
            <Textarea id="sg-msg" placeholder="Escríbenos…" />
          </div>
          <Button>Enviar mensaje</Button>
        </div>
      </Section>

      {/* Marco de ventana + tarjeta de producto de ejemplo */}
      <Section n="07" title="Ventana retro · Tarjeta">
        <div className="grid gap-6 md:grid-cols-2">
          <RetroWindow title="catalogo.exe">
            <div className="p-6">
              <p className="text-humo">
                Contenedor con barra de título Y2K. Envuelve secciones y
                bloques destacados.
              </p>
            </div>
          </RetroWindow>

          <Card className="overflow-hidden">
            <ImagePlaceholder label="Red Velvet" ratio="aspect-square" />
            <div className="space-y-2 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold">RED VELVET</h3>
                <Heart className="size-5 text-neon" />
              </div>
              <RatingStars value={4} reviews={24} />
              <PriceTag value={160000} />
            </div>
          </Card>
        </div>
      </Section>
    </main>
  );
}
