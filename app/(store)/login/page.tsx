import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-guard";
import { Logo } from "@/components/ui/logo";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/");

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col items-center justify-center gap-6 px-4 py-12">
      <Link href="/" aria-label="TOPWIGS — inicio">
        <Logo size="lg" />
      </Link>
      <div className="w-full">
        <Suspense fallback={<div className="h-96" />}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
