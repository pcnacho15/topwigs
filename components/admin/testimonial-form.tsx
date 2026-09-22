"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  testimonialSchema,
  type TestimonialInput,
} from "@/lib/schemas/testimonial";
import {
  createTestimonio,
  updateTestimonio,
} from "@/app/admin/testimonios/actions";
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
import { TestimonialAvatarUploader } from "@/components/admin/testimonial-avatar-uploader";

interface Props {
  mode: "create" | "edit";
  id?: string;
  initial?: TestimonialInput;
}

const EMPTY: TestimonialInput = {
  nombre: "",
  ubicacion: "",
  texto: "",
  rating: 5,
  avatarUrl: null,
  orden: 0,
  activo: true,
};

export function TestimonialForm({ mode, id, initial }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<TestimonialInput>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: initial ?? EMPTY,
  });

  async function onSubmit(values: TestimonialInput) {
    setError(null);
    const res =
      mode === "create"
        ? await createTestimonio(values)
        : await updateTestimonio(id!, values);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.push("/admin/testimonios");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-lg space-y-6"
      >
        <FormItem>
          <FormLabel>Foto (opcional)</FormLabel>
          <Controller
            control={form.control}
            name="avatarUrl"
            render={({ field }) => (
              <TestimonialAvatarUploader
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <FormDescription>
            Si no subes una foto, se muestra un avatar con la inicial del
            nombre.
          </FormDescription>
        </FormItem>

        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del cliente</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Valentina G." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ubicacion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ubicación (opcional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Medellín" />
              </FormControl>
              <FormDescription>
                Se muestra debajo del nombre, p. ej. &quot;Medellín&quot; o
                &quot;Cliente verificada&quot;. Déjalo vacío si no quieres
                mostrar nada.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="texto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Testimonio</FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  {...field}
                  placeholder="La calidad de la fibra me sorprendió, se siente súper natural…"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Calificación</FormLabel>
              <Select
                value={String(field.value)}
                onValueChange={(v) => field.onChange(Number(v))}
              >
                <FormControl>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {"★".repeat(n)}
                      {"☆".repeat(5 - n)}
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
                Posición en el carrusel del Home (menor primero).
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
                  Visible en la sección &quot;Lo que dicen de nosotras&quot;
                  del Home.
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
                ? "Crear testimonio"
                : "Guardar cambios"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/testimonios")}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
}
