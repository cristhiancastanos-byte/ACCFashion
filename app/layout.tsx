import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "AAC Fashion Boutique",
  description: "Sistema de gestión para boutique de moda",
  icons: {
    icon: "/logo-aac-fashion.png",
    shortcut: "/logo-aac-fashion.png",
    apple: "/logo-aac-fashion.png"
  }
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <div className="min-h-screen lg:flex">
          <Sidebar />

          <main className="flex-1 px-5 py-6 lg:px-8 lg:py-7">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}