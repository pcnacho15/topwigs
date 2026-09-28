"use client";

import { useFieldArray, type Control } from "react-hook-form";
import { ArrowDown, ArrowUp, Plus, Trash2, X } from "lucide-react";
import type { CategoryInput } from "@/lib/schemas/category";
import { CategoryImageUploader } from "@/components/admin/category-image-uploader";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/shadcn/form";
import { Input } from "@/components/shadcn/input";
import { Button } from "@/components/shadcn/button";

const MAX = 10;

/**
 * Lista de características de la ficha informativa de una categoría. Cada
 * una se numera por su posición (① ② …), igual que se verá en la tienda.
 */
export function CaracteristicasEditor({
  control,
}: {
  control: Control<CategoryInput>;
}) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "caracteristicas",
  });

  return (
    <div className="space-y-4">
      {fields.map((item, i) => (
        <div key={item.id} className="space-y-4 rounded-md border border-linea p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="font-heading text-sm font-bold uppercase tracking-wide text-neon">
              Característica {i + 1}
            </span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => move(i, i - 1)}
                disabled={i === 0}
                aria-label="Subir"
                className="text-humo hover:text-neon"
              >
                <ArrowUp className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => move(i, i + 1)}
                disabled={i === fields.length - 1}
                aria-label="Bajar"
                className="text-humo hover:text-neon"
              >
                <ArrowDown className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(i)}
                aria-label={`Eliminar característica ${i + 1}`}
                className="text-humo hover:text-red-500"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>

          <FormField
            control={control}
            name={`caracteristicas.${i}.titulo`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Lace front pequeño" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`caracteristicas.${i}.imagen`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Foto (opcional)</FormLabel>
                <FormControl>
                  <CategoryImageUploader
                    value={field.value ?? null}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`caracteristicas.${i}.pieImagen`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pie de foto (opcional)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Con un lace amplio se logra una línea de nacimiento natural."
                  />
                </FormControl>
                <FormDescription>Solo se muestra si la característica tiene foto.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`caracteristicas.${i}.puntos`}
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Puntos clave</FormLabel>
                <div className="space-y-2">
                  {field.value.map((punto, j) => {
                    const error = puntoError(fieldState.error, j);
                    return (
                      <div key={j} className="space-y-1">
                        <div className="flex gap-2">
                          <Input
                            value={punto}
                            onChange={(e) =>
                              field.onChange(
                                field.value.map((p, k) => (k === j ? e.target.value : p)),
                              )
                            }
                            placeholder="La parte de lace es hecha a mano por artesanos."
                            aria-label={`Punto ${j + 1}`}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              field.onChange(field.value.filter((_, k) => k !== j))
                            }
                            aria-label={`Quitar punto ${j + 1}`}
                            className="shrink-0 text-humo hover:text-red-500"
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                        {error ? <p className="text-xs text-red-500">{error}</p> : null}
                      </div>
                    );
                  })}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => field.onChange([...field.value, ""])}
                  >
                    <Plus className="size-4" />
                    Agregar punto
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ))}

      {fields.length < MAX ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => append({ titulo: "", imagen: null, pieImagen: "", puntos: [""] })}
        >
          <Plus className="size-4" />
          Agregar característica
        </Button>
      ) : (
        <p className="text-xs text-humo">Máximo {MAX} características.</p>
      )}
    </div>
  );
}

/** Error de un punto concreto: react-hook-form los anida por índice. */
function puntoError(error: unknown, j: number): string | undefined {
  return (error as Record<number, { message?: string } | undefined> | undefined)?.[j]
    ?.message;
}
