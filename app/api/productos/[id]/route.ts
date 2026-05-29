import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function calcularEstado(stock: number) {
  if (stock <= 0) return "AGOTADO";
  if (stock <= 5) return "BAJO_STOCK";
  return "DISPONIBLE";
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const productoId = Number(id);
    const body = await request.json();

    if (Number.isNaN(productoId)) {
      return NextResponse.json(
        { error: "ID de producto inválido." },
        { status: 400 }
      );
    }

    if (
      !body.nombre ||
      !body.categoria ||
      !body.talla ||
      !body.color ||
      body.precio === undefined ||
      body.stock === undefined ||
      !body.imagenUrl
    ) {
      return NextResponse.json(
        { error: "Completa todos los campos obligatorios, incluyendo la imagen." },
        { status: 400 }
      );
    }

    const precio = Number(body.precio);
    const stock = Number(body.stock);

    if (Number.isNaN(precio) || precio <= 0) {
      return NextResponse.json(
        { error: "El precio debe ser mayor a 0." },
        { status: 400 }
      );
    }

    if (Number.isNaN(stock) || stock < 0) {
      return NextResponse.json(
        { error: "El stock no puede ser negativo." },
        { status: 400 }
      );
    }

    const producto = await prisma.producto.update({
      where: {
        id: productoId
      },
      data: {
        nombre: body.nombre.trim(),
        categoria: body.categoria.trim(),
        talla: body.talla.trim(),
        color: body.color.trim(),
        precio,
        stock,
        imagenUrl: body.imagenUrl,
        estado: calcularEstado(stock)
      }
    });

    return NextResponse.json(producto);
  } catch (error) {
    console.error("Error al actualizar producto:", error);

    return NextResponse.json(
      { error: "No se pudo actualizar la prenda." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const productoId = Number(id);

    if (Number.isNaN(productoId)) {
      return NextResponse.json(
        { error: "ID de producto inválido." },
        { status: 400 }
      );
    }

    await prisma.producto.delete({
      where: {
        id: productoId
      }
    });

    return NextResponse.json({
      mensaje: "Prenda eliminada correctamente."
    });
  } catch (error) {
    console.error("Error al eliminar producto:", error);

    return NextResponse.json(
      { error: "No se pudo eliminar la prenda." },
      { status: 500 }
    );
  }
}