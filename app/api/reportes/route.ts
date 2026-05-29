import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [ventas, productos, clientas] = await Promise.all([
      prisma.venta.findMany({
        include: {
          clienta: true,
          detalles: {
            include: {
              producto: true
            }
          }
        },
        orderBy: {
          fecha: "desc"
        }
      }),
      prisma.producto.findMany({
        orderBy: {
          id: "asc"
        }
      }),
      prisma.clienta.findMany()
    ]);

    const totalVendido = ventas.reduce((acc, venta) => acc + venta.total, 0);

    const productosBajoStock = productos.filter(
      (producto) => producto.stock > 0 && producto.stock <= 5
    ).length;

    const productosAgotados = productos.filter(
      (producto) => producto.stock <= 0
    ).length;

    const ventasPorDiaMap = new Map<string, number>();

    ventas.forEach((venta) => {
      const fecha = new Date(venta.fecha).toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "short"
      });

      ventasPorDiaMap.set(fecha, (ventasPorDiaMap.get(fecha) || 0) + venta.total);
    });

    const ventasPorDia = Array.from(ventasPorDiaMap.entries())
      .map(([fecha, total]) => ({ fecha, total }))
      .reverse()
      .slice(-7);

    const productosVendidosMap = new Map<
      string,
      {
        nombre: string;
        cantidad: number;
        total: number;
      }
    >();

    ventas.forEach((venta) => {
      venta.detalles.forEach((detalle) => {
        const nombre = detalle.producto?.nombre || "Producto eliminado";

        const actual = productosVendidosMap.get(nombre) || {
          nombre,
          cantidad: 0,
          total: 0
        };

        actual.cantidad += detalle.cantidad;
        actual.total += detalle.subtotal;

        productosVendidosMap.set(nombre, actual);
      });
    });

    const productosMasVendidos = Array.from(productosVendidosMap.values())
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 6);

    const ventasPorCategoriaMap = new Map<
      string,
      {
        categoria: string;
        total: number;
        cantidad: number;
      }
    >();

    ventas.forEach((venta) => {
      venta.detalles.forEach((detalle) => {
        const categoria = detalle.producto?.categoria || "Sin categoría";

        const actual = ventasPorCategoriaMap.get(categoria) || {
          categoria,
          total: 0,
          cantidad: 0
        };

        actual.total += detalle.subtotal;
        actual.cantidad += detalle.cantidad;

        ventasPorCategoriaMap.set(categoria, actual);
      });
    });

    const ventasPorCategoria = Array.from(ventasPorCategoriaMap.values()).sort(
      (a, b) => b.total - a.total
    );

    const stockPorCategoriaMap = new Map<
      string,
      {
        categoria: string;
        stock: number;
      }
    >();

    productos.forEach((producto) => {
      const actual = stockPorCategoriaMap.get(producto.categoria) || {
        categoria: producto.categoria,
        stock: 0
      };

      actual.stock += producto.stock;

      stockPorCategoriaMap.set(producto.categoria, actual);
    });

    const stockPorCategoria = Array.from(stockPorCategoriaMap.values()).sort(
      (a, b) => b.stock - a.stock
    );

    const ultimasVentas = ventas.slice(0, 8).map((venta) => ({
      id: venta.id,
      folio: venta.folio,
      fecha: venta.fecha,
      total: venta.total,
      clienta: venta.clienta?.nombre || "Cliente no registrado"
    }));

    return NextResponse.json({
      resumen: {
        totalVendido,
        totalProductos: productos.length,
        totalClientas: clientas.length,
        totalVentas: ventas.length,
        productosBajoStock,
        productosAgotados
      },
      ventasPorDia,
      productosMasVendidos,
      ventasPorCategoria,
      stockPorCategoria,
      ultimasVentas
    });
  } catch (error) {
    console.error("Error al cargar reportes:", error);

    return NextResponse.json(
      { error: "No se pudieron cargar los reportes." },
      { status: 500 }
    );
  }
}