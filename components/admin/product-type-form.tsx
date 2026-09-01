"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  productTypeSchema,
  type ProductTypeInput,
} from "@/lib/schemas/product-type";
import { createTipo, updateTipo } from "@/app/admin/tipos/actions";
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
import { slugify } from "@/lib/utils";

interface Props {
  mode: "create" | "edit";
  id?: string;
  initial?: ProductTypeInput;
}

export function ProductTypeForm({ mode, id, initial }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ProductTypeInput>({
    resolver: zodResolver(productTypeSchema),
    defaultValues:
      initial ?? {
        nombre: "",
        label: "",
        slug: "",
        descripcion: "",
        orden: 0,
        activo: true,
      },
  });

  async function onSubmit(values: ProductTypeInput) {
    setError(null);
    const res =
      mode === "create"
        ? await createTipo(values)
        : await updateTipo(id!, values);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.push("/admin/tipos");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-lg space-y-6"
      >
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre (singular)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    // El plural y el slug se autocompletan mientras no se
                    // hayan editado a mano.
                    if (!form.getFieldState("label").isDirty) {
                      form.setValue("label", `${e.target.value}s`);
                    }
                    if (!form.getFieldState("slug").isDirty) {
                      form.setValue("slug", slugify(`${e.target.value}s`));
                    }
                  }}
                  placeholder="Peluca"
                />
              </FormControl>
              <FormDescription>
                Como se nombra un producto suelto: “Peluca”, “Lente”, “Gorra”.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Etiqueta (plural)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Pelucas" />
              </FormControl>
              <FormDescription>
                Es lo que se ve en el menú, el pie de página y el título del
                catálogo.
              </FormDescription>
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
                <Input {...field} placeholder="pelucas" />
              </FormControl>
              <FormDescription>
                Es la URL del catálogo: /{field.value || "slug"}. Si lo cambias,
                los enlaces viejos dejan de funcionar.
              </FormDescription>
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
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormDescription>
                Se usa como descripción de la página (SEO).
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
              <FormDescription>
                Posición en el menú (menor primero).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="activo"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-md border border-linea p-3">
              <div className="space-y-0.5">
                <FormLabel>Activo</FormLabel>
                <FormDescription>
                  Visible en la tienda: aparece en el menú y su catálogo abre.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
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
                ? "Crear tipo de producto"
                : "Guardar cambios"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/tipos")}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
}
