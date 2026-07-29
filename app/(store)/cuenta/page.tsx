import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth-guard";
import { RetroWindow } from "@/components/ui/retro-window";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Mi perfil" };

export default async function CuentaPage() {
  const session = await requireUser();

  return (
    <main className="mx-auto w-full max-w-2xl space-y-8 px-4 py-12">
      <SectionHeading centered={false}>Mi perfil</SectionHeading>
      <RetroWindow title="perfil.exe">
        <div className="space-y-5 p-6 sm:p-8">
          <Field label="Nombre" value={session.user.name} />
          <Field label="Correo electrónico" value={session.user.email} />
          <div className="pt-2">
            <Link href="/cuenta/pedidos">
              <Button variant="outline">Ver mis pedidos</Button>
            </Link>
          </div>
        </div>
      </RetroWindow>
    </main>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-heading text-xs font-semibold uppercase tracking-wide text-humo">
        {label}
      </p>
      <p className="text-blanco">{value}</p>
    </div>
  );
}
