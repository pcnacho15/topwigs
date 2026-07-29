"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input, FieldLabel } from "@/components/ui/input";
import { RetroWindow } from "@/components/ui/retro-window";
import { GoogleButton } from "@/components/auth/google-button";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const { error } = await authClient.signIn.email({
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    });
    if (error) {
      setError(error.message ?? "No pudimos iniciar sesión.");
      setLoading(false);
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <RetroWindow title="login.exe">
      <div className="space-y-4 p-6 sm:p-8">
        <h1 className="font-heading text-xl font-extrabold uppercase text-glow">
          Iniciar sesión
        </h1>

        <GoogleButton callbackURL={next} />

        <div className="flex items-center gap-3 text-xs text-humo/60">
          <span className="h-px flex-1 bg-linea" /> o <span className="h-px flex-1 bg-linea" />
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div>
            <FieldLabel htmlFor="password">Contraseña</FieldLabel>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Entrando…" : "Entrar"}
          </Button>
          {error ? (
            <p role="alert" className="text-sm text-neon">
              {error}
            </p>
          ) : null}
        </form>

        <p className="text-sm text-humo">
          ¿No tienes cuenta?{" "}
          <Link href="/registro" className="text-neon hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </RetroWindow>
  );
}
