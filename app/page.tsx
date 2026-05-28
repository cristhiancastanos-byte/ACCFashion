import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import {
  Boxes,
  DollarSign,
  ShoppingBag,
  Sparkles,
  UsersRound
} from "lucide-react";

async function getDashboard() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  try {
    const res = await fetch(`${baseUrl}/api/dashboard`, { cache: "no-store" });

    if (!res.ok) {
      throw new Error("Error al cargar el panel principal");
    }

    return res.json();
  } catch {
    return {
      productos: 0,
      clientas: 0,
      ventas: 0,
      ingresos: 0,
      ultimasVentas: [],
      topProductos: []
    };
  }
}

export default async function Home() {
  const data = await getDashboard();

  const money = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN"
  });

  return (
    <div>
      <PageHeader
        title="Panel principal"
        subtitle="Resumen general de inventario, clientes, ventas e ingresos registrados."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Prendas"
          value={String(data.productos)}
          detail="Artículos registrados en inventario"
          icon={Boxes}
        />

        <StatCard
          title="Clientes"
          value={String(data.clientas)}
          detail="Personas registradas en el sistema"
          icon={UsersRound}
        />

        <StatCard
          title="Ventas"
          value={String(data.ventas)}
          detail="Ventas guardadas en la base de datos"
          icon={ShoppingBag}
        />

        <StatCard
          title="Ingresos"
          value={money.format(data.ingresos)}
          detail="Total acumulado por ventas"
          icon={DollarSign}
        />
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-2">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <Sparkles className="text-magenta" />

            <h3 className="text-xl font-black">
              Últimas ventas registradas
            </h3>
          </div>

          <div className="mt-5 grid gap-3">
            {data.ultimasVentas.length === 0 ? (
              <p className="text-tinta/60">
                Aún no hay ventas registradas.
              </p>
            ) : (
              data.ultimasVentas.map((venta: any) => (
                <div
                  key={venta.id}
                  className="rounded-xl bg-white/75 p-4 flex items-center justify-between border border-dorado/20"
                >
                  <div>
                    <p className="font-black">{venta.folio}</p>

                    <p className="text-sm text-tinta/60">
                      {venta.clienta?.nombre || "Cliente no registrado"}
                    </p>
                  </div>

                  <p className="font-black text-magenta">
                    {money.format(venta.total)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-xl font-black">
            Prendas más vendidas
          </h3>

          <div className="mt-5 grid gap-3">
            {data.topProductos.length === 0 ? (
              <p className="text-tinta/60">
                Todavía no hay ventas suficientes para mostrar prendas destacadas.
              </p>
            ) : (
              data.topProductos.map((item: any) => (
                <div
                  key={item.nombre}
                  className="rounded-xl bg-white/75 p-4 flex items-center justify-between border border-dorado/20"
                >
                  <p className="font-bold">{item.nombre}</p>

                  <span className="rounded-xl bg-rosaClaro/50 px-3 py-1 text-sm font-black text-magenta">
                    {item.cantidad} pzas
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}