import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const clientaId = Number(id);

    if (Number.isNaN(clientaId)) {
      return NextResponse.json(
        { error: "ID de cliente inválido." },
        { status: 400 }
      );
    }

    const clienta = await prisma.clienta.findUnique({
      where: {
        id: clientaId
      },
      include: {
        ventas: {
          include: {
            detalles: {
              include: {
                producto: true
              }
            }
          },
          orderBy: {
            fecha: "desc"
          }
        }
      }
    });

    if (!clienta) {
      return NextResponse.json(
        { error: "No se encontró el cliente." },
        { status: 404 }
      );
    }

    const totalGastado = clienta.ventas.reduce(
      (acc, venta) => acc + venta.total,
      0
    );

    const productosComprados = clienta.ventas.reduce((acc, venta) => {
      const cantidad = venta.detalles.reduce(
        (sum, detalle) => sum + detalle.cantidad,
        0
      );

      return acc + cantidad;
    }, 0);

    return NextResponse.json({
      clienta,
      resumen: {
        totalGastado,
        totalCompras: clienta.ventas.length,
        ultimaCompra: clienta.ventas[0]?.fecha || null,
        productosComprados
      }
    });
  } catch (error) {
    console.error("Error al cargar resumen de cliente:", error);

    return NextResponse.json(
      { error: "No se pudo cargar el detalle del cliente." },
      { status: 500 }
    );
  }
}