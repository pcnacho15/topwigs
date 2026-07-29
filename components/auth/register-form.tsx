"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input, FieldLabel } from "@/components/ui/input";
import { RetroWindow } from "@/components/ui/retro-window";
import { GoogleButton } from "@/components/auth/google-button";

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const { error } = await authClient.signUp.email({
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    });
    if (error) {
      setError(error.message ?? "No pudimos crear tu cuenta.");
      setLoading(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <RetroWindow title="registro.exe" className="w-full">
      <div className="space-y-4 p-6 sm:p-8">
        <h1 className="font-heading text-xl font-extrabold uppercase text-glow">
          Crear cuenta
        </h1>

        <GoogleButton label="Registrarme con Google" />

        <div className="flex items-center gap-3 text-xs text-humo/60">
          <span className="h-px flex-1 bg-linea" /> o <span className="h-px flex-1 bg-linea" />
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <FieldLabel htmlFor="name">Nombre</FieldLabel>
            <Input id="name" name="name" required autoComplete="name" />
          </div>
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
              minLength={8}
              autoComplete="new-password"
            />
            <p className="mt-1 text-xs text-humo/70">Mínimo 8 caracteres.</p>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creando…" : "Registrarme"}
          </Button>
          {error ? (
            <p role="alert" className="text-sm text-neon">
              {error}
            </p>
          ) : null}
        </form>

        <p className="text-sm text-humo">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-neon hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </RetroWindow>
  );
}
