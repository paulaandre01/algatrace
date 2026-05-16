'use client';

import React, { useEffect, useState } from 'react';
import { Activity, Leaf, Wind, Play, Info, Plus, ChevronRight } from "lucide-react";
import { useWallet } from '@/hooks/useWallet';
import { getAlgCO2Balance, listLocalProjects } from '@/lib/stellar';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { RecentActivity } from '@/components/dashboard/RecentActivity';

export default function Home() {
  const { wallet } = useWallet();
  const [projectCount, setProjectCount] = useState<number>(0);
  const [creditBalance, setCreditBalance] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  const [heroProject, setHeroProject] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!wallet.isConnected || !wallet.publicKey) return;

      setLoading(true);
      try {
        const projects = listLocalProjects();
        setProjectCount(projects.length);

        const bal = await getAlgCO2Balance(wallet.publicKey);
        setCreditBalance(bal);
        
        if (projects.length > 0) {
            setHeroProject({
                name: projects[0].name,
                description: projects[0].description,
                id: projects[0].id
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
  }, [wallet.isConnected, wallet.publicKey]);

  return (
    <div className="pb-20 bg-background min-h-screen">
      
      {/* Hero Section (Netflix Style) */}
      <div className="relative h-[85vh] w-full">
        {/* Background Image / Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544634289-537446d3962d?q=80&w=2692&auto=format&fit=crop')] bg-cover bg-center opacity-60"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10"></div>

        <div className="relative z-20 flex flex-col justify-center h-full px-8 md:px-16 max-w-4xl space-y-6">
            <div className="flex items-center space-x-2 mb-4">
                 <span className="text-primary font-bold tracking-widest text-sm uppercase">Original Alga Beta</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-foreground tracking-tight drop-shadow-lg">
                {heroProject ? heroProject.name : "Inicie Sua Jornada"}
            </h1>
            
            <p className="text-lg md:text-xl text-foreground/90 max-w-2xl font-medium drop-shadow-md">
                {heroProject 
                    ? heroProject.description 
                    : "A revolução da captura de carbono começa aqui. Registre seu primeiro projeto de algas e monitore o impacto ambiental em tempo real na blockchain."}
            </p>
            
            <div className="flex items-center gap-4 mt-8">
                {heroProject ? (
                    <>
                        <Link href={`/projects/${heroProject.id}`}>
                            <Button className="bg-foreground text-background hover:bg-foreground/90 font-bold text-lg px-8 py-6 rounded flex items-center gap-3 transition-transform hover:scale-105">
                                <Play className="h-6 w-6 fill-background" />
                                Monitorar Agora
                            </Button>
                        </Link>
                        <Link href="/docs">
                             <Button variant="secondary" className="bg-secondary/70 text-foreground hover:bg-secondary/90 font-bold text-lg px-8 py-6 rounded flex items-center gap-3 backdrop-blur-sm transition-transform hover:scale-105">
                                <Info className="h-6 w-6" />
                                Metodologia
                            </Button>
                        </Link>
                    </>
                ) : (
                    <Link href="/projects/new">
                        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg px-8 py-6 rounded flex items-center gap-3 transition-transform hover:scale-105 shadow-lg shadow-primary/50">
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
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2 group cursor-pointer">
                Suas Estatísticas <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors opacity-0 group-hover:opacity-100" />
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card hover:bg-secondary/50 transition-colors p-6 rounded-md group cursor-pointer border border-border hover:border-primary/50">
                    <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider mb-2">Projetos Ativos</p>
                    <div className="flex items-end justify-between">
                        <span className="text-4xl font-bold text-foreground">{loading ? "-" : projectCount}</span>
                        <Leaf className="h-6 w-6 text-primary mb-2 opacity-80" />
                    </div>
                </div>
                <div className="bg-card hover:bg-secondary/50 transition-colors p-6 rounded-md group cursor-pointer border border-border hover:border-primary/50">
                    <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider mb-2">Saldo de Créditos</p>
                    <div className="flex items-end justify-between">
                        <span className="text-4xl font-bold text-foreground">{loading ? "-" : parseFloat(creditBalance).toFixed(1)}</span>
                        <Wind className="h-6 w-6 text-primary mb-2 opacity-80" />
                    </div>
                </div>
                <div className="bg-card hover:bg-secondary/50 transition-colors p-6 rounded-md group cursor-pointer border border-border hover:border-primary/50">
                    <p className="text-muted-foreground text-sm font-medium tracking-wider mb-2"><span className="uppercase">Redução de CO₂</span><span className="text-[0.6em] align-baseline">e</span> <span className="uppercase">Total</span></p>
                    <div className="flex items-end justify-between">
                        <span className="text-4xl font-bold text-foreground">--</span>
                        <Activity className="h-6 w-6 text-primary mb-2 opacity-80" />
                    </div>
                </div>
                 <div className="bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/20 transition-colors p-6 rounded-md group cursor-pointer border border-primary/20 flex flex-col justify-center items-center text-center">
                    <p className="text-primary text-sm font-bold uppercase tracking-wider mb-1">Mercado & Investimentos</p>
                    <span className="text-xl font-bold text-foreground">Tokens de Projeto</span>
                    <span className="text-xs text-muted-foreground mt-1">(Em Breve)</span>
                </div>
            </div>
        </section>

        {/* Projects Rail */}
        <section>
            <h3 className="text-xl font-semibold text-foreground mb-4">Meus Projetos</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                 {/* Project Card Mockup */}
                 {[1, 2, 3].map((i) => (
                    <div key={i} className="min-w-[280px] h-[160px] bg-card rounded-md relative overflow-hidden group cursor-pointer transition-transform hover:scale-105 hover:z-50 duration-300 border border-border">
                        <div className={`absolute inset-0 bg-gradient-to-br ${i === 1 ? 'from-primary/30 to-background' : 'from-primary/20 to-background'}`}></div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-10 transition-opacity">
                            <Leaf className="h-16 w-16 text-foreground" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/80 to-transparent">
                            <h4 className="text-foreground font-bold text-lg">Projeto #{i}</h4>
                            <p className="text-primary text-xs font-semibold flex items-center mt-1">
                                <span className="h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                                98% Compatível
                            </p>
                        </div>
                    </div>
                 ))}
                 
                 {/* Add New Project Card */}
                 <Link href="/projects/new">
                    <div className="min-w-[280px] h-[160px] bg-card border-2 border-dashed border-border rounded-md flex flex-col items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground hover:bg-secondary transition-all cursor-pointer">
                        <Plus className="h-8 w-8 mb-2" />
                        <span className="font-medium">Adicionar Projeto</span>
                    </div>
                 </Link>
            </div>
        </section>

        {/* Recent Activity Section */}
        <section className="pb-10">
            <h3 className="text-xl font-semibold text-foreground mb-4">Atividade Global da Rede</h3>
            <div className="h-[400px]">
                <RecentActivity />
            </div>
        </section>

      </div>
    </div>
  );
}
