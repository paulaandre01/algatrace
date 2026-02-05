'use client';

import React, { useEffect, useState } from 'react';
import { Activity, Leaf, Wind, Play, Info, Plus, ChevronRight } from "lucide-react";
import { useWallet } from '@/hooks/useWallet';
import { getAlgaeProjectNFT, getCarbonCreditToken, getMRVRegistry } from '@/lib/contracts';
import { ethers } from 'ethers';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function Home() {
  const { wallet } = useWallet();
  const [projectCount, setProjectCount] = useState<number>(0);
  const [creditBalance, setCreditBalance] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  const [heroProject, setHeroProject] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!wallet.isConnected || !wallet.signer || !wallet.address) return;

      setLoading(true);
      try {
        const nftContract = getAlgaeProjectNFT(wallet.signer);
        const tokenContract = getCarbonCreditToken(wallet.signer);

        const balNFT = await nftContract.balanceOf(wallet.address);
        setProjectCount(Number(balNFT));

        const balToken = await tokenContract.balanceOf(wallet.address);
        setCreditBalance(ethers.formatUnits(balToken, 18));
        
        // Mock Hero Data if no project, or fetch first project
        if (Number(balNFT) > 0) {
            setHeroProject({
                name: "Projeto Piloto Alpha",
                description: "Monitoramento de captura de carbono em fotobiorreatores de alta eficiência.",
                id: 1
            });
        } else {
             setHeroProject(null);
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [wallet.isConnected, wallet.signer, wallet.address]);

  return (
    <div className="pb-20 bg-[#141414] min-h-screen">
      
      {/* Hero Section (Netflix Style) */}
      <div className="relative h-[85vh] w-full">
        {/* Background Image / Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/80 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544634289-537446d3962d?q=80&w=2692&auto=format&fit=crop')] bg-cover bg-center opacity-60"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent z-10"></div>

        <div className="relative z-20 flex flex-col justify-center h-full px-8 md:px-16 max-w-4xl space-y-6">
            <div className="flex items-center space-x-2 mb-4">
                 <span className="text-emerald-500 font-bold tracking-widest text-sm uppercase">Original Alga Beta</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight drop-shadow-lg">
                {heroProject ? heroProject.name : "Inicie Sua Jornada"}
            </h1>
            
            <p className="text-lg md:text-xl text-white/90 max-w-2xl font-medium drop-shadow-md">
                {heroProject 
                    ? heroProject.description 
                    : "A revolução da captura de carbono começa aqui. Registre seu primeiro projeto de algas e monitore o impacto ambiental em tempo real na blockchain."}
            </p>
            
            <div className="flex items-center gap-4 mt-8">
                {heroProject ? (
                    <>
                        <Link href={`/projects/${heroProject.id}`}>
                            <Button className="bg-white text-black hover:bg-white/90 font-bold text-lg px-8 py-6 rounded flex items-center gap-3 transition-transform hover:scale-105">
                                <Play className="h-6 w-6 fill-black" />
                                Monitorar Agora
                            </Button>
                        </Link>
                        <Link href="/docs">
                             <Button variant="secondary" className="bg-zinc-600/70 text-white hover:bg-zinc-600/90 font-bold text-lg px-8 py-6 rounded flex items-center gap-3 backdrop-blur-sm transition-transform hover:scale-105">
                                <Info className="h-6 w-6" />
                                Metodologia
                            </Button>
                        </Link>
                    </>
                ) : (
                     <Link href="/projects/new">
                        <Button className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-lg px-8 py-6 rounded flex items-center gap-3 transition-transform hover:scale-105 shadow-[0_0_20px_rgba(5,150,105,0.5)]">
                            <Plus className="h-6 w-6" />
                            Criar Primeiro Projeto
                        </Button>
                    </Link>
                )}
            </div>
        </div>
      </div>

      {/* Content Rails */}
      <div className="px-8 md:px-16 space-y-12 -mt-32 relative z-30">
        
        {/* Stats Rail */}
        <section>
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2 group cursor-pointer">
                Suas Estatísticas <ChevronRight className="h-4 w-4 text-white/50 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100" />
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#1f1f1f] hover:bg-[#2a2a2a] transition-colors p-6 rounded-md group cursor-pointer border border-white/5 hover:border-white/20">
                    <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-2">Projetos Ativos</p>
                    <div className="flex items-end justify-between">
                        <span className="text-4xl font-bold text-white">{loading ? "-" : projectCount}</span>
                        <Leaf className="h-6 w-6 text-emerald-500 mb-2 opacity-80" />
                    </div>
                </div>
                <div className="bg-[#1f1f1f] hover:bg-[#2a2a2a] transition-colors p-6 rounded-md group cursor-pointer border border-white/5 hover:border-white/20">
                    <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-2">Saldo de Créditos</p>
                    <div className="flex items-end justify-between">
                        <span className="text-4xl font-bold text-white">{loading ? "-" : parseFloat(creditBalance).toFixed(1)}</span>
                        <Wind className="h-6 w-6 text-blue-500 mb-2 opacity-80" />
                    </div>
                </div>
                <div className="bg-[#1f1f1f] hover:bg-[#2a2a2a] transition-colors p-6 rounded-md group cursor-pointer border border-white/5 hover:border-white/20">
                    <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-2">Redução de CO₂e Total</p>
                    <div className="flex items-end justify-between">
                        <span className="text-4xl font-bold text-white">--</span>
                        <Activity className="h-6 w-6 text-purple-500 mb-2 opacity-80" />
                    </div>
                </div>
                 <div className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/20 hover:from-emerald-900/70 transition-colors p-6 rounded-md group cursor-pointer border border-emerald-500/20 flex flex-col justify-center items-center text-center">
                    <p className="text-emerald-400 text-sm font-bold uppercase tracking-wider mb-1">Mercado & Investimentos</p>
                    <span className="text-xl font-bold text-white">Tokens de Projeto</span>
                    <span className="text-xs text-zinc-400 mt-1">(Em Breve)</span>
                </div>
            </div>
        </section>

        {/* Projects Rail */}
        <section>
            <h3 className="text-xl font-semibold text-white mb-4">Meus Projetos</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                 {/* Project Card Mockup */}
                 {[1, 2, 3].map((i) => (
                    <div key={i} className="min-w-[280px] h-[160px] bg-zinc-800 rounded-md relative overflow-hidden group cursor-pointer transition-transform hover:scale-105 hover:z-50 duration-300">
                        <div className={`absolute inset-0 bg-gradient-to-br ${i === 1 ? 'from-emerald-800 to-zinc-900' : 'from-blue-900 to-zinc-900'}`}></div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-10 transition-opacity">
                            <Leaf className="h-16 w-16 text-white" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
                            <h4 className="text-white font-bold text-lg">Projeto #{i}</h4>
                            <p className="text-green-400 text-xs font-semibold flex items-center mt-1">
                                <span className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                                98% Compatível
                            </p>
                        </div>
                    </div>
                 ))}
                 
                 {/* Add New Project Card */}
                 <Link href="/projects/new">
                    <div className="min-w-[280px] h-[160px] bg-zinc-900 border-2 border-dashed border-zinc-700 rounded-md flex flex-col items-center justify-center text-zinc-500 hover:text-white hover:border-white hover:bg-zinc-800 transition-all cursor-pointer">
                        <Plus className="h-8 w-8 mb-2" />
                        <span className="font-medium">Adicionar Projeto</span>
                    </div>
                 </Link>
            </div>
        </section>

      </div>
    </div>
  );
}
