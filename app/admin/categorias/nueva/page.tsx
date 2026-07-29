import type { Metadata } from "next";
import { CategoryForm } from "@/components/admin/category-form";

export const metadata: Metadata = { title: "Nueva categoría" };

export default function NuevaCategoriaPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-extrabold uppercase tracking-wide text-glow">
        Nueva categoría
      </h1>
      <CategoryForm mode="create" />
    </div>
  );
}
