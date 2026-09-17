import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-guard";
import { Logo } from "@/components/ui/logo";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Crear cuenta" };

export default async function RegistroPage() {
  const session = await getSession();
  if (session) redirect("/");

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col items-center justify-center gap-6 px-4 py-12">
      <Link href="/" aria-label="TOPWIGS — inicio">
        <Logo size="lg" />
      </Link>
      <RegisterForm />
    </main>
  );
}
