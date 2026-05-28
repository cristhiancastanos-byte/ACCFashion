import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function validarCliente(body: any) {
  const nombre = String(body.nombre || "").trim();
  const telefono = String(body.telefono || "").trim();
  const correo = String(body.correo || "").trim();

  if (!nombre || !telefono) {
    return "Nombre y teléfono son obligatorios.";
  }

  if (nombre.length < 3) {
    return "El nombre debe tener al menos 3 caracteres.";
  }

  if (!/^\d{10}$/.test(telefono)) {
    return "El teléfono debe tener 10 dígitos.";
  }

  if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return "Ingresa un correo válido.";
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
    const error = validarCliente(body);

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const clienteDuplicado = await prisma.clienta.findFirst({
      where: {
        telefono: String(body.telefono).trim(),
        NOT: {
          id: Number(id)
        }
      }
    });

    if (clienteDuplicado) {
      return NextResponse.json(
        { error: "Ya existe otro cliente registrado con ese teléfono." },
        { status: 409 }
      );
    }

    const cliente = await prisma.clienta.update({
      where: { id: Number(id) },
      data: {
        nombre: String(body.nombre).trim(),
        telefono: String(body.telefono).trim(),
        correo: body.correo ? String(body.correo).trim() : null,
        notas: body.notas ? String(body.notas).trim() : null
      }
    });

    return NextResponse.json(cliente);
  } catch {
    return NextResponse.json(
      { error: "No se pudo actualizar el cliente." },
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

    await prisma.clienta.delete({
      where: { id: Number(id) }
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      {
        error:
          "No se pudo eliminar el cliente. Si ya tiene ventas registradas, debe conservarse para no afectar el historial."
      },
      { status: 409 }
    );
  }
}