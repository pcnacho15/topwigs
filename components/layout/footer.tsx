import Link from "next/link";
import { Wordmark } from "@/components/ui/wordmark";
import { Instagram, TikTok, WhatsApp, Mail, Star } from "@/components/icons";
import { SOCIALS } from "@/data/site";
import { getNavLinks } from "@/lib/queries/catalog";

const socialLinks = [
  { key: "ig", href: SOCIALS.instagram.href, label: "Instagram", Icon: Instagram },
  { key: "tt", href: SOCIALS.tiktok.href, label: "TikTok", Icon: TikTok },
  { key: "wa", href: SOCIALS.whatsapp.href, label: "WhatsApp", Icon: WhatsApp },
  // { key: "mail", href: SOCIALS.email.href, label: "Correo", Icon: Mail },
];

export async function Footer() {
  const navLinks = await getNavLinks();

  return (
    <footer className="mt-auto border-t border-neon/30 bg-surface-1">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-3">
        <div className="space-y-3">
          <Wordmark height={40} />
          <p className="font-heading text-sm uppercase tracking-wide text-humo">
            Stay in touch!
          </p>
          <div className="flex items-center gap-3 text-neon">
            {socialLinks.map(({ key, href, label, Icon }) => (
              <a
                key={key}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
                className="grid size-9 place-items-center rounded-full border border-neon/50 transition-colors hover:bg-neon hover:text-noir"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <nav aria-label="Enlaces del pie">
          <h3 className="mb-3 font-heading text-sm font-bold uppercase tracking-wide">
            Navegación
          </h3>
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-humo transition-colors hover:text-neon"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="mb-3 font-heading text-sm font-bold uppercase tracking-wide">
            Contacto
          </h3>
          <ul className="space-y-2 text-sm text-humo">
            <li>{SOCIALS.instagram.handle}</li>
            <li>{SOCIALS.whatsapp.numero}</li>
            {/* <li>{SOCIALS.email.direccion}</li> */}
          </ul>
        </div>
      </div>

      <div className="border-t border-linea">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-center gap-2 px-4 py-4">
          <Star className="size-3 text-neon/60" />
          <p className="font-pixel text-[9px] uppercase text-humo/70">
            © 2025 TOPWIGS. Todos los derechos reservados.
          </p>
          <Star className="size-3 text-neon/60" />
        </div>
      </div>
    </footer>
  );
}
