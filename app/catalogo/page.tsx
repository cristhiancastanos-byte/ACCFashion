"use client";

import { PageHeader } from "@/components/PageHeader";
import { Search, Sparkles, Tag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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

const categorias = [
  "Todas",
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

const ordenes = [
  { valor: "recientes", texto: "Más recientes" },
  { valor: "precio-menor", texto: "Menor precio" },
  { valor: "precio-mayor", texto: "Mayor precio" },
  { valor: "stock-mayor", texto: "Más stock" },
  { valor: "stock-menor", texto: "Menos stock" },
  { valor: "nombre", texto: "Nombre A-Z" }
];

export default function CatalogoPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [orden, setOrden] = useState("recientes");
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  async function cargarProductos() {
    try {
      setCargando(true);
      setError("");

      const res = await fetch("/api/productos");
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "No se pudieron cargar las prendas.");
        return;
      }

      setProductos(data);
    } catch {
      setError("Ocurrió un error al cargar el catálogo.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarProductos();
  }, []);

  const productosFiltrados = useMemo(() => {
    const filtrados = productos.filter((producto) => {
      const coincideCategoria =
        categoria === "Todas" || producto.categoria === categoria;

      const texto = [
        producto.codigo || "",
        producto.nombre,
        producto.categoria,
        producto.talla,
        producto.color,
        producto.estado
      ]
        .join(" ")
        .toLowerCase();

      const coincideBusqueda = texto.includes(busqueda.toLowerCase());

      return coincideCategoria && coincideBusqueda;
    });

    return [...filtrados].sort((a, b) => {
      if (orden === "precio-menor") return a.precio - b.precio;
      if (orden === "precio-mayor") return b.precio - a.precio;
      if (orden === "stock-mayor") return b.stock - a.stock;
      if (orden === "stock-menor") return a.stock - b.stock;
      if (orden === "nombre") return a.nombre.localeCompare(b.nombre);
      return b.id - a.id;
    });
  }, [productos, busqueda, categoria, orden]);

  function estadoTexto(estado: string) {
    return estado.replace("_", " ");
  }

  function estadoClase(estado: string) {
    if (estado === "AGOTADO") {
      return "bg-red-50 text-red-600 border-red-200";
    }

    if (estado === "BAJO_STOCK") {
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    }

    return "bg-rosaClaro/50 text-magenta border-dorado/20";
  }

  return (
    <div>
      <PageHeader
        title="Catálogo"
        subtitle="Visualiza las prendas disponibles de la boutique con fotografías, precio y disponibilidad."
      />

      <section className="glass-card rounded-[2rem] p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="text-magenta" />
              <h3 className="text-xl font-black text-tinta">
                Catálogo visual de prendas
              </h3>
            </div>

            <p className="mt-1 text-sm text-tinta/60">
              Revisa el inventario como galería y ordena las prendas según lo que necesites.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_190px_190px] xl:w-[760px]">
            <div className="flex items-center gap-3 rounded-2xl border border-dorado/20 bg-white/75 px-4 py-3">
              <Search className="text-magenta" size={20} />
              <input
                className="w-full bg-transparent outline-none"
                placeholder="Buscar prenda, color o talla"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <select
              className="input"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              {categorias.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              className="input"
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
            >
              {ordenes.map((item) => (
                <option key={item.valor} value={item.valor}>
                  {item.texto}
                </option>
              ))}
            </select>
          </div>
        </div>

        {cargando && (
          <div className="mt-8 rounded-3xl border border-dorado/20 bg-white/70 p-8 text-center">
            <p className="font-bold text-tinta/60">Cargando catálogo...</p>
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-3xl border border-red-200 bg-white/80 p-8 text-center">
            <p className="font-bold text-red-600">{error}</p>
          </div>
        )}

        {!cargando && !error && productosFiltrados.length === 0 && (
          <div className="mt-8 rounded-3xl border border-dorado/20 bg-white/70 p-8 text-center">
            <p className="font-bold text-tinta/60">
              No se encontraron prendas con esos filtros.
            </p>
          </div>
        )}

        {!cargando && !error && productosFiltrados.length > 0 && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {productosFiltrados.map((producto) => (
              <article
                key={producto.id}
                className={`group overflow-hidden rounded-[2rem] border border-dorado/20 bg-white/80 shadow-sm transition hover:-translate-y-1 hover:shadow-luxury ${
                  producto.estado === "AGOTADO" ? "opacity-60" : ""
                }`}
              >
                <button
                  type="button"
                  className="block w-full text-left"
                  onClick={() => setProductoSeleccionado(producto)}
                >
                  <div className="relative h-72 w-full overflow-hidden bg-crema">
                    <img
                      src={producto.imagenUrl || "/productos/default.webp"}
                      alt={producto.nombre}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />

                    <div className="absolute left-4 top-4">
                      <span
                        className={`rounded-full border px-4 py-2 text-xs font-black shadow-sm ${estadoClase(
                          producto.estado
                        )}`}
                      >
                        {estadoTexto(producto.estado)}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black text-doradoOscuro">
                          {producto.codigo || `AAC-${String(producto.id).padStart(3, "0")}`}
                        </p>

                        <h4 className="mt-1 text-lg font-black leading-tight text-tinta">
                          {producto.nombre}
                        </h4>
                      </div>

                      <p className="rounded-full bg-rosaClaro/50 px-3 py-1 text-xs font-black text-magenta">
                        {producto.categoria}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-tinta/60">
                        <p>
                          Talla <span className="font-black text-tinta">{producto.talla}</span>
                        </p>
                        <p>
                          Color <span className="font-black text-tinta">{producto.color}</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xl font-black text-magenta">
                          ${producto.precio.toFixed(2)}
                        </p>
                        <p className="text-xs font-bold text-tinta/50">
                          Stock: {producto.stock}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      {productoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="grid w-full max-w-4xl overflow-hidden rounded-[2rem] bg-white shadow-luxury md:grid-cols-[1.1fr_0.9fr]">
            <div className="h-[420px] bg-crema">
              <img
                src={productoSeleccionado.imagenUrl || "/productos/default.webp"}
                alt={productoSeleccionado.nombre}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black text-doradoOscuro">
                    {productoSeleccionado.codigo ||
                      `AAC-${String(productoSeleccionado.id).padStart(3, "0")}`}
                  </p>

                  <h3 className="mt-2 text-3xl font-black leading-tight text-tinta">
                    {productoSeleccionado.nombre}
                  </h3>
                </div>

                <button
                  type="button"
                  className="rounded-full bg-rosaClaro/40 px-4 py-2 text-sm font-black text-magenta"
                  onClick={() => setProductoSeleccionado(null)}
                >
                  Cerrar
                </button>
              </div>

              <div className="mt-5">
                <span
                  className={`inline-flex rounded-full border px-4 py-2 text-sm font-black ${estadoClase(
                    productoSeleccionado.estado
                  )}`}
                >
                  {estadoTexto(productoSeleccionado.estado)}
                </span>
              </div>

              <div className="mt-6 grid gap-3 rounded-3xl border border-dorado/20 bg-crema p-5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-tinta/60">Categoría</span>
                  <span className="font-black text-tinta">
                    {productoSeleccionado.categoria}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-tinta/60">Talla</span>
                  <span className="font-black text-tinta">
                    {productoSeleccionado.talla}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-tinta/60">Color</span>
                  <span className="font-black text-tinta">
                    {productoSeleccionado.color}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-tinta/60">Stock</span>
                  <span className="font-black text-tinta">
                    {productoSeleccionado.stock} piezas
                  </span>
                </div>
              </div>

              <div className="mt-7 rounded-3xl border border-dorado/25 bg-white p-5">
                <div className="flex items-center gap-2 text-doradoOscuro">
                  <Tag size={20} />
                  <span className="font-black">Precio de venta</span>
                </div>

                <p className="mt-2 text-4xl font-black text-magenta">
                  ${productoSeleccionado.precio.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}