import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.detalleVenta.deleteMany();
  await prisma.venta.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.clienta.deleteMany();

  await prisma.producto.createMany({
    data: [
      {
        codigo: "AAC-001",
        nombre: "Vestido Satinado Aurora",
        categoria: "Vestidos",
        talla: "M",
        color: "Rosa",
        precio: 899,
        stock: 12,
        estado: "DISPONIBLE"
      },
      {
        codigo: "AAC-002",
        nombre: "Blazer Gold Luxe",
        categoria: "Blazers",
        talla: "S",
        color: "Dorado",
        precio: 1199,
        stock: 5,
        estado: "BAJO_STOCK"
      },
      {
        codigo: "AAC-003",
        nombre: "Bolsa Mini Magenta",
        categoria: "Bolsas",
        talla: "S",
        color: "Magenta",
        precio: 549,
        stock: 18,
        estado: "DISPONIBLE"
      },
      {
        codigo: "AAC-004",
        nombre: "Top Perla Boutique",
        categoria: "Tops",
        talla: "L",
        color: "Crema",
        precio: 399,
        stock: 20,
        estado: "DISPONIBLE"
      },
      {
        codigo: "AAC-005",
        nombre: "Falda Rose Night",
        categoria: "Faldas",
        talla: "M",
        color: "Rosa Claro",
        precio: 699,
        stock: 0,
        estado: "AGOTADO"
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
    ]
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