import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const categoriasPermitidas = [
  "Vestidos",
  "Blusas",
  "Tops",
  "Pantalones",
  "Faldas",
  "Shorts",
  "Jeans",
  "Blazers",
  "Conjuntos",
  "Accesorios",
  "Bolsas",
  "Calzado"
];

const tallasPermitidas = ["S", "M", "L", "XL", "2XL"];

function estadoPorStock(stock: number) {
  if (stock <= 0) return "AGOTADO";
  if (stock <= 5) return "BAJO_STOCK";
  return "DISPONIBLE";
}

function validarProducto(body: any) {
  const nombre = String(body.nombre || "").trim();
  const categoria = String(body.categoria || "").trim();
  const talla = String(body.talla || "").trim();
  const color = String(body.color || "").trim();
  const precio = Number(body.precio);
  const stock = Number(body.stock);

  if (!nombre || !categoria || !talla || !color || body.precio === "" || body.stock === "") {
    return "Completa todos los campos obligatorios.";
  }

  if (!categoriasPermitidas.includes(categoria)) {
    return "Selecciona una categoría válida.";
  }

  if (!tallasPermitidas.includes(talla)) {
    return "Selecciona una talla válida.";
  }

  if (Number.isNaN(precio) || precio <= 0) {
    return "El precio debe ser mayor a 0.";
  }

  if (Number.isNaN(stock) || stock < 0) {
    return "El stock no puede ser negativo.";
  }

  return null;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const error = validarProducto(body);

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const producto = await prisma.producto.update({
      where: { id: Number(id) },
      data: {
        nombre: String(body.nombre).trim(),
        categoria: String(body.categoria).trim(),
        talla: String(body.talla).trim(),
        color: String(body.color).trim(),
        precio: Number(body.precio),
        stock: Number(body.stock),
        imagenUrl: body.imagenUrl || null,
        estado: estadoPorStock(Number(body.stock))
      }
    });

    return NextResponse.json(producto);
  } catch {
    return NextResponse.json(
      { error: "No se pudo actualizar la prenda." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.producto.delete({
      where: { id: Number(id) }
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      {
        error:
          "No se pudo eliminar la prenda. Si ya fue usada en una venta, debe conservarse para no afectar el historial."
      },
      { status: 409 }
    );
  }
}