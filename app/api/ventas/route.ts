import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function estadoPorStock(stock: number) {
  if (stock <= 0) return "AGOTADO";
  if (stock <= 5) return "BAJO_STOCK";
  return "DISPONIBLE";
}

function generarFolio() {
  return `AAC-${Date.now().toString().slice(-7)}`;
}

export async function GET() {
  try {
    const ventas = await prisma.venta.findMany({
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
    });

    return NextResponse.json(ventas);
  } catch {
    return NextResponse.json(
      { error: "No se pudieron cargar las ventas." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const clientaId = body.clientaId ? Number(body.clientaId) : null;
    const items = body.items as Array<{ productoId: number; cantidad: number }>;

    if (!clientaId) {
      return NextResponse.json(
        { error: "Selecciona el cliente al que se realizará la venta." },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Agrega al menos una prenda al carrito." },
        { status: 400 }
      );
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const cliente = await tx.clienta.findUnique({
        where: {
          id: clientaId
        }
      });

      if (!cliente) {
        throw new Error("Cliente no encontrado.");
      }

      const productos = await tx.producto.findMany({
        where: {
          id: {
            in: items.map((item) => item.productoId)
          }
        }
      });

      for (const item of items) {
        const producto = productos.find((p) => p.id === item.productoId);

        if (!producto) {
          throw new Error("Una de las prendas seleccionadas no existe.");
        }

        if (item.cantidad <= 0) {
          throw new Error("La cantidad debe ser mayor a 0.");
        }

        if (producto.stock < item.cantidad) {
          throw new Error(`Stock insuficiente para ${producto.nombre}.`);
        }
      }

      const total = items.reduce((acc, item) => {
        const producto = productos.find((p) => p.id === item.productoId)!;
        return acc + producto.precio * item.cantidad;
      }, 0);

      const venta = await tx.venta.create({
        data: {
          folio: generarFolio(),
          clientaId,
          total,
          detalles: {
            create: items.map((item) => {
              const producto = productos.find((p) => p.id === item.productoId)!;

              return {
                productoId: producto.id,
                cantidad: item.cantidad,
                precioUnitario: producto.precio,
                subtotal: producto.precio * item.cantidad
              };
            })
          }
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

      for (const item of items) {
        const producto = productos.find((p) => p.id === item.productoId)!;
        const nuevoStock = producto.stock - item.cantidad;

        await tx.producto.update({
          where: {
            id: producto.id
          },
          data: {
            stock: nuevoStock,
            estado: estadoPorStock(nuevoStock)
          }
        });
      }

      return venta;
    });

    return NextResponse.json(resultado, { status: 201 });
  } catch (error) {
    const mensaje =
      error instanceof Error ? error.message : "No se pudo registrar la venta.";

    return NextResponse.json(
      { error: mensaje },
      { status: 400 }
    );
  }
}