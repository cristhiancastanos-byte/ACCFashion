"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { PageHeader } from "@/components/PageHeader";
import {
  AlertTriangle,
  BarChart3,
  Boxes,
  CalendarDays,
  Crown,
  DollarSign,
  Package,
  ReceiptText,
  ShoppingBag,
  UsersRound
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Resumen = {
  totalVendido: number;
  totalProductos: number;
  totalClientas: number;
  totalVentas: number;
  productosBajoStock: number;
  productosAgotados: number;
};

type VentaDia = {
  fecha: string;
  total: number;
};

type ProductoVendido = {
  nombre: string;
  cantidad: number;
  total: number;
};

type VentaCategoria = {
  categoria: string;
  total: number;
  cantidad: number;
};

type StockCategoria = {
  categoria: string;
  stock: number;
};

type UltimaVenta = {
  id: number;
  folio: string;
  fecha: string;
  total: number;
  clienta: string;
};

type ReportesData = {
  resumen: Resumen;
  ventasPorDia: VentaDia[];
  productosMasVendidos: ProductoVendido[];
  ventasPorCategoria: VentaCategoria[];
  stockPorCategoria: StockCategoria[];
  ultimasVentas: UltimaVenta[];
};

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN"
});

export default function ReportesPage() {
  const [data, setData] = useState<ReportesData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  async function cargarReportes() {
    try {
      setCargando(true);
      setError("");

      const res = await fetch("/api/reportes");
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "No se pudieron cargar los reportes.");
        return;
      }

      setData(json);
    } catch {
      setError("Ocurrió un error al cargar los reportes.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarReportes();
  }, []);

  const maxVentaDia = useMemo(() => {
    if (!data || data.ventasPorDia.length === 0) return 1;
    return Math.max(...data.ventasPorDia.map((item) => item.total));
  }, [data]);

  const maxProductoVendido = useMemo(() => {
    if (!data || data.productosMasVendidos.length === 0) return 1;
    return Math.max(...data.productosMasVendidos.map((item) => item.cantidad));
  }, [data]);

  const maxCategoria = useMemo(() => {
    if (!data || data.ventasPorCategoria.length === 0) return 1;
    return Math.max(...data.ventasPorCategoria.map((item) => item.total));
  }, [data]);

  const maxStock = useMemo(() => {
    if (!data || data.stockPorCategoria.length === 0) return 1;
    return Math.max(...data.stockPorCategoria.map((item) => item.stock));
  }, [data]);

  if (cargando) {
    return (
      <div>
        <PageHeader
          title="Reportes"
          subtitle="Consulta el comportamiento de ventas, productos y stock de la boutique."
        />

        <div className="glass-card rounded-[2rem] p-8 text-center">
          <p className="font-bold text-tinta/60">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div>
        <PageHeader
          title="Reportes"
          subtitle="Consulta el comportamiento de ventas, productos y stock de la boutique."
        />

        <div className="glass-card rounded-[2rem] p-8 text-center">
          <p className="font-bold text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const resumenCards = [
    {
      titulo: "Total vendido",
      valor: money.format(data.resumen.totalVendido),
      icono: DollarSign
    },
    {
      titulo: "Ventas registradas",
      valor: data.resumen.totalVentas,
      icono: ReceiptText
    },
    {
      titulo: "Productos",
      valor: data.resumen.totalProductos,
      icono: Boxes
    },
    {
      titulo: "Clientes",
      valor: data.resumen.totalClientas,
      icono: UsersRound
    },
    {
      titulo: "Bajo stock",
      valor: data.resumen.productosBajoStock,
      icono: AlertTriangle
    },
    {
      titulo: "Agotados",
      valor: data.resumen.productosAgotados,
      icono: Package
    }
  ];

  return (
    <div>
      <PageHeader
        title="Reportes"
        subtitle="Consulta gráficas de ventas, productos más vendidos, categorías y stock."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {resumenCards.map((card) => {
          const Icono = card.icono;

          return (
            <div
              key={card.titulo}
              className="glass-card rounded-[2rem] p-5"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-tinta/55">
                    {card.titulo}
                  </p>

                  <p className="mt-2 text-3xl font-black text-tinta">
                    {card.valor}
                  </p>
                </div>

                <div className="rounded-3xl bg-rosaClaro/50 p-4 text-magenta">
                  <Icono size={28} />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        <div className="glass-card rounded-[2rem] p-6">
          <div className="mb-5 flex items-center gap-2">
            <CalendarDays className="text-magenta" />
            <div>
              <h3 className="text-xl font-black text-tinta">
                Ventas por día
              </h3>
              <p className="text-sm text-tinta/60">
                Comparación de ventas recientes.
              </p>
            </div>
          </div>

          {data.ventasPorDia.length === 0 ? (
            <p className="rounded-3xl bg-white/70 p-6 text-center font-bold text-tinta/60">
              Todavía no hay ventas registradas.
            </p>
          ) : (
            <div className="grid gap-4">
              {data.ventasPorDia.map((item) => {
                const porcentaje = Math.max((item.total / maxVentaDia) * 100, 8);

                return (
                  <div key={item.fecha}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="font-black text-tinta">
                        {item.fecha}
                      </span>
                      <span className="font-bold text-magenta">
                        {money.format(item.total)}
                      </span>
                    </div>

                    <div className="h-4 overflow-hidden rounded-full bg-crema border border-dorado/20">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-pink-400 to-yellow-300"
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="glass-card rounded-[2rem] p-6">
          <div className="mb-5 flex items-center gap-2">
            <Crown className="text-magenta" />
            <div>
              <h3 className="text-xl font-black text-tinta">
                Productos más vendidos
              </h3>
              <p className="text-sm text-tinta/60">
                Prendas con mayor movimiento.
              </p>
            </div>
          </div>

          {data.productosMasVendidos.length === 0 ? (
            <p className="rounded-3xl bg-white/70 p-6 text-center font-bold text-tinta/60">
              Aún no hay productos vendidos.
            </p>
          ) : (
            <div className="grid gap-4">
              {data.productosMasVendidos.map((item, index) => {
                const porcentaje = Math.max(
                  (item.cantidad / maxProductoVendido) * 100,
                  8
                );

                return (
                  <div key={item.nombre}>
                    <div className="mb-2 flex items-start justify-between gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rosaClaro/50 text-xs font-black text-magenta">
                          {index + 1}
                        </span>

                        <span className="font-black text-tinta">
                          {item.nombre}
                        </span>
                      </div>

                      <span className="whitespace-nowrap font-bold text-magenta">
                        {item.cantidad} pzas.
                      </span>
                    </div>

                    <div className="h-4 overflow-hidden rounded-full bg-crema border border-dorado/20">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-pink-400 to-yellow-300"
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        <div className="glass-card rounded-[2rem] p-6">
          <div className="mb-5 flex items-center gap-2">
            <BarChart3 className="text-magenta" />
            <div>
              <h3 className="text-xl font-black text-tinta">
                Ventas por categoría
              </h3>
              <p className="text-sm text-tinta/60">
                Monto vendido por tipo de prenda.
              </p>
            </div>
          </div>

          {data.ventasPorCategoria.length === 0 ? (
            <p className="rounded-3xl bg-white/70 p-6 text-center font-bold text-tinta/60">
              No hay ventas por categoría todavía.
            </p>
          ) : (
            <div className="grid gap-4">
              {data.ventasPorCategoria.map((item) => {
                const porcentaje = Math.max((item.total / maxCategoria) * 100, 8);

                return (
                  <div key={item.categoria}>
                    <div className="mb-2 flex justify-between gap-3 text-sm">
                      <span className="font-black text-tinta">
                        {item.categoria}
                      </span>

                      <span className="font-bold text-magenta">
                        {money.format(item.total)}
                      </span>
                    </div>

                    <div className="h-4 overflow-hidden rounded-full bg-crema border border-dorado/20">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-pink-400 to-yellow-300"
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>

                    <p className="mt-1 text-xs font-bold text-tinta/50">
                      {item.cantidad} piezas vendidas
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="glass-card rounded-[2rem] p-6">
          <div className="mb-5 flex items-center gap-2">
            <ShoppingBag className="text-magenta" />
            <div>
              <h3 className="text-xl font-black text-tinta">
                Stock por categoría
              </h3>
              <p className="text-sm text-tinta/60">
                Distribución actual del inventario.
              </p>
            </div>
          </div>

          {data.stockPorCategoria.length === 0 ? (
            <p className="rounded-3xl bg-white/70 p-6 text-center font-bold text-tinta/60">
              No hay stock registrado.
            </p>
          ) : (
            <div className="grid gap-4">
              {data.stockPorCategoria.map((item) => {
                const porcentaje = Math.max((item.stock / maxStock) * 100, 8);

                return (
                  <div key={item.categoria}>
                    <div className="mb-2 flex justify-between gap-3 text-sm">
                      <span className="font-black text-tinta">
                        {item.categoria}
                      </span>

                      <span className="font-bold text-magenta">
                        {item.stock} pzas.
                      </span>
                    </div>

                    <div className="h-4 overflow-hidden rounded-full bg-crema border border-dorado/20">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-pink-400 to-yellow-300"
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="mt-5 glass-card rounded-[2rem] p-6">
        <div className="mb-5 flex items-center gap-2">
          <ReceiptText className="text-magenta" />
          <div>
            <h3 className="text-xl font-black text-tinta">
              Últimas ventas
            </h3>
            <p className="text-sm text-tinta/60">
              Registro reciente de operaciones.
            </p>
          </div>
        </div>

        {data.ultimasVentas.length === 0 ? (
          <p className="rounded-3xl bg-white/70 p-6 text-center font-bold text-tinta/60">
            Todavía no hay ventas registradas.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-dorado/20 bg-white/60">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="text-left text-tinta/60">
                  <th className="px-5 py-4">Folio</th>
                  <th className="px-5 py-4">Cliente</th>
                  <th className="px-5 py-4">Fecha</th>
                  <th className="px-5 py-4 text-right">Total</th>
                </tr>
              </thead>

              <tbody>
                {data.ultimasVentas.map((venta) => (
                  <tr
                    key={venta.id}
                    className="border-t border-dorado/15 bg-white/45"
                  >
                    <td className="px-5 py-4 font-black text-tinta">
                      {venta.folio}
                    </td>

                    <td className="px-5 py-4 text-tinta/70">
                      {venta.clienta}
                    </td>

                    <td className="px-5 py-4 text-tinta/70">
                      {new Date(venta.fecha).toLocaleString("es-MX")}
                    </td>

                    <td className="px-5 py-4 text-right font-black text-magenta">
                      {money.format(venta.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}