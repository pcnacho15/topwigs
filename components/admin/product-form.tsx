"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { productSchema, type ProductInput } from "@/lib/schemas/product";
import {
  createProducto,
  updateProducto,
} from "@/app/admin/productos/actions";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/shadcn/form";
import { Input } from "@/components/shadcn/input";
import { Textarea } from "@/components/shadcn/textarea";
import { Switch } from "@/components/shadcn/switch";
import { Button } from "@/components/shadcn/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/shadcn/select";
import { MediaUploader } from "@/components/admin/media-uploader";
import { StringListEditor } from "@/components/admin/string-list-editor";
import { slugify } from "@/lib/utils";

interface Props {
  mode: "create" | "edit";
  id?: string;
  categorias: { id: string; nombre: string }[];
  initial?: ProductInput;
}

const EMPTY: ProductInput = {
  nombre: "",
  slug: "",
  tipo: "peluca",
  descripcion: "",
  categoryId: "",
  precioCop: 0,
  precioOfertaCop: null,
  rating: 0,
  reviews: 0,
  nuevo: false,
  activo: true,
  colores: [{ nombre: "", tipo: "solid", from: "#ff2f92", to: null }],
  features: [],
  imagenes: [],
  videos: [],
};

export function ProductForm({ mode, id, categorias, initial }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: initial ?? {
      ...EMPTY,
      categoryId: categorias[0]?.id ?? "",
    },
  });

  const colores = useFieldArray({ control: form.control, name: "colores" });
  const tipo = form.watch("tipo");

  async function onSubmit(values: ProductInput) {
    setError(null);
    const res =
      mode === "create"
        ? await createProducto(values)
        : await updateProducto(id!, values);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.push("/admin/productos");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-3xl space-y-8"
      >
        {/* Básicos */}
        <Section title="Datos básicos">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      if (!form.getFieldState("slug").isDirty) {
                        form.setValue("slug", slugify(e.target.value));
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="peluca">Peluca</SelectItem>
                    <SelectItem value="lente">Lente</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Define la carpeta en Cloudinary: topwigs/pelucas o
                  topwigs/lentes.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categorias.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="descripcion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea rows={4} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>

        {/* Precio */}
        <Section title="Precio y descuento">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="precioCop"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio (COP)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="precioOfertaCop"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio de oferta (COP)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? null : e.target.valueAsNumber,
                        )
                      }
                    />
                  </FormControl>
                  <FormDescription>Déjalo vacío si no hay descuento.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Section>

        {/* Colores */}
        <Section title="Colores">
          <div className="space-y-3">
            {colores.fields.map((f, i) => (
              <ColorRow
                key={f.id}
                index={i}
                form={form}
                onRemove={() => colores.remove(i)}
                canRemove={colores.fields.length > 1}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                colores.append({
                  nombre: "",
                  tipo: "solid",
                  from: "#ff2f92",
                  to: null,
                })
              }
            >
              <Plus className="size-4" />
              Agregar color
            </Button>
          </div>
        </Section>

        {/* Features */}
        <Section title="Características">
          <FormField
            control={form.control}
            name="features"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <StringListEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="No necesita pegamento"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </Section>

        {/* Media */}
        <Section title="Imágenes">
          <FormField
            control={form.control}
            name="imagenes"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <MediaUploader
                    value={field.value}
                    onChange={field.onChange}
                    resourceType="image"
                    tipo={tipo}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </Section>
        <Section title="Videos">
          <FormField
            control={form.control}
            name="videos"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <MediaUploader
                    value={field.value}
                    onChange={field.onChange}
                    resourceType="video"
                    tipo={tipo}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </Section>

        {/* Métricas + flags */}
        <Section title="Detalles">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating (0–5)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      min={0}
                      max={5}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reviews"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reseñas</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="nuevo"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-md border border-linea p-3">
                  <FormLabel>Marcar como nuevo</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="activo"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-md border border-linea p-3">
                  <FormLabel>Activo (visible)</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </Section>

        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        <div className="flex gap-3">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? "Guardando…"
              : mode === "create"
                ? "Crear producto"
                : "Guardar cambios"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/productos")}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-neon">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Fila de color: nombre + tipo (sólido/degradado) + selector(es) + preview. */
function ColorRow({
  index,
  form,
  onRemove,
  canRemove,
}: {
  index: number;
  form: ReturnType<typeof useForm<ProductInput>>;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const tipo = form.watch(`colores.${index}.tipo`);
  const from = form.watch(`colores.${index}.from`);
  const to = form.watch(`colores.${index}.to`);

  const preview =
    tipo === "gradient" && to
      ? `linear-gradient(135deg, ${from}, ${to})`
      : from;

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-md border border-linea p-3">
      <span
        className="size-10 shrink-0 rounded-full border border-linea"
        style={{ background: preview }}
        aria-hidden
      />
      <div className="min-w-32 flex-1">
        <label className="mb-1 block text-xs text-humo">Nombre</label>
        <Input {...form.register(`colores.${index}.nombre`)} placeholder="Rojo vino" />
      </div>
      <div>
        <label className="mb-1 block text-xs text-humo">Tipo</label>
        <Controller
          control={form.control}
          name={`colores.${index}.tipo`}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(v) => {
                field.onChange(v);
                if (v === "gradient" && !form.getValues(`colores.${index}.to`)) {
                  form.setValue(`colores.${index}.to`, "#ba2be2");
                }
                if (v === "solid") {
                  form.setValue(`colores.${index}.to`, null);
                }
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Sólido</SelectItem>
                <SelectItem value="gradient">Degradado</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-humo">
          {tipo === "gradient" ? "Desde" : "Color"}
        </label>
        <input
          type="color"
          {...form.register(`colores.${index}.from`)}
          className="h-10 w-14 cursor-pointer rounded-md border border-linea bg-surface-1"
        />
      </div>
      {tipo === "gradient" ? (
        <div>
          <label className="mb-1 block text-xs text-humo">Hasta</label>
          <input
            type="color"
            value={to ?? "#ba2be2"}
            onChange={(e) =>
              form.setValue(`colores.${index}.to`, e.target.value, {
                shouldDirty: true,
              })
            }
            className="h-10 w-14 cursor-pointer rounded-md border border-linea bg-surface-1"
          />
        </div>
      ) : null}
      {canRemove ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="text-humo hover:text-red-500"
          aria-label="Quitar color"
        >
          <Trash2 className="size-4" />
        </Button>
      ) : null}
    </div>
  );
}
