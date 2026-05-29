import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function estadoPorStock(stock: number) {
  if (stock <= 0) return "AGOTADO";
  if (stock <= 5) return "BAJO_STOCK";
  return "DISPONIBLE";
}

async function main() {
  await prisma.detalleVenta.deleteMany();
  await prisma.venta.deleteMany();
  await prisma.producto.deleteMany();

  await prisma.producto.createMany({
    data: [
      {
        codigo: "AAC-001",
        nombre: "Bolsa Roja",
        categoria: "Bolsas",
        talla: "S",
        color: "Rojo",
        precio: 549,
        stock: 12,
        imagenUrl: "/productos/bolsa-roja.webp",
        estado: estadoPorStock(12)
      },
      {
        codigo: "AAC-002",
        nombre: "Bolsa Casual",
        categoria: "Bolsas",
        talla: "S",
        color: "Neutro",
        precio: 499,
        stock: 10,
        imagenUrl: "/productos/bolsa.webp",
        estado: estadoPorStock(10)
      },
      {
        codigo: "AAC-003",
        nombre: "Conjunto Amarillo",
        categoria: "Conjuntos",
        talla: "M",
        color: "Amarillo",
        precio: 899,
        stock: 8,
        imagenUrl: "/productos/conjunto-amarillo.webp",
        estado: estadoPorStock(8)
      },
      {
        codigo: "AAC-004",
        nombre: "Conjunto Boutique",
        categoria: "Conjuntos",
        talla: "M",
        color: "Variado",
        precio: 849,
        stock: 9,
        imagenUrl: "/productos/conjunto.webp",
        estado: estadoPorStock(9)
      },
      {
        codigo: "AAC-005",
        nombre: "Blazer Negro",
        categoria: "Blazers",
        talla: "M",
        color: "Negro",
        precio: 999,
        stock: 5,
        imagenUrl: "/productos/blazer-negro.webp",
        estado: estadoPorStock(5)
      },
      {
        codigo: "AAC-006",
        nombre: "Blazer Elegante",
        categoria: "Blazers",
        talla: "S",
        color: "Neutro",
        precio: 949,
        stock: 7,
        imagenUrl: "/productos/blazer.webp",
        estado: estadoPorStock(7)
      },
      {
        codigo: "AAC-007",
        nombre: "Jeans Azul",
        categoria: "Jeans",
        talla: "M",
        color: "Azul",
        precio: 649,
        stock: 14,
        imagenUrl: "/productos/jeans-azul.webp",
        estado: estadoPorStock(14)
      },
      {
        codigo: "AAC-008",
        nombre: "Jeans Casual",
        categoria: "Jeans",
        talla: "L",
        color: "Azul",
        precio: 599,
        stock: 13,
        imagenUrl: "/productos/jeans.webp",
        estado: estadoPorStock(13)
      },
      {
        codigo: "AAC-009",
        nombre: "Short Café",
        categoria: "Shorts",
        talla: "M",
        color: "Café",
        precio: 399,
        stock: 11,
        imagenUrl: "/productos/short-cafe.webp",
        estado: estadoPorStock(11)
      },
      {
        codigo: "AAC-010",
        nombre: "Short Casual",
        categoria: "Shorts",
        talla: "S",
        color: "Neutro",
        precio: 379,
        stock: 15,
        imagenUrl: "/productos/short.webp",
        estado: estadoPorStock(15)
      },
      {
        codigo: "AAC-011",
        nombre: "Falda Boutique",
        categoria: "Faldas",
        talla: "M",
        color: "Neutro",
        precio: 499,
        stock: 10,
        imagenUrl: "/productos/falda.webp",
        estado: estadoPorStock(10)
      },
      {
        codigo: "AAC-012",
        nombre: "Falda Azul",
        categoria: "Faldas",
        talla: "M",
        color: "Azul",
        precio: 529,
        stock: 9,
        imagenUrl: "/productos/falda-azul.webp",
        estado: estadoPorStock(9)
      },
      {
        codigo: "AAC-013",
        nombre: "Top Morado",
        categoria: "Tops",
        talla: "S",
        color: "Morado",
        precio: 329,
        stock: 16,
        imagenUrl: "/productos/top-morado.webp",
        estado: estadoPorStock(16)
      },
      {
        codigo: "AAC-014",
        nombre: "Top Negro",
        categoria: "Tops",
        talla: "S",
        color: "Negro",
        precio: 349,
        stock: 18,
        imagenUrl: "/productos/top-negro.webp",
        estado: estadoPorStock(18)
      },
      {
        codigo: "AAC-015",
        nombre: "Aretes Elegantes",
        categoria: "Accesorios",
        talla: "S",
        color: "Dorado",
        precio: 199,
        stock: 25,
        imagenUrl: "/productos/aretes.webp",
        estado: estadoPorStock(25)
      },
      {
        codigo: "AAC-016",
        nombre: "Calzado Negro",
        categoria: "Calzado",
        talla: "M",
        color: "Negro",
        precio: 799,
        stock: 6,
        imagenUrl: "/productos/calzado-negro.webp",
        estado: estadoPorStock(6)
      },
      {
        codigo: "AAC-017",
        nombre: "Calzado Gris",
        categoria: "Calzado",
        talla: "M",
        color: "Gris",
        precio: 749,
        stock: 7,
        imagenUrl: "/productos/calzado-gris.webp",
        estado: estadoPorStock(7)
      },
      {
        codigo: "AAC-018",
        nombre: "Pantalón Azul",
        categoria: "Pantalones",
        talla: "M",
        color: "Azul",
        precio: 649,
        stock: 10,
        imagenUrl: "/productos/pantalon-azul.webp",
        estado: estadoPorStock(10)
      },
      {
        codigo: "AAC-019",
        nombre: "Pantalón Café",
        categoria: "Pantalones",
        talla: "L",
        color: "Café",
        precio: 649,
        stock: 8,
        imagenUrl: "/productos/pantalon-cafe.webp",
        estado: estadoPorStock(8)
      },
      {
        codigo: "AAC-020",
        nombre: "Pantalón Negro",
        categoria: "Pantalones",
        talla: "M",
        color: "Negro",
        precio: 699,
        stock: 12,
        imagenUrl: "/productos/pantalon-negro.webp",
        estado: estadoPorStock(12)
      },
      {
        codigo: "AAC-021",
        nombre: "Pantalón Gris",
        categoria: "Pantalones",
        talla: "L",
        color: "Gris",
        precio: 679,
        stock: 9,
        imagenUrl: "/productos/pantalon-gris.webp",
        estado: estadoPorStock(9)
      },
      {
        codigo: "AAC-022",
        nombre: "Vestido Blanco",
        categoria: "Vestidos",
        talla: "M",
        color: "Blanco",
        precio: 899,
        stock: 10,
        imagenUrl: "/productos/vestido-blanco.webp",
        estado: estadoPorStock(10)
      },
      {
        codigo: "AAC-023",
        nombre: "Vestido Gris",
        categoria: "Vestidos",
        talla: "M",
        color: "Gris",
        precio: 849,
        stock: 8,
        imagenUrl: "/productos/vestido-gris.webp",
        estado: estadoPorStock(8)
      },
      {
        codigo: "AAC-024",
        nombre: "Vestido Café",
        categoria: "Vestidos",
        talla: "M",
        color: "Café",
        precio: 879,
        stock: 7,
        imagenUrl: "/productos/vestido-cafe.webp",
        estado: estadoPorStock(7)
      },
      {
        codigo: "AAC-025",
        nombre: "Vestido Rojo",
        categoria: "Vestidos",
        talla: "M",
        color: "Rojo",
        precio: 929,
        stock: 6,
        imagenUrl: "/productos/vestido-rojo.webp",
        estado: estadoPorStock(6)
      },
      {
        codigo: "AAC-026",
        nombre: "Vestido Rosa",
        categoria: "Vestidos",
        talla: "S",
        color: "Rosa",
        precio: 899,
        stock: 11,
        imagenUrl: "/productos/vestido-rosa.webp",
        estado: estadoPorStock(11)
      },
      {
        codigo: "AAC-027",
        nombre: "Vestido Negro",
        categoria: "Vestidos",
        talla: "M",
        color: "Negro",
        precio: 949,
        stock: 5,
        imagenUrl: "/productos/vestido-negro.webp",
        estado: estadoPorStock(5)
      },
      {
        codigo: "AAC-028",
        nombre: "Blusa Negra",
        categoria: "Blusas",
        talla: "M",
        color: "Negro",
        precio: 399,
        stock: 14,
        imagenUrl: "/productos/blusa-negra.webp",
        estado: estadoPorStock(14)
      },
      {
        codigo: "AAC-029",
        nombre: "Blusa Morada",
        categoria: "Blusas",
        talla: "S",
        color: "Morado",
        precio: 379,
        stock: 12,
        imagenUrl: "/productos/blusa-morada.webp",
        estado: estadoPorStock(12)
      },
      {
        codigo: "AAC-030",
        nombre: "Blusa Verde",
        categoria: "Blusas",
        talla: "M",
        color: "Verde",
        precio: 399,
        stock: 10,
        imagenUrl: "/productos/blusa-verde.webp",
        estado: estadoPorStock(10)
      },
      {
        codigo: "AAC-031",
        nombre: "Blusa Amarilla",
        categoria: "Blusas",
        talla: "S",
        color: "Amarillo",
        precio: 379,
        stock: 13,
        imagenUrl: "/productos/blusa-amarilla.webp",
        estado: estadoPorStock(13)
      },
      {
        codigo: "AAC-032",
        nombre: "Blusa Café",
        categoria: "Blusas",
        talla: "M",
        color: "Café",
        precio: 389,
        stock: 9,
        imagenUrl: "/productos/blusa-cafe.webp",
        estado: estadoPorStock(9)
      },
      {
        codigo: "AAC-033",
        nombre: "Blusa Blanca",
        categoria: "Blusas",
        talla: "M",
        color: "Blanco",
        precio: 399,
        stock: 15,
        imagenUrl: "/productos/blusa-blanca.webp",
        estado: estadoPorStock(15)
      },
      {
        codigo: "AAC-034",
        nombre: "Blusa Azul",
        categoria: "Blusas",
        talla: "S",
        color: "Azul",
        precio: 379,
        stock: 10,
        imagenUrl: "/productos/blusa-azul.webp",
        estado: estadoPorStock(10)
      },
      {
        codigo: "AAC-035",
        nombre: "Blusa Roja",
        categoria: "Blusas",
        talla: "M",
        color: "Rojo",
        precio: 399,
        stock: 11,
        imagenUrl: "/productos/blusa-roja.webp",
        estado: estadoPorStock(11)
      },
      {
        codigo: "AAC-036",
        nombre: "Blusa Rosa",
        categoria: "Blusas",
        talla: "S",
        color: "Rosa",
        precio: 389,
        stock: 12,
        imagenUrl: "/productos/blusa-rosa.webp",
        estado: estadoPorStock(12)
      }
    ]
  });

  await prisma.clienta.createMany({
    data: [
      {
        nombre: "Mariana López",
        telefono: "6861234567",
        correo: "mariana@email.com",
        notas: "Prefiere prendas rosas"
      },
      {
        nombre: "Camila Torres",
        telefono: "6867654321",
        correo: "camila@email.com",
        notas: "Compra accesorios seguido"
      }
    ],
    skipDuplicates: true
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });