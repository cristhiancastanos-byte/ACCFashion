"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  Home,
  ReceiptText,
  ShoppingBag,
  UsersRound
} from "lucide-react";

const items = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/productos", label: "Inventario", icon: Boxes },
  { href: "/clientas", label: "Clientes", icon: UsersRound },
  { href: "/ventas", label: "Ventas", icon: ShoppingBag },
  { href: "/reportes", label: "Reportes", icon: ReceiptText }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="lg:sticky lg:top-0 lg:h-screen lg:w-72 p-4">
      <div className="glass-card h-full rounded-[24px] p-5 flex flex-col">
        <div className="flex flex-col items-center text-center">
          <div className="h-24 w-24 rounded-[14px] bg-white shadow-sm flex items-center justify-center overflow-hidden border border-[rgba(212,175,55,0.25)]">
            <Image
              src="/logo-aac-fashion.png"
              alt="AAC Fashion Boutique"
              width={96}
              height={96}
              className="h-full w-full object-contain p-2"
              priority
            />
          </div>

          <h1 className="mt-5 text-[18px] leading-tight font-black text-[#3B2430]">
            AAC FASHION
          </h1>

          <p className="mt-1 text-[12px] tracking-[0.35em] text-[#C5A059]">
            BOUTIQUE
          </p>
        </div>

        <nav className="mt-8 grid gap-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-[14px] px-4 py-3 font-bold transition ${
                  active
                    ? "bg-[#fff7fb] border border-[rgba(245,66,145,0.28)] text-[#3B2430]"
                    : "text-[#3B2430] hover:bg-[#fff7fb]"
                }`}
              >
                <Icon size={19} className="text-[#F54291]" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-[14px] bg-gradient-to-br from-[#F54291] to-[#FF78AE] p-4 text-white">
          <p className="text-sm font-bold">AAC Fashion Boutique</p>
          <p className="text-xs opacity-90">
            Inventario, clientes y ventas.
          </p>
        </div>
      </div>
    </aside>
  );
}