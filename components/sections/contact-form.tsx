"use client";

import { useState } from "react";
import { Input, Textarea, FieldLabel } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HeartDrip } from "@/components/icons";

/**
 * Formulario de contacto. En Fase 1 no hay backend: al enviar solo
 * mostramos un estado de confirmación local (sin persistencia).
 */
export function ContactForm() {
  const [enviado, setEnviado] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setEnviado(true);
      }}
      className="space-y-4"
    >
      <div>
        <FieldLabel htmlFor="c-nombre">Nombre</FieldLabel>
        <Input id="c-nombre" name="nombre" required placeholder="Tu nombre" />
      </div>
      <div>
        <FieldLabel htmlFor="c-email">Correo electrónico</FieldLabel>
        <Input
          id="c-email"
          name="email"
          type="email"
          required
          placeholder="tucorreo@ejemplo.com"
        />
      </div>
      <div>
        <FieldLabel htmlFor="c-msg">Mensaje</FieldLabel>
        <Textarea
          id="c-msg"
          name="mensaje"
          required
          placeholder="Cuéntanos qué buscas…"
        />
      </div>

      <Button type="submit" className="w-full">
        Enviar mensaje
      </Button>

      {enviado && (
        <p
          role="status"
          className="flex items-center justify-center gap-2 text-sm text-neon"
        >
          <HeartDrip className="size-4" />
          ¡Gracias! Te responderemos pronto.
        </p>
      )}
    </form>
  );
}
