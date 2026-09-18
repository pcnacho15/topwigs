"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteResena } from "@/app/admin/resenas/actions";
import { Button } from "@/components/shadcn/button";

export function DeleteReviewButton({ id, autor }: { id: string; autor: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onDelete() {
    if (!confirm(`¿Eliminar la reseña de "${autor}"?`)) return;
    startTransition(async () => {
      const res = await deleteResena(id);
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
      aria-label={`Eliminar reseña de ${autor}`}
      className="text-humo hover:text-red-500"
    >
      <Trash2 className="size-4" />
    </Button>
  );
}
