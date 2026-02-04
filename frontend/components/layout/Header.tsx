'use client';

import React from 'react';
import { useWallet } from '@/hooks/useWallet';
import { Bell, Search, Menu, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Header() {
  const { isConnected, address, connect } = useWallet();

  return (
    <header className="sticky top-0 z-40 w-full h-20 bg-gradient-to-b from-black/90 to-transparent transition-all duration-300">
      <div className="flex h-full items-center justify-between px-8">
        
        {/* Mobile Menu Trigger & Search */}
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" className="md:hidden text-white">
            <Menu className="h-6 w-6" />
          </Button>
          
          <div className="hidden md:flex items-center gap-2 text-white/80 bg-black/20 border border-white/10 px-3 py-1.5 rounded-sm transition-colors hover:bg-black/40 hover:border-white/20">
             <Search className="h-4 w-4" />
             <input 
               type="text" 
               placeholder="Buscar na Credita..." 
               className="bg-transparent border-none focus:outline-none text-sm w-48 placeholder:text-zinc-400 text-white"
             />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <button className="text-white hover:text-zinc-300 transition-colors">
            <Bell className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            {!isConnected ? (
              <Button 
                onClick={connect}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-sm px-6 py-1.5 text-sm transition-colors"
              >
                Conectar Carteira
              </Button>
            ) : (
              <div className="flex items-center gap-2 group cursor-pointer">
                <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-emerald-500">CONECTADO</p>
                    <p className="text-sm font-medium text-white max-w-[100px] truncate">{address}</p>
                </div>
                <div className="h-8 w-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded flex items-center justify-center text-white font-bold text-xs">
                    {address?.slice(2,4).toUpperCase()}
                </div>
                <ChevronDown className="h-4 w-4 text-white group-hover:rotate-180 transition-transform duration-200" />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
