import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [productos, clientas, ventas, bajoStock] = await Promise.all([
    prisma.producto.count(),
    prisma.clienta.count(),
    prisma.venta.findMany({ include: { detalles: { include: { producto: true } } }, orderBy: { fecha: "desc" } }),
    prisma.producto.count({ where: { stock: { lte: 5 } } })
  ]);

  const ingresos = ventas.reduce((acc, venta) => acc + venta.total, 0);

  const masVendidos = new Map<string, number>();
  ventas.forEach((venta) => venta.detalles.forEach((detalle) => {
    const actual = masVendidos.get(detalle.producto.nombre) || 0;
    masVendidos.set(detalle.producto.nombre, actual + detalle.cantidad);
  }));

  const topProductos = Array.from(masVendidos.entries())
    .map(([nombre, cantidad]) => ({ nombre, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5);

  return NextResponse.json({ productos, clientas, ventas: ventas.length, ingresos, bajoStock, ultimasVentas: ventas.slice(0, 5), topProductos });
}
