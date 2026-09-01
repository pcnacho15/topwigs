"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, type CategoryInput } from "@/lib/schemas/category";
import { createCategoria, updateCategoria } from "@/app/admin/categorias/actions";
import { CategoryImageUploader } from "@/components/admin/category-image-uploader";
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
import { Switch } from "@/components/shadcn/switch";
import { Button } from "@/components/shadcn/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/shadcn/select";
import { slugify } from "@/lib/utils";

interface Props {
  mode: "create" | "edit";
  id?: string;
  /** Tipos de producto disponibles: cada categoría vive dentro de uno. */
  tipos: { id: string; label: string }[];
  /** Tipo preseleccionado al crear (viene del botón de cada sección). */
  defaultTipoId?: string;
  initial?: CategoryInput;
}

export function CategoryForm({
  mode,
  id,
  tipos,
  defaultTipoId,
  initial,
}: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues:
      initial ?? {
        productTypeId: defaultTipoId ?? tipos[0]?.id ?? "",
        nombre: "",
        slug: "",
        imagen: null,
        orden: 0,
        activa: true,
        destacada: false,
      },
  });

  async function onSubmit(values: CategoryInput) {
    setError(null);
    const res =
      mode === "create"
        ? await createCategoria(values)
        : await updateCategoria(id!, values);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.push("/admin/categorias");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-lg space-y-6">
        <FormField
          control={form.control}
          name="productTypeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de producto</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tipos.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Catálogo al que pertenece la categoría. Los productos que la
                usen quedan en ese catálogo.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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
                    // Autogenera el slug mientras no se haya editado a mano.
                    if (!form.getFieldState("slug").isDirty) {
                      form.setValue("slug", slugify(e.target.value));
                    }
                  }}
                  placeholder="Fantasía"
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
                <Input {...field} placeholder="fantasia" />
              </FormControl>
              <FormDescription>
                Se usa en la URL del catálogo. Solo tiene que ser único dentro
                de su tipo de producto.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imagen"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imagen de portada</FormLabel>
              <FormControl>
                <CategoryImageUploader
                  value={field.value ?? null}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormDescription>
                Se muestra en la tarjeta de categoría del Home.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="orden"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Orden</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                />
              </FormControl>
              <FormDescription>Posición en los listados (menor primero).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="activa"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-md border border-linea p-3">
              <div className="space-y-0.5">
                <FormLabel>Activa</FormLabel>
                <FormDescription>Visible en la tienda.</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="destacada"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-md border border-linea p-3">
              <div className="space-y-0.5">
                <FormLabel>Destacada en el Home</FormLabel>
                <FormDescription>
                  Aparece en “Categorías destacadas” del Home, con enlace a su
                  propio catálogo. Necesita tener al menos un producto.
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        <div className="flex gap-3">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? "Guardando…"
              : mode === "create"
                ? "Crear categoría"
                : "Guardar cambios"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/categorias")}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
}
