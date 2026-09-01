import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RetroWindow } from "@/components/ui/retro-window";
import { SectionHeading } from "@/components/ui/section-heading";
import { PriceTag } from "@/components/ui/price";
import { CategoryCard } from "@/components/ui/category-card";
import { Hero } from "@/components/sections/hero";
import { ContactForm } from "@/components/sections/contact-form";
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import {
  Fire,
  Thermometer,
  Truck,
  Mask,
  Instagram,
  TikTok,
  WhatsApp,
  Sparkle,
} from "@/components/icons";
import { LENTES } from "@/data/lentes";
import { SOCIALS, TAGLINE } from "@/data/site";
import { catalogoHref } from "@/lib/public-product";
import { getFeaturedCategories } from "@/lib/queries/catalog";
import { Footer } from "@/components/layout/footer";

const FEATURES = [
  {
    Icon: Fire,
    titulo: "Fibra seminatural",
    texto: "Apariencia real y suave al tacto.",
  },
  {
    Icon: Thermometer,
    titulo: "Resistente al calor",
    texto: "Puedes estilizarla con herramientas (baja temperatura).",
  },
  {
    Icon: Truck,
    titulo: "Envíos a toda Colombia",
    texto: "Recibe tu pedido en cualquier parte del país.",
  },
  {
    Icon: Mask,
    titulo: "Looks para diario y cosplay",
    texto: "Para cada versión de ti.",
  },
];

const SOCIAL_ROWS = [
  {
    id: "instagram",
    Icon: Instagram,
    texto: SOCIALS.instagram.handle,
    href: SOCIALS.instagram.href,
  },
  {
    id: "tiktok",
    Icon: TikTok,
    texto: SOCIALS.tiktok.handle,
    href: SOCIALS.tiktok.href,
  },
  {
    id: "whatsapp",
    Icon: WhatsApp,
    texto: SOCIALS.whatsapp.numero,
    href: SOCIALS.whatsapp.href,
  },
];

export default async function Home() {
  // Solo las categorías que el admin marcó como destacadas, de cualquier
  // catálogo. Cada tarjeta enlaza al catálogo de su propio tipo.
  const destacadas = await getFeaturedCategories();

  return (
    <main className="flex flex-1 flex-col">
      {/* ============ HERO (HTML por capas, interactivo) ============ */}
      <Hero />

      <div className="flex flex-col items-center gap-20 px-4 py-16">
        {/* ============ CATEGORÍAS DESTACADAS ============ */}
        {destacadas.length > 0 ? (
          <section className="w-full max-w-6xl space-y-8">
            <Reveal>
              <SectionHeading>Categorías destacadas</SectionHeading>
            </Reveal>
            <Stagger className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {destacadas.map((c) => (
                <StaggerItem key={c.slug}>
                  <CategoryCard
                    categoria={c}
                    image={c.imagen ?? undefined}
                    catalogo={catalogoHref(c.tipo.slug)}
                  />
                </StaggerItem>
              ))}
            </Stagger>
          </section>
        ) : null}

        {/* ============ ¿POR QUÉ TOPWIGS? ============ */}
        <section className="w-full max-w-6xl space-y-8">
          <Reveal>
            <SectionHeading>¿Por qué TOPWIGS?</SectionHeading>
          </Reveal>
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ Icon, titulo, texto }) => (
              <StaggerItem
                key={titulo}
                className="flex flex-col items-center gap-3 text-center"
              >
                <span className="grid size-14 place-items-center rounded-full border border-neon/50 text-neon glow">
                  <Icon className="size-7" />
                </span>
                <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-neon">
                  {titulo}
                </h3>
                <p className="max-w-60 text-sm text-humo">{texto}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* ============ NUEVO: LENTES DE CONTACTO ============ */}
        <section className="w-full max-w-6xl space-y-8">
          <Reveal>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Badge>Nuevo</Badge>
              <SectionHeading centered={false}>
                Lentes de contacto
              </SectionHeading>
            </div>
          </Reveal>
          <Stagger className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {LENTES.map((lente) => (
              <StaggerItem key={lente.slug}>
                <Card className="p-4 text-center">
                  <span
                    className="mx-auto mb-3 block size-16 rounded-full ring-2 ring-neon/40"
                    style={{
                      background: `radial-gradient(circle at 50% 40%, ${lente.hex}, #05050a 78%)`,
                    }}
                    aria-hidden
                  />
                  <h3 className="font-heading text-xs font-bold uppercase tracking-wide">
                    {lente.nombre}
                  </h3>
                  <PriceTag
                    value={lente.precio}
                    className="text-sm"
                  />
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
          <div className="flex justify-center">
            {/* Esta sección todavía muestra el mock de `data/lentes.ts`, por eso
                el enlace va fijo al catálogo de lentes. */}
            <Link href="/lentes">
              <Button variant="outline">Ver todos</Button>
            </Link>
          </div>
        </section>

        {/* ============ NOSOTRAS / SOBRE LA MARCA ============ */}
        <Reveal className="w-full max-w-6xl">
          <RetroWindow title="nosotras.exe">
            <div className="grid gap-8 p-8 sm:p-12 md:grid-cols-2 md:items-center">
              <div className="relative aspect-square">
                <Image
                  src="/modelos/modelos.png"
                  alt="Las modelos de TOPWIGS"
                  fill
                  sizes="(max-width: 768px) 90vw, 45vw"
                  className="object-contain drop-shadow-[0_0_28px_rgba(255,47,146,0.3)]"
                />
              </div>
              <div className="space-y-4">
                <SectionHeading centered={false}>Somos TOPWIGS</SectionHeading>
                <p className="text-humo">
                  Top Wigs nace para todas las personas que aman expresarse,
                  cambiar de look y sentirse increíbles sin miedo. <br /> Somos
                  una tienda especializada en pelucas, lentes de contacto y
                  accesorios de belleza, seleccionados para que puedas encontrar
                  ese look que tanto buscas y hacerlo parte de tu día a día.{" "}
                  <br /> Creemos que una peluca no tiene que ser solo para una
                  ocasión especial. Puedes usarla todos los días, experimentar
                  con diferentes estilos y ser quien quieras ser. En Top Wigs
                  nos enfocamos en ofrecer productos con estilo, variedad y
                  calidad, pero también en crear una experiencia de compra
                  cercana y confiable. <br /> <br />
                  <span className="flex items-center font-heading text-base font-extrabold uppercase tracking-wide text-glow">
                    Tu estilo. Tu esencia. Tu momento. <br /> Top Wigs — Brilla
                    sin miedo
                  </span>
                </p>

                <p className="font-pixel text-[10px] uppercase text-neon">
                  Thanks for being here!
                </p>
                {/* <Link href="/nosotras">
                  <Button variant="ghost">Leer más</Button>
                </Link> */}
              </div>
            </div>
          </RetroWindow>
        </Reveal>

        {/* ============ SÍGUENOS + CONTACTO ============ */}
        <section className="grid w-full max-w-6xl gap-8 md:grid-cols-2">
          <Reveal className="space-y-6">
            <SectionHeading centered={false}>Síguenos</SectionHeading>
            <ul className="space-y-4">
              {SOCIAL_ROWS.map(({ id, Icon, texto, href }) => (
                <li key={id}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 text-humo transition-colors hover:text-neon"
                  >
                    <span className="grid size-11 place-items-center rounded-full border border-neon/50 text-neon">
                      <Icon className="size-5" />
                    </span>
                    <span className="font-heading text-lg">{texto}</span>
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal>
            <RetroWindow title="contacto.exe">
              <div className="space-y-5 p-6 sm:p-8">
                <div>
                  <h2 className="font-heading text-xl font-extrabold uppercase text-glow">
                    ¡Hablemos!
                  </h2>
                  <p className="mt-1 text-sm text-humo">
                    ¿Tienes dudas, sugerencias o quieres hacer un pedido
                    personalizado? Escríbenos.
                  </p>
                </div>
                <ContactForm />
              </div>
            </RetroWindow>
          </Reveal>
        </section>

        <Reveal>
          <p className="font-pixel text-[10px] uppercase text-humo/60">
            {TAGLINE}
          </p>
        </Reveal>
      </div>
      <Footer />
    </main>
  );
}
