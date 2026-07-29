"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteCategoria } from "@/app/admin/categorias/actions";
import { Button } from "@/components/shadcn/button";

export function DeleteCategoryButton({
  id,
  nombre,
}: {
  id: string;
  nombre: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onDelete() {
    if (!confirm(`¿Eliminar la categoría "${nombre}"?`)) return;
    startTransition(async () => {
      const res = await deleteCategoria(id);
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
      aria-label={`Eliminar ${nombre}`}
      className="text-humo hover:text-red-500"
    >
      <Trash2 className="size-4" />
    </Button>
  );
}
