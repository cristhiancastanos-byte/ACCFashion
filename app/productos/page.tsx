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
  stock: "",
  imagenUrl: ""
};

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [form, setForm] = useState(inicial);
  const [editando, setEditando] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [toast, setToast] = useState<{ tipo: ToastTipo; texto: string } | null>(null);
  const [productoAEliminar, setProductoAEliminar] = useState<Producto | null>(null);
  const [cargando, setCargando] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);

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

  async function subirImagen(file: File) {
    setSubiendoImagen(true);

    try {
      const formData = new FormData();
      formData.append("imagen", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        mostrarToast("error", data.error || "No se pudo subir la imagen.");
        return;
      }

      setForm((prev) => ({
        ...prev,
        imagenUrl: data.imagenUrl
      }));

      mostrarToast("success", "Imagen subida correctamente.");
    } catch {
      mostrarToast("error", "Ocurrió un error al subir la imagen.");
    } finally {
      setSubiendoImagen(false);
    }
  }

  function validarFormulario() {
    if (
      !form.nombre.trim() ||
      !form.categoria.trim() ||
      !form.talla.trim() ||
      !form.color.trim() ||
      !form.precio ||
      !form.stock ||
      !form.imagenUrl
    ) {
      return "Completa todos los campos obligatorios, incluyendo la imagen.";
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
      stock: String(producto.stock),
      imagenUrl: producto.imagenUrl || ""
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
        mostrarToast("error", data.error || "No se pudo eliminar la prenda.");
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
                {productoAEliminar.codigo ||
                  `AAC-${String(productoAEliminar.id).padStart(3, "0")}`}{" "}
                · {productoAEliminar.categoria} · Talla {productoAEliminar.talla}
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

      <section className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <form
          onSubmit={guardar}
          className="glass-card rounded-[2rem] p-6 grid gap-3 h-fit"
        >
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

          <div className="rounded-3xl border border-dorado/25 bg-white/70 p-4">
            <label className="block text-sm font-black text-tinta/70">
              Imagen de la prenda
            </label>

            <input
              type="file"
              accept="image/*"
              className="mt-3 w-full rounded-2xl border border-dorado/25 bg-white px-4 py-3 text-sm"
              disabled={subiendoImagen}
              onChange={(e) => {
                const file = e.target.files?.[0];

                if (file) {
                  subirImagen(file);
                }
              }}
            />

            {subiendoImagen && (
              <p className="mt-2 text-sm font-bold text-magenta">
                Subiendo imagen...
              </p>
            )}

            {form.imagenUrl && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-bold text-tinta/60">
                  Vista previa
                </p>

                <img
                  src={form.imagenUrl}
                  alt="Vista previa de la prenda"
                  className="h-48 w-full rounded-2xl object-cover border border-dorado/20 bg-crema"
                />
              </div>
            )}
          </div>

          <button
            className="btn-primary"
            type="submit"
            disabled={cargando || subiendoImagen}
          >
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

        <div className="glass-card rounded-[2rem] p-6 overflow-hidden min-w-0">
          <div className="mb-4 flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-3 border border-dorado/20">
            <Search className="text-magenta" size={20} />
            <input
              className="w-full bg-transparent outline-none"
              placeholder="Buscar por código, prenda, categoría, talla, color o estado"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto rounded-3xl border border-dorado/20 bg-white/60">
            <table className="w-full min-w-[1050px] table-fixed text-sm">
              <thead>
                <tr className="text-left text-tinta/60">
                  <th className="w-[120px] px-5 py-4">Código</th>
                  <th className="w-[340px] px-5 py-4">Prenda</th>
                  <th className="w-[160px] px-5 py-4">Categoría</th>
                  <th className="w-[130px] px-5 py-4">Precio</th>
                  <th className="w-[90px] px-5 py-4">Stock</th>
                  <th className="w-[170px] px-5 py-4">Estado</th>
                  <th className="w-[150px] px-5 py-4 text-center">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {filtrados.length === 0 ? (
                  <tr>
                    <td
                      className="px-5 py-6 text-center text-tinta/60"
                      colSpan={7}
                    >
                      No hay prendas registradas o no se encontraron coincidencias.
                    </td>
                  </tr>
                ) : (
                  filtrados.map((p) => (
                    <tr
                      key={p.id}
                      className="border-t border-dorado/15 bg-white/45 align-middle"
                    >
                      <td className="px-5 py-4 font-black text-tinta">
                        {p.codigo || `AAC-${String(p.id).padStart(3, "0")}`}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={p.imagenUrl || "/productos/default.webp"}
                            alt={p.nombre}
                            className="h-20 w-20 shrink-0 rounded-2xl object-cover border border-dorado/20 bg-crema"
                          />

                          <div className="min-w-0">
                            <p className="font-black leading-tight text-tinta break-words">
                              {p.nombre}
                            </p>

                            <p className="mt-1 text-xs leading-snug text-tinta/50 break-words">
                              Talla {p.talla} / {p.color}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-tinta/70 break-words">
                        {p.categoria}
                      </td>

                      <td className="px-5 py-4 font-bold text-tinta whitespace-nowrap">
                        ${p.precio.toFixed(2)}
                      </td>

                      <td className="px-5 py-4 text-tinta">{p.stock}</td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-rosaClaro/40 px-4 py-2 text-xs font-black text-magenta whitespace-nowrap">
                          {p.estado.replace("_", " ")}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            className="btn-light !p-3"
                            onClick={() => editar(p)}
                            title="Editar prenda"
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            type="button"
                            className="btn-light !p-3"
                            onClick={() => setProductoAEliminar(p)}
                            title="Eliminar prenda"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
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