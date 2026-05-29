"use client";

import { PageHeader } from "@/components/PageHeader";
import {
  ArrowLeft,
  CalendarDays,
  DollarSign,
  Package,
  ReceiptText,
  ShoppingBag,
  UserRound
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Producto = {
  id: number;
  nombre: string;
  codigo: string | null;
};

type DetalleVenta = {
  id: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  producto: Producto | null;
};

type Venta = {
  id: number;
  folio: string;
  fecha: string;
  total: number;
  detalles: DetalleVenta[];
};

type Clienta = {
  id: number;
  nombre: string;
  telefono: string;
  correo?: string | null;
  notas?: string | null;
  ventas: Venta[];
};

type Data = {
  clienta: Clienta;
  resumen: {
    totalGastado: number;
    totalCompras: number;
    ultimaCompra: string | null;
    productosComprados: number;
  };
};

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN"
});

export default function DetalleClientePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState("");
  const [data, setData] = useState<Data | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    params.then((valor) => setId(valor.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;

    async function cargarDetalle() {
      try {
        setCargando(true);
        setError("");

        const res = await fetch(`/api/clientas/${id}/resumen`);
        const json = await res.json();

        if (!res.ok) {
          setError(json.error || "No se pudo cargar el cliente.");
          return;
        }

        setData(json);
      } catch {
        setError("Ocurrió un error al cargar el detalle.");
      } finally {
        setCargando(false);
      }
    }

    cargarDetalle();
  }, [id]);

  if (cargando) {
    return (
      <div className="w-full max-w-full overflow-hidden">
        <PageHeader
          title="Detalle de cliente"
          subtitle="Consulta la información e historial de compras."
        />

        <div className="glass-card rounded-[2rem] p-8 text-center">
          <p className="font-bold text-tinta/60">Cargando cliente...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full max-w-full overflow-hidden">
        <PageHeader
          title="Detalle de cliente"
          subtitle="Consulta la información e historial de compras."
        />

        <div className="glass-card rounded-[2rem] p-8 text-center">
          <p className="font-bold text-red-600">{error}</p>

          <Link href="/clientes" className="btn-light mt-4 inline-flex">
            Volver a clientes
          </Link>
        </div>
      </div>
    );
  }

  const { clienta, resumen } = data;

  const resumenCards = [
    {
      titulo: "Total gastado",
      valor: money.format(resumen.totalGastado),
      icono: DollarSign
    },
    {
      titulo: "Compras realizadas",
      valor: resumen.totalCompras,
      icono: ReceiptText
    },
    {
      titulo: "Prendas compradas",
      valor: resumen.productosComprados,
      icono: Package
    },
    {
      titulo: "Última compra",
      valor: resumen.ultimaCompra
        ? new Date(resumen.ultimaCompra).toLocaleDateString("es-MX")
        : "Sin compras",
      icono: CalendarDays
    }
  ];

  return (
    <div className="w-full max-w-full overflow-hidden">
      <PageHeader
        title="Detalle de cliente"
        subtitle="Consulta datos generales, ventas realizadas e historial de compras."
      />

      <Link
        href="/clientes"
        className="btn-light mb-5 inline-flex items-center gap-2"
      >
        <ArrowLeft size={18} />
        Volver a clientes
      </Link>

      <section className="grid w-full max-w-full gap-5 overflow-hidden xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="glass-card h-fit rounded-[2rem] p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-3xl bg-rosaClaro/50 p-4 text-magenta">
              <UserRound size={32} />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-bold text-tinta/50">Cliente</p>
              <h3 className="break-words text-2xl font-black text-tinta">
                {clienta.nombre}
              </h3>
            </div>
          </div>

          <div className="mt-6 grid gap-3 rounded-3xl border border-dorado/20 bg-white/70 p-5">
            <div>
              <p className="text-sm font-bold text-tinta/50">Teléfono</p>
              <p className="break-words font-black text-tinta">
                {clienta.telefono}
              </p>
            </div>

            <div>
              <p className="text-sm font-bold text-tinta/50">Correo</p>
              <p className="break-words font-black text-tinta">
                {clienta.correo || "Sin correo"}
              </p>
            </div>

            <div>
              <p className="text-sm font-bold text-tinta/50">Notas</p>
              <p className="break-words font-bold text-tinta/70">
                {clienta.notas || "Sin notas registradas"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid min-w-0 gap-5">
          <div className="grid min-w-0 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            {resumenCards.map((card) => {
              const Icono = card.icono;

              return (
                <div key={card.titulo} className="glass-card rounded-[2rem] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-tinta/50">
                        {card.titulo}
                      </p>

                      <p className="mt-2 break-words text-2xl font-black text-tinta">
                        {card.valor}
                      </p>
                    </div>

                    <div className="shrink-0 rounded-3xl bg-rosaClaro/50 p-3 text-magenta">
                      <Icono size={24} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="glass-card min-w-0 rounded-[2rem] p-6">
            <div className="mb-5 flex items-center gap-2">
              <ShoppingBag className="text-magenta" />
              <h3 className="text-xl font-black text-tinta">
                Historial de compras
              </h3>
            </div>

            {clienta.ventas.length === 0 ? (
              <p className="rounded-3xl bg-white/70 p-6 text-center font-bold text-tinta/60">
                Este cliente todavía no tiene compras registradas.
              </p>
            ) : (
              <div className="max-w-full overflow-x-auto rounded-3xl border border-dorado/20 bg-white/60">
                <table className="w-full min-w-[680px] text-sm">
                  <thead>
                    <tr className="text-left text-tinta/60">
                      <th className="px-5 py-4">Folio</th>
                      <th className="px-5 py-4">Fecha</th>
                      <th className="px-5 py-4">Prendas</th>
                      <th className="px-5 py-4 text-right">Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    {clienta.ventas.map((venta) => (
                      <tr
                        key={venta.id}
                        className="border-t border-dorado/15 bg-white/45 align-middle"
                      >
                        <td className="px-5 py-4 font-black text-tinta">
                          {venta.folio}
                        </td>

                        <td className="px-5 py-4 text-tinta/70">
                          {new Date(venta.fecha).toLocaleString("es-MX")}
                        </td>

                        <td className="px-5 py-4">
                          <div className="grid gap-1">
                            {venta.detalles.map((detalle) => (
                              <p key={detalle.id} className="text-tinta/70">
                                <span className="font-black text-tinta">
                                  {detalle.cantidad}x
                                </span>{" "}
                                {detalle.producto?.nombre || "Producto eliminado"}
                              </p>
                            ))}
                          </div>
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
          </div>
        </div>
      </section>
    </div>
  );
}