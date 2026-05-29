import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [productos, clientas, ventas, bajoStock] = await Promise.all([
      prisma.producto.count(),
      prisma.clienta.count(),
      prisma.venta.findMany({
        include: {
          detalles: {
            include: {
              producto: true,
            },
          },
          clienta: true,
        },
        orderBy: {
          fecha: "desc",
        },
      }),
      prisma.producto.count({
        where: {
          stock: {
            lte: 5,
          },
        },
      }),
    ]);

    const ingresos = ventas.reduce((acc, venta) => acc + Number(venta.total), 0);

    const masVendidos = new Map<string, number>();

    ventas.forEach((venta) => {
      venta.detalles.forEach((detalle) => {
        const nombreProducto = detalle.producto?.nombre || "Producto eliminado";
        const actual = masVendidos.get(nombreProducto) || 0;
        masVendidos.set(nombreProducto, actual + detalle.cantidad);
      });
    });

    const topProductos = Array.from(masVendidos.entries())
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);

    return NextResponse.json({
      prendas: productos,
      productos,
      clientes: clientas,
      clientas,
      ventas: ventas.length,
      ingresos,
      bajoStock,
      ultimasVentas: ventas.slice(0, 5),
      topProductos,
    });
  } catch (error) {
    console.error("Error al cargar dashboard:", error);

    return NextResponse.json(
      {
        prendas: 0,
        productos: 0,
        clientes: 0,
        clientas: 0,
        ventas: 0,
        ingresos: 0,
        bajoStock: 0,
        ultimasVentas: [],
        topProductos: [],
      },
      { status: 500 }
    );
  }
}