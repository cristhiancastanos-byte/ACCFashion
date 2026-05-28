"use client";

import { PageHeader } from "@/components/PageHeader";
import { Edit, Search, Trash2, UserPlus, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Cliente = {
  id: number;
  nombre: string;
  telefono: string;
  correo?: string | null;
  notas?: string | null;
  createdAt: string;
};

type ToastTipo = "success" | "error";

const inicial = {
  nombre: "",
  telefono: "",
  correo: "",
  notas: ""
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [form, setForm] = useState(inicial);
  const [editando, setEditando] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [toast, setToast] = useState<{ tipo: ToastTipo; texto: string } | null>(null);
  const [clienteAEliminar, setClienteAEliminar] = useState<Cliente | null>(null);
  const [cargando, setCargando] = useState(false);

  function mostrarToast(tipo: ToastTipo, texto: string) {
    setToast({ tipo, texto });

    setTimeout(() => {
      setToast(null);
    }, 7000);
  }

  async function cargar() {
    try {
      const res = await fetch("/api/clientas");
      const data = await res.json();

      if (!res.ok) {
        mostrarToast("error", data.error || "No se pudieron cargar los clientes.");
        return;
      }

      setClientes(data);
    } catch {
      mostrarToast("error", "Ocurrió un error al cargar los clientes.");
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  const filtrados = useMemo(() => {
    return clientes.filter((c) =>
      [c.nombre, c.telefono, c.correo || "", c.notas || ""]
        .join(" ")
        .toLowerCase()
        .includes(busqueda.toLowerCase())
    );
  }, [clientes, busqueda]);

  function validarFormulario() {
    const nombre = form.nombre.trim();
    const telefono = form.telefono.trim();
    const correo = form.correo.trim();

    if (!nombre || !telefono) {
      return "Nombre y teléfono son obligatorios.";
    }

    if (nombre.length < 3) {
      return "El nombre debe tener al menos 3 caracteres.";
    }

    if (!/^\d{10}$/.test(telefono)) {
      return "El teléfono debe tener 10 dígitos.";
    }

    if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return "Ingresa un correo válido.";
    }

    return null;
  }

  async function guardar(e: FormEvent) {
    e.preventDefault();

    const error = validarFormulario();

    if (error) {
      mostrarToast("error", error);
      return;
    }

    setCargando(true);

    try {
      const url = editando ? `/api/clientas/${editando}` : "/api/clientas";
      const method = editando ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        mostrarToast("error", data.error || "No se pudo guardar el cliente.");
        return;
      }

      setForm(inicial);
      setEditando(null);
      mostrarToast(
        "success",
        editando ? "Cliente actualizado correctamente." : "Cliente registrado correctamente."
      );
      cargar();
    } catch {
      mostrarToast("error", "Ocurrió un error al guardar el cliente.");
    } finally {
      setCargando(false);
    }
  }

  function editar(cliente: Cliente) {
    setEditando(cliente.id);
    setForm({
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      correo: cliente.correo || "",
      notas: cliente.notas || ""
    });
  }

  function cancelarEdicion() {
    setEditando(null);
    setForm(inicial);
  }

  async function confirmarEliminacion() {
    if (!clienteAEliminar) return;

    setCargando(true);

    try {
      const res = await fetch(`/api/clientas/${clienteAEliminar.id}`, {
        method: "DELETE"
      });

      const data = await res.json();

      if (!res.ok) {
        mostrarToast("error", data.error || "No se pudo eliminar el cliente.");
        return;
      }

      mostrarToast("success", "Cliente eliminado correctamente.");
      setClienteAEliminar(null);
      cargar();
    } catch {
      mostrarToast("error", "Ocurrió un error al eliminar el cliente.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle="Registra, consulta, edita y elimina clientes de la boutique."
      />

      {toast && (
        <div
          className={`fixed right-6 top-6 z-50 max-w-md rounded-2xl px-5 py-4 font-bold shadow-luxury ${
            toast.tipo === "success"
              ? "bg-white text-magenta border border-dorado/30"
              : "bg-white text-red-600 border border-red-200"
          }`}
        >
          {toast.texto}
        </div>
      )}

      {clienteAEliminar && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-luxury border border-dorado/30">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-black">Eliminar cliente</h3>
                <p className="mt-2 text-sm text-tinta/70">
                  ¿Seguro que deseas eliminar este cliente del sistema?
                </p>
              </div>

              <button
                type="button"
                onClick={() => setClienteAEliminar(null)}
                className="rounded-full bg-rosaClaro/30 p-2 text-magenta"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 rounded-2xl bg-crema p-4 border border-dorado/25">
              <p className="font-black">{clienteAEliminar.nombre}</p>
              <p className="text-sm text-tinta/60">
                {clienteAEliminar.telefono}
              </p>
              <p className="text-sm text-tinta/60">
                {clienteAEliminar.correo || "Sin correo registrado"}
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="btn-light"
                onClick={() => setClienteAEliminar(null)}
                disabled={cargando}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="rounded-full bg-red-500 px-5 py-3 font-black text-white shadow-lg disabled:opacity-60"
                onClick={confirmarEliminacion}
                disabled={cargando}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <form onSubmit={guardar} className="glass-card rounded-[2rem] p-6 grid gap-3">
          <div className="flex items-center gap-2">
            <UserPlus className="text-magenta" />
            <h3 className="text-xl font-black">
              {editando ? "Editar cliente" : "Nuevo cliente"}
            </h3>
          </div>

          <input
            className="input"
            placeholder="Nombre completo"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />

          <input
            className="input"
            placeholder="Teléfono"
            value={form.telefono}
            maxLength={10}
            onChange={(e) =>
              setForm({
                ...form,
                telefono: e.target.value.replace(/\D/g, "")
              })
            }
          />

          <input
            className="input"
            placeholder="Correo opcional"
            value={form.correo}
            onChange={(e) => setForm({ ...form, correo: e.target.value })}
          />

          <textarea
            className="input min-h-24"
            placeholder="Notas opcionales"
            value={form.notas}
            onChange={(e) => setForm({ ...form, notas: e.target.value })}
          />

          <button className="btn-primary" type="submit" disabled={cargando}>
            {cargando
              ? "Guardando..."
              : editando
                ? "Guardar cambios"
                : "Registrar cliente"}
          </button>

          {editando && (
            <button
              type="button"
              className="btn-light"
              onClick={cancelarEdicion}
              disabled={cargando}
            >
              Cancelar edición
            </button>
          )}
        </form>

        <div className="glass-card rounded-[2rem] p-6">
          <div className="mb-4 flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-3 border border-dorado/20">
            <Search className="text-magenta" size={20} />

            <input
              className="w-full bg-transparent outline-none"
              placeholder="Buscar por nombre, teléfono, correo o notas"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {filtrados.length === 0 ? (
              <div className="rounded-3xl bg-white/70 p-5 border border-dorado/20 md:col-span-2">
                <p className="text-center text-tinta/60">
                  No hay clientes registrados o no se encontraron coincidencias.
                </p>
              </div>
            ) : (
              filtrados.map((c) => (
                <div
                  key={c.id}
                  className="rounded-3xl bg-white/70 p-5 border border-dorado/20"
                >
                  <p className="text-lg font-black">{c.nombre}</p>
                  <p className="text-sm text-tinta/60">{c.telefono}</p>
                  <p className="text-sm text-tinta/60">
                    {c.correo || "Sin correo registrado"}
                  </p>

                  <p className="mt-2 text-sm">
                    {c.notas || "Sin notas registradas"}
                  </p>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      className="btn-light !p-2"
                      onClick={() => editar(c)}
                      title="Editar cliente"
                    >
                      <Edit size={16} />
                    </button>

                    <button
                      type="button"
                      className="btn-light !p-2"
                      onClick={() => setClienteAEliminar(c)}
                      title="Eliminar cliente"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}