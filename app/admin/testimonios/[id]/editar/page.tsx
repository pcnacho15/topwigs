import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { TestimonialForm } from "@/components/admin/testimonial-form";

export const metadata: Metadata = { title: "Editar testimonio" };

export default async function EditarTestimonioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const testimonio = await prisma.testimonial.findUnique({ where: { id } });
  if (!testimonio) notFound();

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-extrabold uppercase tracking-wide text-glow">
        Editar testimonio
      </h1>
      <TestimonialForm
        mode="edit"
        id={testimonio.id}
        initial={{
          nombre: testimonio.nombre,
          ubicacion: testimonio.ubicacion,
          texto: testimonio.texto,
          rating: testimonio.rating,
          avatarUrl: testimonio.avatarUrl,
          orden: testimonio.orden,
          activo: testimonio.activo,
        }}
      />
    </div>
  );
}
