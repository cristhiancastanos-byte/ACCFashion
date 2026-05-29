import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function calcularEstado(stock: number) {
  if (stock <= 0) return "AGOTADO";
  if (stock <= 5) return "BAJO_STOCK";
  return "DISPONIBLE";
}

export async function GET() {
  try {
    const productos = await prisma.producto.findMany({
      orderBy: {
        id: "asc"
      }
    });

    return NextResponse.json(productos);
  } catch (error) {
    console.error("Error al cargar productos:", error);

    return NextResponse.json(
      { error: "No se pudieron cargar las prendas." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

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

    const ultimoProducto = await prisma.producto.findFirst({
      orderBy: {
        id: "desc"
      }
    });

    const siguienteNumero = ultimoProducto ? ultimoProducto.id + 1 : 1;
    const codigo = `AAC-${String(siguienteNumero).padStart(3, "0")}`;

    const producto = await prisma.producto.create({
      data: {
        codigo,
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

    return NextResponse.json(producto, { status: 201 });
  } catch (error) {
    console.error("Error al guardar producto:", error);

    return NextResponse.json(
      { error: "Ocurrió un error al guardar la prenda." },
      { status: 500 }
    );
  }
}