"use client";

import { PageHeader } from "@/components/PageHeader";
import { Edit, Plus, Search, Trash2, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Producto = {
  id: number;
  codigo: string | null;
  nombre: string;
  categoria: string;
  talla: string;
  color: string;
  precio: number;
  stock: number;
  imagenUrl?: string | null;
  estado: string;
};

type ToastTipo = "success" | "error";

const categorias = [
  "Vestidos",
  "Blusas",
  "Tops",
  "Pantalones",
  "Faldas",
  "Shorts",
  "Jeans",
  "Blazers",
  "Conjuntos",
  "Accesorios",
  "Bolsas",
  "Calzado"
];

const tallas = ["S", "M", "L", "XL", "2XL"];

const inicial = {
  nombre: "",
  categoria: "",
  talla: "",
  color: "",
  precio: "",
  stock: ""
};

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [form, setForm] = useState(inicial);
  const [editando, setEditando] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [toast, setToast] = useState<{ tipo: ToastTipo; texto: string } | null>(null);
  const [productoAEliminar, setProductoAEliminar] = useState<Producto | null>(null);
  const [cargando, setCargando] = useState(false);

  function mostrarToast(tipo: ToastTipo, texto: string) {
    setToast({ tipo, texto });

    setTimeout(() => {
      setToast(null);
    }, 7000);
  }

  async function cargar() {
    try {
      const res = await fetch("/api/productos");
      const data = await res.json();

      if (!res.ok) {
        mostrarToast("error", data.error || "No se pudieron cargar las prendas.");
        return;
      }

      setProductos(data);
    } catch {
      mostrarToast("error", "Ocurrió un error al cargar el inventario.");
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  const filtrados = useMemo(() => {
    return productos.filter((p) =>
      [
        p.codigo || "",
        p.nombre,
        p.categoria,
        p.talla,
        p.color,
        p.estado
      ]
        .join(" ")
        .toLowerCase()
        .includes(busqueda.toLowerCase())
    );
  }, [productos, busqueda]);

  function validarFormulario() {
    if (
      !form.nombre.trim() ||
      !form.categoria.trim() ||
      !form.talla.trim() ||
      !form.color.trim() ||
      !form.precio ||
      !form.stock
    ) {
      return "Completa todos los campos obligatorios.";
    }

    if (Number(form.precio) <= 0) {
      return "El precio debe ser mayor a 0.";
    }

    if (Number(form.stock) < 0) {
      return "El stock no puede ser negativo.";
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
      const url = editando ? `/api/productos/${editando}` : "/api/productos";
      const method = editando ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        mostrarToast("error", data.error || "No se pudo guardar la prenda.");
        return;
      }

      setForm(inicial);
      setEditando(null);
      mostrarToast(
        "success",
        editando ? "Prenda actualizada correctamente." : "Prenda registrada correctamente."
      );
      cargar();
    } catch {
      mostrarToast("error", "Ocurrió un error al guardar la prenda.");
    } finally {
      setCargando(false);
    }
  }

  function editar(producto: Producto) {
    setEditando(producto.id);
    setForm({
      nombre: producto.nombre,
      categoria: producto.categoria,
      talla: producto.talla,
      color: producto.color,
      precio: String(producto.precio),
      stock: String(producto.stock)
    });
  }

  function cancelarEdicion() {
    setEditando(null);
    setForm(inicial);
  }

  async function confirmarEliminacion() {
    if (!productoAEliminar) return;

    setCargando(true);

    try {
      const res = await fetch(`/api/productos/${productoAEliminar.id}`, {
        method: "DELETE"
      });

      const data = await res.json();

      if (!res.ok) {
        mostrarToast(
          "error",
          data.error || "No se pudo eliminar la prenda."
        );
        return;
      }

      mostrarToast("success", "Prenda eliminada correctamente.");
      setProductoAEliminar(null);
      cargar();
    } catch {
      mostrarToast("error", "Ocurrió un error al eliminar la prenda.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Inventario"
        subtitle="Registra, consulta, edita y elimina prendas de la boutique."
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

      {productoAEliminar && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-luxury border border-dorado/30">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-black">Eliminar prenda</h3>
                <p className="mt-2 text-sm text-tinta/70">
                  ¿Seguro que deseas eliminar esta prenda del inventario?
                </p>
              </div>

              <button
                type="button"
                onClick={() => setProductoAEliminar(null)}
                className="rounded-full bg-rosaClaro/30 p-2 text-magenta"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 rounded-2xl bg-crema p-4 border border-dorado/25">
              <p className="font-black">{productoAEliminar.nombre}</p>
              <p className="text-sm text-tinta/60">
                {productoAEliminar.codigo || `AAC-${String(productoAEliminar.id).padStart(3, "0")}`} ·{" "}
                {productoAEliminar.categoria} · Talla {productoAEliminar.talla}
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="btn-light"
                onClick={() => setProductoAEliminar(null)}
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
            <Plus className="text-magenta" />
            <h3 className="text-xl font-black">
              {editando ? "Editar prenda" : "Nueva prenda"}
            </h3>
          </div>

          {editando && (
            <p className="rounded-2xl bg-crema p-3 text-sm font-bold text-tinta/70 border border-dorado/25">
              El código de la prenda se mantiene fijo y no se modifica.
            </p>
          )}

          <input
            className="input"
            placeholder="Nombre de la prenda"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />

          <select
            className="input"
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
          >
            <option value="">Selecciona una categoría</option>
            {categorias.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>

          <select
            className="input"
            value={form.talla}
            onChange={(e) => setForm({ ...form, talla: e.target.value })}
          >
            <option value="">Selecciona una talla</option>
            {tallas.map((talla) => (
              <option key={talla} value={talla}>
                {talla}
              </option>
            ))}
          </select>

          <input
            className="input"
            placeholder="Color"
            value={form.color}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              placeholder="Precio"
              value={form.precio}
              onChange={(e) => setForm({ ...form, precio: e.target.value })}
            />

            <input
              className="input"
              type="number"
              min="0"
              step="1"
              placeholder="Stock"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
          </div>

          <button className="btn-primary" type="submit" disabled={cargando}>
            {cargando
              ? "Guardando..."
              : editando
                ? "Guardar cambios"
                : "Registrar prenda"}
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

        <div className="glass-card rounded-[2rem] p-6 overflow-hidden">
          <div className="mb-4 flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-3 border border-dorado/20">
            <Search className="text-magenta" size={20} />
            <input
              className="w-full bg-transparent outline-none"
              placeholder="Buscar por código, prenda, categoría, talla, color o estado"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-tinta/60">
                  <th className="p-3">Código</th>
                  <th>Prenda</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filtrados.length === 0 ? (
                  <tr>
                    <td className="p-5 text-center text-tinta/60" colSpan={7}>
                      No hay prendas registradas o no se encontraron coincidencias.
                    </td>
                  </tr>
                ) : (
                  filtrados.map((p) => (
                    <tr key={p.id} className="border-t border-dorado/15 bg-white/45">
                      <td className="p-3 font-black">
                        {p.codigo || `AAC-${String(p.id).padStart(3, "0")}`}
                      </td>

                      <td>
                        {p.nombre}
                        <p className="text-xs text-tinta/50">
                          Talla {p.talla} / {p.color}
                        </p>
                      </td>

                      <td>{p.categoria}</td>

                      <td>${p.precio.toFixed(2)}</td>

                      <td>{p.stock}</td>

                      <td>
                        <span className="rounded-full bg-rosaClaro/40 px-3 py-1 text-xs font-black text-magenta">
                          {p.estado.replace("_", " ")}
                        </span>
                      </td>

                      <td className="flex gap-2 py-3">
                        <button
                          type="button"
                          className="btn-light !p-2"
                          onClick={() => editar(p)}
                          title="Editar prenda"
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          type="button"
                          className="btn-light !p-2"
                          onClick={() => setProductoAEliminar(p)}
                          title="Eliminar prenda"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}