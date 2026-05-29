import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const archivo = formData.get("imagen");

    if (!archivo || !(archivo instanceof File)) {
      return NextResponse.json(
        { error: "No se recibió ninguna imagen." },
        { status: 400 }
      );
    }

    if (!archivo.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "El archivo debe ser una imagen." },
        { status: 400 }
      );
    }

    if (archivo.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "La imagen no debe pesar más de 5 MB." },
        { status: 400 }
      );
    }

    const bytes = await archivo.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const extension = archivo.name.split(".").pop() || "webp";

    const nombreLimpio = archivo.name
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const nombreFinal = `${Date.now()}-${nombreLimpio}.${extension}`;
    const carpetaDestino = path.join(process.cwd(), "public", "productos");
    const rutaDestino = path.join(carpetaDestino, nombreFinal);

    await mkdir(carpetaDestino, { recursive: true });
    await writeFile(rutaDestino, buffer);

    return NextResponse.json({
      imagenUrl: `/productos/${nombreFinal}`
    });
  } catch (error) {
    return NextResponse.json(
      { error: "No se pudo subir la imagen." },
      { status: 500 }
    );
  }
}