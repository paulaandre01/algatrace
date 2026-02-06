'use client';

import React from 'react';
import { useWallet } from '@/hooks/useWallet';
import { Bell, Search, Menu, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Header() {
  const { isConnected, address, connect, chainId, switchNetwork } = useWallet();
  const targetChainId = Number(process.env.NEXT_PUBLIC_TARGET_CHAIN_ID || 31337);

  return (
    <header className="sticky top-0 z-40 w-full h-20 bg-gradient-to-b from-background/90 to-transparent transition-all duration-300">
      <div className="flex h-full items-center justify-between px-8">
        
        {/* Mobile Menu Trigger & Search */}
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" className="md:hidden text-foreground">
            <Menu className="h-6 w-6" />
          </Button>
          
          <div className="hidden md:flex items-center gap-2 text-muted-foreground bg-secondary/50 border border-border px-3 py-1.5 rounded-sm transition-colors hover:bg-secondary hover:border-border/80">
             <Search className="h-4 w-4" />
             <input 
               type="text" 
               placeholder="Buscar na Credita..." 
               className="bg-transparent border-none focus:outline-none text-sm w-48 placeholder:text-muted-foreground text-foreground"
             />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Bell className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            {isConnected && chainId !== targetChainId && (
              <Button
                onClick={switchNetwork}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-sm px-4 py-1.5 text-xs transition-colors"
              >
                Trocar Rede
              </Button>
            )}
            {!isConnected ? (
              <Button 
                onClick={connect}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-sm px-6 py-1.5 text-sm transition-colors"
              >
                Conectar Carteira
              </Button>
            ) : (
              <div className="flex items-center gap-2 group cursor-pointer">
                <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-primary">CONECTADO</p>
                    <p className="text-sm font-medium text-foreground max-w-[100px] truncate">{address}</p>
                </div>
                <div className="h-8 w-8 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold text-xs">
                    {address?.slice(2,4).toUpperCase()}
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:rotate-180 transition-transform duration-200" />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
