'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Leaf, BarChart3, FileText, Wallet, Settings, Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Início', href: '/' },
  { icon: Leaf, label: 'Projetos', href: '/projects' },
  { icon: Droplets, label: 'Bioprodutos', href: '/projects' }, // Temporarily pointing to projects
  { icon: Wallet, label: 'Créditos', href: '/credits' },
  { icon: BarChart3, label: 'Medições', href: '/measurements' },
  { icon: FileText, label: 'Docs', href: '/docs' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-full w-64 bg-black/90 flex flex-col py-6 border-r border-white/5 backdrop-blur-md shrink-0 z-50 transition-all duration-300">
      {/* Brand Icon */}
      <div className="mb-10 px-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-green-700 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(2,151,56,0.5)] shrink-0">
             <Leaf className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">Credita Carbon</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-4 py-4">
        <p className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Menu Principal</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-md group",
                isActive 
                  ? "text-white bg-zinc-800 border-l-4 border-emerald-500" 
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              )}
            >
              <item.icon className={cn("h-5 w-5 transition-colors", isActive ? "text-emerald-500" : "text-zinc-500 group-hover:text-white")} />
              <span className="block">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Area */}
      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-zinc-900 cursor-pointer transition-colors">
            <div className="h-8 w-8 rounded bg-emerald-900/50 flex items-center justify-center text-emerald-500 font-bold">
                U
            </div>
            <div>
                <p className="text-sm font-medium text-white">Usuário Beta</p>
                <p className="text-xs text-zinc-500">Gerenciar Perfil</p>
            </div>
        </div>
      </div>
    </aside>
  );
}
