"use client";

import { PageHeader } from "@/components/PageHeader";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download, ReceiptText } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Venta = {
  id: number;
  folio: string;
  total: number;
  fecha: string;
  clienta?: {
    nombre: string;
  } | null;
  detalles: any[];
};

type ToastTipo = "success" | "error";

export default function ReportesPage() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [toast, setToast] = useState<{ tipo: ToastTipo; texto: string } | null>(null);

  const money = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN"
  });

  function mostrarToast(tipo: ToastTipo, texto: string) {
    setToast({ tipo, texto });

    setTimeout(() => {
      setToast(null);
    }, 7000);
  }

  async function cargar() {
    try {
      const res = await fetch("/api/ventas");
      const data = await res.json();

      if (!res.ok) {
        mostrarToast("error", data.error || "No se pudieron cargar las ventas.");
        return;
      }

      setVentas(data);
    } catch {
      mostrarToast("error", "Ocurrió un error al cargar los reportes.");
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  const total = useMemo(() => {
    return ventas.reduce((acc, venta) => acc + venta.total, 0);
  }, [ventas]);

  function generarReporteGeneral() {
    if (ventas.length === 0) {
      mostrarToast("error", "No hay ventas registradas para generar el reporte.");
      return;
    }

    const doc = new jsPDF();

    doc.setFillColor(245, 66, 145);
    doc.rect(0, 0, 210, 32, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("AAC FASHION BOUTIQUE", 105, 14, { align: "center" });

    doc.setFontSize(10);
    doc.text("Reporte general de ventas", 105, 23, { align: "center" });

    doc.setTextColor(59, 36, 48);
    doc.setFontSize(12);
    doc.text(`Total de ventas: ${ventas.length}`, 14, 45);
    doc.text(`Ingresos acumulados: ${money.format(total)}`, 14, 53);
    doc.text(`Fecha de generación: ${new Date().toLocaleString("es-MX")}`, 14, 61);

    autoTable(doc, {
      startY: 72,
      head: [["Folio", "Cliente", "Fecha", "Total"]],
      body: ventas.map((venta) => [
        venta.folio,
        venta.clienta?.nombre || "Cliente no registrado",
        new Date(venta.fecha).toLocaleDateString("es-MX"),
        money.format(venta.total)
      ]),
      headStyles: {
        fillColor: [212, 175, 55]
      },
      styles: {
        fontSize: 9
      }
    });

    doc.save("reporte-general-aac-fashion.pdf");
  }

  function generarTicket(venta: Venta) {
    const doc = new jsPDF();

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

    doc.save(`ticket-${venta.folio}.pdf`);
  }

  return (
    <div>
      <PageHeader
        title="Reportes PDF"
        subtitle="Consulta las ventas registradas y genera tickets o reportes descargables."
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

      <div className="glass-card rounded-[2rem] p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-black">Historial de ventas</h3>
            <p className="text-sm text-tinta/60">
              Total registrado: {money.format(total)}
            </p>
          </div>

          <button
            className="btn-primary flex items-center justify-center gap-2"
            onClick={generarReporteGeneral}
          >
            <Download size={18} />
            Descargar reporte general
          </button>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-tinta/60">
                <th className="p-3">Folio</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>PDF</th>
              </tr>
            </thead>

            <tbody>
              {ventas.length === 0 ? (
                <tr>
                  <td className="p-5 text-center text-tinta/60" colSpan={5}>
                    No hay ventas registradas.
                  </td>
                </tr>
              ) : (
                ventas.map((venta) => (
                  <tr
                    key={venta.id}
                    className="border-t border-dorado/15 bg-white/45"
                  >
                    <td className="p-3 font-black">{venta.folio}</td>

                    <td>{venta.clienta?.nombre || "Cliente no registrado"}</td>

                    <td>
                      {new Date(venta.fecha).toLocaleDateString("es-MX")}
                    </td>

                    <td className="font-black text-magenta">
                      {money.format(venta.total)}
                    </td>

                    <td>
                      <button
                        className="btn-light !p-2"
                        onClick={() => generarTicket(venta)}
                      >
                        <ReceiptText size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}