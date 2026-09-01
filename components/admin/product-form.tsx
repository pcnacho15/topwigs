"use client";

import { useMemo, useState } from "react";
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
import { MediaPicker } from "@/components/admin/media-picker";
import { StringListEditor } from "@/components/admin/string-list-editor";
import { slugify } from "@/lib/utils";

/** Categoría del selector, con el catálogo al que pertenece. */
export interface CategoriaOpcion {
  id: string;
  nombre: string;
  tipoId: string;
  tipoLabel: string;
  tipoSlug: string;
}

interface Props {
  mode: "create" | "edit";
  id?: string;
  categorias: CategoriaOpcion[];
  initial?: ProductInput;
}

const EMPTY: ProductInput = {
  nombre: "",
  slug: "",
  descripcion: "",
  categoryId: "",
  precioCop: 0,
  precioOfertaCop: null,
  rating: 0,
  reviews: 0,
  nuevo: false,
  stock: 0,
  activo: true,
  colores: [
    { nombre: "", tipo: "solid", from: "#ff2f92", to: null, imagenes: [], videos: [] },
  ],
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
  const imagenes = form.watch("imagenes");
  const videos = form.watch("videos");
  const categoryId = form.watch("categoryId");

  /**
   * El tipo de producto no se guarda: lo hereda la categoría. Aquí solo sirve
   * para acotar el selector de categorías (y para saber en qué carpeta de
   * Cloudinary van los archivos).
   */
  const tipos = useMemo(() => {
    const vistos = new Map<string, { id: string; label: string }>();
    for (const c of categorias) {
      if (!vistos.has(c.tipoId)) {
        vistos.set(c.tipoId, { id: c.tipoId, label: c.tipoLabel });
      }
    }
    return [...vistos.values()];
  }, [categorias]);

  const [tipoId, setTipoId] = useState(
    () =>
      categorias.find((c) => c.id === (initial?.categoryId ?? categorias[0]?.id))
        ?.tipoId ??
      tipos[0]?.id ??
      "",
  );

  const categoriasDelTipo = useMemo(
    () => categorias.filter((c) => c.tipoId === tipoId),
    [categorias, tipoId],
  );

  // La carpeta de Cloudinary sale de la categoría realmente seleccionada.
  const tipoSlug =
    categorias.find((c) => c.id === categoryId)?.tipoSlug ?? "";

  /** Al cambiar de catálogo, la categoría anterior ya no aplica. */
  function cambiarTipo(nuevoTipoId: string) {
    setTipoId(nuevoTipoId);
    const primera = categorias.find((c) => c.tipoId === nuevoTipoId);
    form.setValue("categoryId", primera?.id ?? "", { shouldDirty: true });
  }

  /**
   * La galería es la fuente de los medios que cada color puede asignar: al
   * quitar un archivo hay que soltarlo también de los colores que lo tenían,
   * o el producto no pasaría la validación al guardar.
   */
  function setMedia(campo: "imagenes" | "videos", urls: string[]) {
    form.setValue(campo, urls, { shouldDirty: true });
    form.getValues("colores").forEach((c, i) => {
      const asignadas = c[campo] ?? [];
      const quedan = asignadas.filter((u) => urls.includes(u));
      if (quedan.length !== asignadas.length) {
        form.setValue(`colores.${i}.${campo}`, quedan, { shouldDirty: true });
      }
    });
  }

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
          {/* No es un campo del producto: filtra las categorías de abajo. */}
          <FormItem>
            <FormLabel>Tipo de producto</FormLabel>
            <Select value={tipoId} onValueChange={cambiarTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                {tipos.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              Define el catálogo del producto y la carpeta en Cloudinary. El
              producto queda en el catálogo de la categoría que elijas abajo.
            </FormDescription>
          </FormItem>
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
                    {categoriasDelTipo.map((c) => (
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
                    onChange={(urls) => setMedia("imagenes", urls)}
                    resourceType="image"
                    tipo={tipoSlug}
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
                    onChange={(urls) => setMedia("videos", urls)}
                    resourceType="video"
                    tipo={tipoSlug}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </Section>

        {/* Colores — va después de la galería porque cada color asigna
            los medios ya subidos arriba. */}
        <Section title="Colores">
          <p className="-mt-2 text-xs text-humo/70">
            En cada color marca las imágenes y videos que le corresponden: al
            elegirlo en la tienda, la galería mostrará solo esos. Un color sin
            nada marcado se ve sin fotos.
          </p>
          <div className="space-y-3">
            {colores.fields.map((f, i) => (
              <ColorRow
                key={f.id}
                index={i}
                form={form}
                imagenes={imagenes}
                videos={videos}
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
                  imagenes: [],
                  videos: [],
                })
              }
            >
              <Plus className="size-4" />
              Agregar color
            </Button>
          </div>
          {form.formState.errors.colores?.root ? (
            <p className="text-sm text-red-500">
              {form.formState.errors.colores.root.message}
            </p>
          ) : null}
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
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cantidad en inventario</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Cuando llega a 0, el producto se sigue mostrando en la tienda
                  pero marcado como &quot;Agotado&quot; (no se puede comprar).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
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
                  <FormLabel>Disponible para la venta</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <p className="text-xs text-humo/70">
            Si lo desactivas, el producto sigue apareciendo en la tienda pero
            se muestra como &quot;Agotado&quot;, igual que cuando el
            inventario llega a 0.
          </p>
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
  imagenes,
  videos,
  onRemove,
  canRemove,
}: {
  index: number;
  form: ReturnType<typeof useForm<ProductInput>>;
  imagenes: string[];
  videos: string[];
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
    <div className="space-y-3 rounded-md border border-linea p-3">
      <div className="flex flex-wrap items-end gap-3">
        <span
          className="size-10 shrink-0 rounded-full border border-linea"
          style={{ background: preview }}
          aria-hidden
        />
        <div className="min-w-32 flex-1">
          <label className="mb-1 block text-xs text-humo">Nombre</label>
          <Input
            {...form.register(`colores.${index}.nombre`)}
            placeholder="Rojo vino"
          />
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

      {/* Medios de este color: se marcan sobre lo ya subido al producto. */}
      <div className="space-y-3 border-t border-linea pt-3">
        <div>
          <label className="mb-1.5 block text-xs text-humo">
            Imágenes de este color
          </label>
          <Controller
            control={form.control}
            name={`colores.${index}.imagenes`}
            render={({ field }) => (
              <MediaPicker
                options={imagenes}
                value={field.value ?? []}
                onChange={field.onChange}
                resourceType="image"
                emptyHint="Sube imágenes en la sección «Imágenes» para poder asignarlas."
              />
            )}
          />
        </div>
        {videos.length > 0 ? (
          <div>
            <label className="mb-1.5 block text-xs text-humo">
              Videos de este color
            </label>
            <Controller
              control={form.control}
              name={`colores.${index}.videos`}
              render={({ field }) => (
                <MediaPicker
                  options={videos}
                  value={field.value ?? []}
                  onChange={field.onChange}
                  resourceType="video"
                  emptyHint=""
                />
              )}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
