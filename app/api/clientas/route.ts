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

export async function GET() {
  try {
    const clientes = await prisma.clienta.findMany({
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(clientes);
  } catch {
    return NextResponse.json(
      { error: "No se pudieron cargar los clientes." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const error = validarCliente(body);

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const clienteExistente = await prisma.clienta.findFirst({
      where: {
        telefono: String(body.telefono).trim()
      }
    });

    if (clienteExistente) {
      return NextResponse.json(
        { error: "Ya existe un cliente registrado con ese teléfono." },
        { status: 409 }
      );
    }

    const cliente = await prisma.clienta.create({
      data: {
        nombre: String(body.nombre).trim(),
        telefono: String(body.telefono).trim(),
        correo: body.correo ? String(body.correo).trim() : null,
        notas: body.notas ? String(body.notas).trim() : null
      }
    });

    return NextResponse.json(cliente, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "No se pudo registrar el cliente." },
      { status: 500 }
    );
  }
}