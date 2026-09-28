"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trophy } from "lucide-react";
import { setMasVendido } from "@/app/admin/productos/actions";
import { Button } from "@/components/shadcn/button";
import { cn } from "@/lib/utils";

export function BestSellerToggle({
  id,
  nombre,
  masVendido,
}: {
  id: string;
  nombre: string;
  masVendido: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [activo, setActivo] = useOptimistic(masVendido);

  function onToggle() {
    const next = !activo;
    startTransition(async () => {
      setActivo(next);
      const res = await setMasVendido(id, next);
      if (!res.ok) {
        alert(res.error);
        return;
      }
      router.refresh();
    });
  }

  const label = activo
    ? `Quitar ${nombre} de "Lo más vendido"`
    : `Agregar ${nombre} a "Lo más vendido"`;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      disabled={pending}
      aria-label={label}
      aria-pressed={activo}
      title={label}
      className={cn(activo ? "text-neon hover:text-neon/70" : "text-humo hover:text-neon")}
    >
      <Trophy className={cn("size-4", activo && "fill-current")} />
    </Button>
  );
}
