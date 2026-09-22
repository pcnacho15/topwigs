"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteTestimonio } from "@/app/admin/testimonios/actions";
import { Button } from "@/components/shadcn/button";

export function DeleteTestimonialButton({
  id,
  nombre,
}: {
  id: string;
  nombre: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onDelete() {
    if (!confirm(`¿Eliminar el testimonio de "${nombre}"?`)) return;
    startTransition(async () => {
      const res = await deleteTestimonio(id);
      if (!res.ok) {
        alert(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onDelete}
      disabled={pending}
      aria-label={`Eliminar testimonio de ${nombre}`}
      className="text-humo hover:text-red-500"
    >
      <Trash2 className="size-4" />
    </Button>
  );
}
