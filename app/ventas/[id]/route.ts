import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const ventaId = Number(id);

    if (Number.isNaN(ventaId)) {
      return NextResponse.json(
        { error: "ID de venta inválido." },
        { status: 400 }
      );
    }

    const venta = await prisma.venta.findUnique({
      where: {
        id: ventaId
      },
      include: {
        clienta: true,
        detalles: {
          include: {
            producto: true
          }
        }
      }
    });

    if (!venta) {
      return NextResponse.json(
        { error: "No se encontró la venta." },
        { status: 404 }
      );
    }

    return NextResponse.json(venta);
  } catch (error) {
    console.error("Error al obtener venta:", error);

    return NextResponse.json(
      { error: "No se pudo obtener la venta." },
      { status: 500 }
    );
  }
}