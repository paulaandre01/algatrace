'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Leaf, Loader2, MapPin, ArrowRight } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { getAlgaeProjectNFT, CONTRACT_ADDRESSES } from '@/lib/contracts';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface ProjectAttribute {
  trait_type: string;
  value: string;
}

interface ProjectMetadata {
  name: string;
  description: string;
  attributes: ProjectAttribute[];
  image: string;
}

interface Project {
  id: number;
  uri: string;
  metadata?: ProjectMetadata;
}

export default function ProjectsPage() {
  const { wallet } = useWallet();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    if (!wallet.isConnected || !wallet.signer || !wallet.address) return;

    if (!CONTRACT_ADDRESSES.AlgaeProjectNFT) {
      setError("Erro de configuração: Endereço do contrato NFT não definido.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const contract = getAlgaeProjectNFT(wallet.signer);
      
      // Verificação básica de rede (opcional, mas útil para debug)
      // const network = await wallet.provider?.getNetwork();
      // console.log("Network:", network?.chainId);

      const balance = await contract.balanceOf(wallet.address);
      console.log(`Fetching projects... Balance: ${balance.toString()}`);
      
      const fetchedProjects: Project[] = [];
      const bal = Number(balance); // Safe cast for UI purposes

      if (bal === 0) {
        setProjects([]);
        return;
      }

      for (let i = 0; i < bal; i++) {
        try {
          const tokenId = await contract.tokenOfOwnerByIndex(wallet.address, i);
          const uri = await contract.tokenURI(tokenId);
          
          let metadata: ProjectMetadata | undefined;
          if (uri.startsWith('data:application/json;base64,')) {
            try {
              const base64 = uri.split(',')[1];
              // Fix para Unicode strings
              const json = decodeURIComponent(escape(atob(base64)));
              metadata = JSON.parse(json);
            } catch (e) {
              console.error("Error parsing metadata for token", tokenId, e);
              // Fallback simples se falhar o decode complexo
              try {
                  const base64 = uri.split(',')[1];
                  const json = atob(base64);
                  metadata = JSON.parse(json);
              } catch (e2) {
                  console.error("Fallback parse failed", e2);
              }
            }
          } else {
              // Handle non-base64 URIs (e.g., ipfs:// or http://)
              console.warn(`Token ${tokenId} has non-base64 URI: ${uri}`);
          }

          fetchedProjects.push({
            id: Number(tokenId),
            uri,
            metadata,
          });
        } catch (innerError) {
           console.error(`Error fetching token at index ${i}:`, innerError);
        }
      }
      setProjects(fetchedProjects);
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      setError(`Erro ao buscar projetos: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [wallet.isConnected, wallet.signer, wallet.address]);

  if (!wallet.isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 text-center px-4">
        <div className="bg-zinc-800 p-6 rounded-full">
          <Leaf className="h-16 w-16 text-zinc-500" />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-2xl font-bold text-white">Conecte sua carteira</h2>
          <p className="text-zinc-400">
            Para visualizar e gerenciar seus projetos de captura de carbono, é necessário conectar sua carteira MetaMask.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Meus Projetos</h1>
          <p className="text-zinc-400 mt-1">Gerencie seus projetos de algas e monitore a captura de carbono.</p>
        </div>
        <Link href="/projects/new">
          <Button className="w-full md:w-auto shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/30 transition-all bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="mr-2 h-5 w-5" />
            Novo Projeto
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-900/50 text-red-400 p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span className="font-semibold">Erro:</span>
                {error}
            </div>
            <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchProjects}
                className="border-red-900/50 hover:bg-red-900/30 text-red-400"
            >
                Tentar Novamente
            </Button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
          <p className="text-sm text-zinc-500 animate-pulse">Carregando projetos...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-16 text-center transition-all hover:bg-zinc-900/50">
          <div className="bg-zinc-800 p-4 rounded-full shadow-sm mb-4">
            <Leaf className="h-10 w-10 text-emerald-500" />
          </div>
          <h3 className="text-xl font-semibold text-white">Nenhum projeto encontrado</h3>
          <p className="mt-2 text-zinc-400 max-w-sm">
            Você ainda não possui projetos registrados. Comece criando seu primeiro projeto de captura de carbono.
          </p>
          <div className="mt-8">
            <Link href="/projects/new">
              <Button size="lg" className="shadow-md bg-emerald-600 hover:bg-emerald-700 text-white">
                <Plus className="mr-2 h-5 w-5" />
                Criar Primeiro Projeto
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const location = project.metadata?.attributes.find(a => a.trait_type === "Location")?.value;
            const algaeType = project.metadata?.attributes.find(a => a.trait_type === "Algae Type" || a.trait_type === "Algae Species")?.value;

            return (
              <Card key={project.id} className="group hover:scale-105 transition-all duration-300 border-zinc-800 bg-zinc-900/80 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="rounded-xl bg-emerald-900/30 p-3 group-hover:bg-emerald-900/50 transition-colors">
                      <Leaf className="h-6 w-6 text-emerald-500" />
                    </div>
                    <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300 border border-zinc-700">
                      ID: #{project.id}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-white line-clamp-1 group-hover:text-emerald-400 transition-colors">
                      {project.metadata?.name || `Projeto Alga #${project.id}`}
                    </h3>
                    
                    <div className="space-y-2">
                      {location && (
                        <div className="flex items-center text-sm text-zinc-400">
                          <MapPin className="mr-2 h-4 w-4 text-zinc-500" />
                          <span className="truncate">{location}</span>
                        </div>
                      )}

                      {algaeType && (
                        <div className="flex items-center text-sm text-zinc-400">
                          <Leaf className="mr-2 h-4 w-4 text-zinc-500" />
                          <span className="truncate">{algaeType}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-800">
                    <Link href={`/projects/${project.id}`}>
                      <Button variant="outline" className="w-full border-zinc-700 hover:border-emerald-500/50 hover:bg-emerald-900/20 hover:text-emerald-400 transition-all">
                        Ver Detalhes
                        <ArrowRight className="ml-2 h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
