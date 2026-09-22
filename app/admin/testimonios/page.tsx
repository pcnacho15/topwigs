import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/db";
import { Button } from "@/components/shadcn/button";
import { Card, CardContent } from "@/components/shadcn/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/shadcn/table";
import { DeleteTestimonialButton } from "@/components/admin/delete-testimonial-button";

export const metadata: Metadata = { title: "Testimonios" };

export default async function TestimoniosPage() {
  const testimonios = await prisma.testimonial.findMany({
    orderBy: { orden: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-extrabold uppercase tracking-wide text-glow">
            Testimonios
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-humo">
            Se muestran en el Home, en el orden que definas aquí. Solo los
            marcados como &quot;Activo&quot; son visibles en la tienda.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/testimonios/nuevo">
            <Plus className="size-4" />
            Nuevo testimonio
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Testimonio</TableHead>
                <TableHead>Calificación</TableHead>
                <TableHead>Orden</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testimonios.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-semibold text-blanco">
                    {t.nombre}
                    {t.ubicacion ? (
                      <span className="block text-xs font-normal text-humo">
                        {t.ubicacion}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-humo">
                    {t.texto}
                  </TableCell>
                  <TableCell className="text-neon">
                    {"★".repeat(t.rating)}
                    {"☆".repeat(5 - t.rating)}
                  </TableCell>
                  <TableCell>{t.orden}</TableCell>
                  <TableCell>
                    <span className={t.activo ? "text-neon" : "text-humo/60"}>
                      {t.activo ? "Activo" : "Oculto"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="text-humo hover:text-neon"
                      >
                        <Link
                          href={`/admin/testimonios/${t.id}/editar`}
                          aria-label={`Editar testimonio de ${t.nombre}`}
                        >
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <DeleteTestimonialButton id={t.id} nombre={t.nombre} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {testimonios.length === 0 ? (
            <p className="py-10 text-center text-sm text-humo">
              No hay testimonios todavía.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
