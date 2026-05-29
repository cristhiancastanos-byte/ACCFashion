"use client";

import { PageHeader } from "@/components/PageHeader";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Minus,
  Plus,
  ReceiptText,
  ShoppingBag,
  Trash2
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Producto = {
  id: number;
  codigo: string;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
  estado: string;
  imagenUrl?: string | null;
};

type Cliente = {
  id: number;
  nombre: string;
  telefono: string;
};

type ItemCarrito = {
  producto: Producto;
  cantidad: number;
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

type ToastTipo = "success" | "error";

export default function VentasPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [clientaId, setClientaId] = useState("");
  const [toast, setToast] = useState<{ tipo: ToastTipo; texto: string } | null>(null);
  const [ultimaVenta, setUltimaVenta] = useState<any>(null);
  const [cargando, setCargando] = useState(false);
  const [busquedaProducto, setBusquedaProducto] = useState("");
const [categoriaFiltro, setCategoriaFiltro] = useState("Todas");

  function mostrarToast(tipo: ToastTipo, texto: string) {
    setToast({ tipo, texto });

    setTimeout(() => {
      setToast(null);
    }, 7000);
  }

  async function cargar() {
    try {
      const [resProductos, resClientes] = await Promise.all([
        fetch("/api/productos"),
        fetch("/api/clientas")
      ]);

      const dataProductos = await resProductos.json();
      const dataClientes = await resClientes.json();

      if (!resProductos.ok) {
        mostrarToast("error", dataProductos.error || "No se pudieron cargar las prendas.");
        return;
      }

      if (!resClientes.ok) {
        mostrarToast("error", dataClientes.error || "No se pudieron cargar los clientes.");
        return;
      }

      setProductos(dataProductos);
      setClientes(dataClientes);
    } catch {
      mostrarToast("error", "Ocurrió un error al cargar la información de ventas.");
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  const total = useMemo(() => {
    return carrito.reduce(
      (acc, item) => acc + item.producto.precio * item.cantidad,
      0
    );
  }, [carrito]);

  const productosFiltrados = useMemo(() => {
  return productos.filter((producto) => {
    const coincideCategoria =
      categoriaFiltro === "Todas" || producto.categoria === categoriaFiltro;

    const texto = [
      producto.codigo,
      producto.nombre,
      producto.categoria,
      producto.estado
    ]
      .join(" ")
      .toLowerCase();

    const coincideBusqueda = texto.includes(busquedaProducto.toLowerCase());

    return coincideCategoria && coincideBusqueda;
  });
}, [productos, busquedaProducto, categoriaFiltro]);

  function agregar(producto: Producto) {
    if (producto.stock <= 0) {
      mostrarToast("error", "Esta prenda no tiene stock disponible.");
      return;
    }

    setCarrito((prev) => {
      const existe = prev.find((item) => item.producto.id === producto.id);

      if (existe) {
        if (existe.cantidad >= producto.stock) {
          mostrarToast("error", "No puedes agregar más piezas que el stock disponible.");
          return prev;
        }

        return prev.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }

      return [...prev, { producto, cantidad: 1 }];
    });
  }

  function cambiarCantidad(id: number, cambio: number) {
    setCarrito((prev) =>
      prev.map((item) => {
        if (item.producto.id !== id) return item;

        const cantidad = Math.max(
          1,
          Math.min(item.cantidad + cambio, item.producto.stock)
        );

        return { ...item, cantidad };
      })
    );
  }

  function quitarDelCarrito(id: number) {
    setCarrito((prev) => prev.filter((item) => item.producto.id !== id));
  }

  async function finalizarVenta() {
    if (!clientaId) {
      mostrarToast("error", "Selecciona el cliente al que se realizará la venta.");
      return;
    }

    if (carrito.length === 0) {
      mostrarToast("error", "Agrega al menos una prenda al carrito.");
      return;
    }

    setCargando(true);

    try {
      const res = await fetch("/api/ventas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          clientaId,
          items: carrito.map((item) => ({
            productoId: item.producto.id,
            cantidad: item.cantidad
          }))
        })
      });

      const data = await res.json();

      if (!res.ok) {
        mostrarToast("error", data.error || "No se pudo registrar la venta.");
        return;
      }

      setUltimaVenta(data);
      setCarrito([]);
      setClientaId("");
      mostrarToast("success", `Venta ${data.folio} registrada correctamente.`);
      cargar();
    } catch {
      mostrarToast("error", "Ocurrió un error al registrar la venta.");
    } finally {
      setCargando(false);
    }
  }

  function generarTicket(venta = ultimaVenta) {
    if (!venta) return;

    const doc = new jsPDF();

    const money = new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN"
    });

    doc.setFillColor(245, 66, 145);
    doc.rect(0, 0, 210, 28, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("AAC FASHION BOUTIQUE", 105, 13, { align: "center" });

    doc.setFontSize(10);
    doc.text("Ticket de venta", 105, 21, { align: "center" });

    doc.setTextColor(59, 36, 48);
    doc.setFontSize(12);
    doc.text(`Folio: ${venta.folio}`, 14, 42);
    doc.text(`Cliente: ${venta.clienta?.nombre || "Cliente no registrado"}`, 14, 50);
    doc.text(`Fecha: ${new Date(venta.fecha).toLocaleString("es-MX")}`, 14, 58);

    autoTable(doc, {
      startY: 70,
      head: [["Prenda", "Cantidad", "Precio", "Subtotal"]],
      body: venta.detalles.map((d: any) => [
        d.producto.nombre,
        d.cantidad,
        money.format(d.precioUnitario),
        money.format(d.subtotal)
      ]),
      headStyles: {
        fillColor: [212, 175, 55]
      },
      styles: {
        fontSize: 10
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 12;

    doc.setFontSize(16);
    doc.setTextColor(245, 66, 145);
    doc.text(`Total: ${money.format(venta.total)}`, 196, finalY, {
      align: "right"
    });

    doc.setTextColor(59, 36, 48);
    doc.setFontSize(10);
    doc.text("Gracias por comprar en AAC Fashion Boutique", 105, finalY + 16, {
      align: "center"
    });

    doc.save(`ticket-${venta.folio}.pdf`);
  }

  return (
    <div>
      <PageHeader
        title="Ventas"
        subtitle="Registra ventas, agrega prendas al carrito, descuenta stock y genera ticket PDF."
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

      <section className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <div className="glass-card rounded-[2rem] p-6">
<div className="mb-5 flex flex-col gap-4">
  <div className="flex items-center gap-2">
    <ShoppingBag className="text-magenta" />
    <h3 className="text-xl font-black">Prendas disponibles</h3>
  </div>

  <div className="grid gap-3 md:grid-cols-[1fr_220px]">
    <input
      className="input"
      placeholder="Buscar prenda, código o categoría"
      value={busquedaProducto}
      onChange={(e) => setBusquedaProducto(e.target.value)}
    />

    <select
      className="input"
      value={categoriaFiltro}
      onChange={(e) => setCategoriaFiltro(e.target.value)}
    >
      {categorias.map((categoria) => (
        <option key={categoria} value={categoria}>
          {categoria}
        </option>
      ))}
    </select>
  </div>
</div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {productosFiltrados.length === 0 ? (
              <div className="rounded-3xl bg-white/70 p-5 border border-dorado/20 md:col-span-2 xl:col-span-3">
                <p className="text-center text-tinta/60">
                  No hay prendas disponibles con esos filtros.
                </p>
              </div>
            ) : (
              productosFiltrados.map((p) => (
<div
  key={p.id}
  className="overflow-hidden rounded-[2rem] border border-dorado/20 bg-white/80 shadow-sm"
>
  <div className="h-64 w-full bg-crema">
    <img
      src={p.imagenUrl || "/productos/default.webp"}
      alt={p.nombre}
      className="h-full w-full object-cover"
    />
  </div>

  <div className="p-5">
    <p className="text-xs font-black text-doradoOscuro">
      {p.codigo}
    </p>

    <h4 className="mt-2 line-clamp-2 min-h-[56px] text-xl font-black leading-tight text-tinta">
      {p.nombre}
    </h4>

    <p className="mt-2 text-sm font-bold text-tinta/60">
      Stock: {p.stock}
    </p>

    <div className="mt-5 flex flex-col gap-3">
      <p className="text-2xl font-black text-magenta">
        ${p.precio.toFixed(2)}
      </p>

      <button
        className="btn-primary w-full !py-3 disabled:opacity-50"
        disabled={p.stock <= 0}
        onClick={() => agregar(p)}
      >
        Agregar
      </button>
    </div>
  </div>
</div>
              ))
            )}
          </div>
        </div>

        <div className="glass-card rounded-[2rem] p-6 h-fit">
          <h3 className="text-xl font-black">Carrito</h3>

          <div className="mt-4 grid gap-3">
            <select
              className="input"
              value={clientaId}
              onChange={(e) => setClientaId(e.target.value)}
            >
              <option value="">Selecciona un cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} - {c.telefono}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5 grid gap-3">
            {carrito.length === 0 ? (
              <p className="text-tinta/60">
                No hay prendas agregadas al carrito.
              </p>
            ) : (
              carrito.map((item) => (
                <div
                  key={item.producto.id}
                  className="rounded-2xl bg-white/75 p-4 border border-dorado/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.producto.imagenUrl || "/productos/default.webp"}
                        alt={item.producto.nombre}
                        className="h-14 w-14 rounded-2xl object-cover border border-dorado/20 bg-crema"
                      />

                      <div>
                        <p className="font-black">{item.producto.nombre}</p>
                        <p className="text-xs text-tinta/50">
                          {item.producto.codigo}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="rounded-full bg-red-50 p-2 text-red-500"
                      onClick={() => quitarDelCarrito(item.producto.id)}
                      title="Quitar del carrito"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        className="btn-light !p-2"
                        onClick={() => cambiarCantidad(item.producto.id, -1)}
                      >
                        <Minus size={14} />
                      </button>

                      <span className="font-black">{item.cantidad}</span>

                      <button
                        className="btn-light !p-2"
                        onClick={() => cambiarCantidad(item.producto.id, 1)}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <p className="font-black text-magenta">
                      ${(item.producto.precio * item.cantidad).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-5 rounded-3xl bg-crema p-4 border border-dorado/25 flex justify-between items-center">
            <span className="font-bold">Total</span>
            <span className="text-2xl font-black text-magenta">
              ${total.toFixed(2)}
            </span>
          </div>

          <button
            className="btn-primary mt-4 w-full disabled:opacity-60"
            onClick={finalizarVenta}
            disabled={cargando}
          >
            {cargando ? "Registrando..." : "Finalizar venta"}
          </button>

          {ultimaVenta && (
            <button
              className="btn-light mt-3 w-full flex justify-center gap-2"
              onClick={() => generarTicket()}
            >
              <ReceiptText size={18} />
              Generar ticket PDF
            </button>
          )}
        </div>
      </section>
    </div>
  );
}