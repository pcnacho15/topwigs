import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/shadcn/button";
import { Card, CardContent } from "@/components/shadcn/card";
import { DeleteReviewButton } from "@/components/admin/delete-review-button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/shadcn/table";

export const metadata: Metadata = { title: "Reseñas" };

const PAGE_SIZE = 20;

export default async function ResenasPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [resenas, total] = await Promise.all([
    prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { slug: true, nombre: true } },
      },
    }),
    prisma.review.count(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-extrabold uppercase tracking-wide text-glow">
        Reseñas
      </h1>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Calificación</TableHead>
                <TableHead>Comentario</TableHead>
                <TableHead>Fotos</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resenas.map((r) => {
                const imagenes = (r.imagenes as unknown as string[]) ?? [];
                return (
                <TableRow key={r.id}>
                  <TableCell className="text-blanco">
                    <Link
                      href={`/producto/${r.product.slug}`}
                      target="_blank"
                      className="hover:text-neon"
                    >
                      {r.product.nombre}
                    </Link>
                  </TableCell>
                  <TableCell className="text-blanco">
                    {r.user.name}
                    <p className="text-xs text-humo">{r.user.email}</p>
                  </TableCell>
                  <TableCell className="font-semibold">{r.rating} / 5</TableCell>
                  <TableCell className="max-w-xs truncate text-humo" title={r.comentario}>
                    {r.comentario || "—"}
                  </TableCell>
                  <TableCell>
                    {imagenes.length > 0 ? (
                      <div className="flex gap-1">
                        {imagenes.map((url) => (
                          <a
                            key={url}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative size-9 shrink-0 overflow-hidden rounded border border-linea"
                          >
                            <Image src={url} alt="" fill sizes="36px" className="object-cover" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <span className="text-humo">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-humo">
                    {formatDate(r.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end">
                      <DeleteReviewButton id={r.id} autor={r.user.name} />
                    </div>
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {resenas.length === 0 ? (
            <p className="py-10 text-center text-sm text-humo">
              No hay reseñas todavía.
            </p>
          ) : null}
        </CardContent>
      </Card>

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-3">
          {page > 1 ? (
            <Button asChild variant="outline">
              <Link href={`/admin/resenas?page=${page - 1}`}>Anterior</Link>
            </Button>
          ) : (
            <Button variant="outline" disabled>
              Anterior
            </Button>
          )}
          <span className="text-sm text-humo">
            Página {page} de {totalPages}
          </span>
          {page < totalPages ? (
            <Button asChild variant="outline">
              <Link href={`/admin/resenas?page=${page + 1}`}>Siguiente</Link>
            </Button>
          ) : (
            <Button variant="outline" disabled>
              Siguiente
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
