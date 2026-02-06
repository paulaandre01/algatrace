'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Home, Leaf, BarChart3, FileText, Wallet, Settings, Droplets, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Início', href: '/' },
  { icon: ShoppingBag, label: 'Mercado', href: '/market' },
  { icon: Leaf, label: 'Projetos', href: '/projects' },
  { icon: Droplets, label: 'Bioprodutos', href: '/projects' }, // Temporarily pointing to projects
  { icon: Wallet, label: 'Créditos', href: '/credits' },
  { icon: BarChart3, label: 'Medições', href: '/measurements' },
  { icon: FileText, label: 'Docs', href: '/docs' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-full w-64 bg-background/95 flex flex-col py-6 border-r border-border backdrop-blur-md shrink-0 z-50 transition-all duration-300">
      {/* Brand Icon */}
      <div className="mb-6 flex justify-center w-full">
        <div className="h-64 w-full relative shrink-0 overflow-hidden">
           <Image 
             src="/logo-new.png" 
             alt="Credita Carbon Logo" 
             fill
             className="object-contain scale-125"
             priority
           />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-4 py-4">
        <p className="px-4 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Menu Principal</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-md group",
                isActive 
                  ? "text-primary-foreground bg-primary border-l-4 border-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <item.icon className={cn("h-5 w-5 transition-colors", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
              <span className="block">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Area */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-secondary cursor-pointer transition-colors">
            <div className="h-8 w-8 rounded bg-primary/20 flex items-center justify-center text-primary font-bold">
                U
            </div>
            <div>
                <p className="text-sm font-medium text-foreground">Usuário Beta</p>
                <p className="text-xs text-muted-foreground">Gerenciar Perfil</p>
            </div>
        </div>
      </div>
    </aside>
  );
}
