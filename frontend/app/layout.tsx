import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Algae Carbon MRV Beta",
  description: "Monitoramento e rastreabilidade de captura de CO2 com algas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.className} flex h-screen overflow-hidden bg-[#141414] text-white selection:bg-emerald-500/30`}>
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden relative z-10">
          <Header />
          <main className="flex-1 overflow-y-auto bg-[#141414] scroll-smooth">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
