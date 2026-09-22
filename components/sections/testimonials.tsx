import Image from "next/image";
import type { PublicTestimonial } from "@/lib/queries/testimonials";
import { RetroWindow } from "@/components/ui/retro-window";
import { SectionHeading } from "@/components/ui/section-heading";
import { RatingStars } from "@/components/ui/rating-stars";
import { Carousel, CarouselItem } from "@/components/ui/carousel";
import { Reveal } from "@/components/motion/reveal";

/** Sección de testimonios del Home: contenido que arma el admin en
 * /admin/testimonios (no son las reseñas de producto). */
export function Testimonials({
  testimonios,
}: {
  testimonios: PublicTestimonial[];
}) {
  if (testimonios.length === 0) return null;

  return (
    <Reveal className="w-full max-w-6xl">
      <RetroWindow title="testimonios.exe">
        <div className="space-y-8 p-5 sm:p-8">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <SectionHeading centered={false}>
              Lo que dicen de nosotras
            </SectionHeading>
          </div>
          <Carousel>
            {testimonios.map((t) => (
              <CarouselItem
                key={t.id}
                className="w-[85%] sm:w-[60%] md:w-[45%] lg:w-[32%]"
              >
                <TestimonialCard testimonio={t} />
              </CarouselItem>
            ))}
          </Carousel>
        </div>
      </RetroWindow>
    </Reveal>
  );
}

function TestimonialCard({ testimonio: t }: { testimonio: PublicTestimonial }) {
  const inicial = t.nombre.trim().charAt(0).toUpperCase();

  return (
    <div className="flex h-full flex-col gap-4 rounded-goth border border-linea bg-surface-1 p-5">
      <span
        aria-hidden
        className="font-heading text-4xl leading-none text-neon/40"
      >
        &ldquo;
      </span>
      <p className="flex-1 text-sm text-humo">{t.texto}</p>
      <div className="space-y-2">
        <RatingStars value={t.rating} />
        <div className="flex items-center gap-3">
          {t.avatarUrl ? (
            <div className="relative size-10 shrink-0 overflow-hidden rounded-full border border-neon/40">
              <Image
                src={t.avatarUrl}
                alt=""
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
          ) : (
            <span className="grid size-10 shrink-0 place-items-center rounded-full border border-neon/40 bg-surface-2 font-heading text-sm font-bold text-neon">
              {inicial}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate font-heading text-sm font-bold uppercase tracking-wide text-blanco">
              {t.nombre}
            </p>
            {t.ubicacion ? (
              <p className="truncate text-xs text-humo/70">{t.ubicacion}</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
