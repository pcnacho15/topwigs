import type { Metadata } from "next";
import { ProductTypeForm } from "@/components/admin/product-type-form";

export const metadata: Metadata = { title: "Nuevo tipo de producto" };

export default function NuevoTipoPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-extrabold uppercase tracking-wide text-glow">
        Nuevo tipo de producto
      </h1>
      <p className="max-w-2xl text-sm text-humo">
        Al crearlo aparece un catálogo nuevo en la tienda y podrás darle sus
        propias categorías desde la sección Categorías.
      </p>
      <ProductTypeForm mode="create" />
    </div>
  );
}
