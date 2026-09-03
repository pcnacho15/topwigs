"use client";

import { useState, type FormEvent } from "react";
import { RetroWindow } from "@/components/ui/retro-window";
import { Button } from "@/components/ui/button";
import { Input, FieldLabel, Textarea } from "@/components/ui/input";
import {
  customerInfoSchema,
  EMPTY_CUSTOMER_INFO,
  type CustomerInfo,
} from "@/lib/schemas/customer-info";
import {
  clearLocalCustomerInfo,
  writeLocalCustomerInfo,
} from "@/lib/customer-info-storage";
import {
  deleteSavedCustomerInfo,
  saveCustomerInfo,
} from "@/app/(store)/checkout/customer-actions";

/**
 * Datos de facturación guardados, editables desde el perfil. Mantiene en
 * sincronía la copia del navegador con la de la cuenta: lo que se guarda o
 * se borra aquí también se guarda o se borra en localStorage, para que el
 * checkout no vuelva a precargar algo que el cliente acaba de eliminar.
 */
export function SavedAddressCard({ initial }: { initial: CustomerInfo | null }) {
  const [info, setInfo] = useState<CustomerInfo | null>(initial);
  const [editando, setEditando] = useState(initial === null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const parsed = customerInfoSchema.safeParse({
      nombre: String(form.get("nombre") ?? ""),
      email: String(form.get("email") ?? ""),
      telefono: String(form.get("telefono") ?? ""),
      direccion: String(form.get("direccion") ?? ""),
      departamento: String(form.get("departamento") ?? ""),
      municipio: String(form.get("municipio") ?? ""),
      barrio: String(form.get("barrio") ?? ""),
      indicaciones: String(form.get("indicaciones") ?? ""),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Revisa los datos");
      setLoading(false);
      return;
    }

    const res = await saveCustomerInfo(parsed.data);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    writeLocalCustomerInfo(parsed.data);
    setInfo(parsed.data);
    setEditando(false);
  }

  async function onDelete() {
    setLoading(true);
    await deleteSavedCustomerInfo();
    clearLocalCustomerInfo();
    setInfo(null);
    setEditando(true);
    setLoading(false);
  }

  const base = info ?? EMPTY_CUSTOMER_INFO;

  return (
    <RetroWindow title="direccion.exe">
      <div className="space-y-5 p-6 sm:p-8">
        <div>
          <h2 className="font-heading text-lg font-bold uppercase tracking-wide">
            Mis datos de envío
          </h2>
          <p className="mt-1 text-xs text-humo">
            Se usan para precargar el checkout. Puedes cambiarlos cuando
            quieras.
          </p>
        </div>

        {editando ? (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <FieldLabel htmlFor="sa-nombre">Nombre completo</FieldLabel>
              <Input
                id="sa-nombre"
                name="nombre"
                required
                autoComplete="name"
                defaultValue={base.nombre}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="sa-email">Correo electrónico</FieldLabel>
                <Input
                  id="sa-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  defaultValue={base.email}
                />
              </div>
              <div>
                <FieldLabel htmlFor="sa-telefono">Teléfono</FieldLabel>
                <Input
                  id="sa-telefono"
                  name="telefono"
                  type="tel"
                  required
                  autoComplete="tel"
                  defaultValue={base.telefono}
                />
              </div>
            </div>
            <div>
              <FieldLabel htmlFor="sa-direccion">Dirección exacta</FieldLabel>
              <Input
                id="sa-direccion"
                name="direccion"
                required
                autoComplete="street-address"
                defaultValue={base.direccion}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="sa-departamento">Departamento</FieldLabel>
                <Input
                  id="sa-departamento"
                  name="departamento"
                  required
                  autoComplete="address-level1"
                  defaultValue={base.departamento}
                />
              </div>
              <div>
                <FieldLabel htmlFor="sa-municipio">
                  Municipio / Ciudad
                </FieldLabel>
                <Input
                  id="sa-municipio"
                  name="municipio"
                  required
                  autoComplete="address-level2"
                  defaultValue={base.municipio}
                />
              </div>
            </div>
            <div>
              <FieldLabel htmlFor="sa-barrio">Barrio</FieldLabel>
              <Input
                id="sa-barrio"
                name="barrio"
                required
                autoComplete="address-level3"
                defaultValue={base.barrio}
              />
            </div>
            <div>
              <FieldLabel htmlFor="sa-indicaciones">
                Indicaciones de entrega (opcional)
              </FieldLabel>
              <Textarea
                id="sa-indicaciones"
                name="indicaciones"
                defaultValue={base.indicaciones}
              />
            </div>

            {error ? (
              <p role="alert" className="text-sm text-neon">
                {error}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando…" : "Guardar datos"}
              </Button>
              {info ? (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={loading}
                  onClick={() => {
                    setError(null);
                    setEditando(false);
                  }}
                >
                  Cancelar
                </Button>
              ) : null}
            </div>
          </form>
        ) : (
          <>
            <dl className="space-y-3">
              <Dato label="Nombre" value={base.nombre} />
              <Dato label="Correo" value={base.email} />
              <Dato label="Teléfono" value={base.telefono} />
              <Dato
                label="Dirección"
                value={`${base.direccion} · ${base.barrio}, ${base.municipio}, ${base.departamento}`}
              />
              {base.indicaciones ? (
                <Dato label="Indicaciones" value={base.indicaciones} />
              ) : null}
            </dl>
            <div className="flex flex-wrap gap-3 pt-1">
              <Button
                variant="outline"
                onClick={() => setEditando(true)}
                disabled={loading}
              >
                Editar
              </Button>
              <Button variant="ghost" onClick={onDelete} disabled={loading}>
                {loading ? "Borrando…" : "Borrar datos guardados"}
              </Button>
            </div>
          </>
        )}
      </div>
    </RetroWindow>
  );
}

function Dato({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-heading text-xs font-semibold uppercase tracking-wide text-humo">
        {label}
      </dt>
      <dd className="text-blanco">{value}</dd>
    </div>
  );
}
