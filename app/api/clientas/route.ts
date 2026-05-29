import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const clientaId = Number(id);
    const body = await request.json();

    if (Number.isNaN(clientaId)) {
      return NextResponse.json(
        { error: "ID de cliente inválido." },
        { status: 400 }
      );
    }

    const nombre = String(body.nombre || "").trim();
    const telefono = String(body.telefono || "").trim();
    const correo = String(body.correo || "").trim();
    const notas = String(body.notas || "").trim();

    if (!nombre || !telefono) {
      return NextResponse.json(
        { error: "Nombre y teléfono son obligatorios." },
        { status: 400 }
      );
    }

    if (nombre.length < 3) {
      return NextResponse.json(
        { error: "El nombre debe tener al menos 3 caracteres." },
        { status: 400 }
      );
    }

    if (!/^\d{10}$/.test(telefono)) {
      return NextResponse.json(
        { error: "El teléfono debe tener 10 dígitos." },
        { status: 400 }
      );
    }

    if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return NextResponse.json(
        { error: "Ingresa un correo válido." },
        { status: 400 }
      );
    }

    const clienta = await prisma.clienta.update({
      where: {
        id: clientaId
      },
      data: {
        nombre,
        telefono,
        correo: correo || null,
        notas: notas || null
      }
    });

    return NextResponse.json(clienta);
  } catch (error) {
    console.error("Error al actualizar cliente:", error);

    return NextResponse.json(
      { error: "No se pudo actualizar el cliente." },
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
    const clientaId = Number(id);

    if (Number.isNaN(clientaId)) {
      return NextResponse.json(
        { error: "ID de cliente inválido." },
        { status: 400 }
      );
    }

    await prisma.clienta.delete({
      where: {
        id: clientaId
      }
    });

    return NextResponse.json({
      mensaje: "Cliente eliminado correctamente."
    });
  } catch (error) {
    console.error("Error al eliminar cliente:", error);

    return NextResponse.json(
      { error: "No se pudo eliminar el cliente." },
      { status: 500 }
    );
  }
}