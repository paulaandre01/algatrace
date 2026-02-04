'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Leaf, CheckCircle2, Info } from 'lucide-react';
import Link from 'next/link';
import { useWallet } from '@/hooks/useWallet';
import { getAlgaeProjectNFT } from '@/lib/contracts';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function NewProjectPage() {
  const router = useRouter();
  const { wallet } = useWallet();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    algaeType: '',
    capacity: '',
    productionParams: '', // New: Parâmetros de produção
    bioproductTarget: '', // New: Bioproduto vinculado
    methodology: 'Credita Carbon Beta v0.1',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.isConnected || !wallet.signer || !wallet.address) {
      alert("Por favor, conecte sua carteira primeiro.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const metadata = {
        name: formData.name,
        description: `Projeto Credita Carbon: ${formData.algaeType}. Destinado a ${formData.bioproductTarget}.`,
        attributes: [
          { trait_type: "Location", value: formData.location },
          { trait_type: "Algae Species", value: formData.algaeType },
          { trait_type: "Estimated Capacity", value: formData.capacity },
          { trait_type: "Bioproduct Target", value: formData.bioproductTarget },
          { trait_type: "Production Params", value: formData.productionParams },
          { trait_type: "Methodology", value: formData.methodology },
        ],
        image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzAyOTczOCIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iNjAiIGZpbGw9IiMwRDJDMzUiIG9wYWNpdHk9IjAuMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIyMCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiPkNyZWRpdGE8L3RleHQ+PC9zdmc+",
      };

      const jsonString = JSON.stringify(metadata);
      const tokenURI = `data:application/json;base64,${btoa(jsonString)}`;

      const contract = getAlgaeProjectNFT(wallet.signer);
      const tx = await contract.registerProject(wallet.address, tokenURI);
      
      console.log("Transaction sent:", tx.hash);
      await tx.wait();
      
      router.push('/projects');
    } catch (error: any) {
      console.error("Error registering project:", error);
      const msg = error?.reason || error?.message || "Erro desconhecido ao registrar projeto.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!wallet.isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4 animate-in fade-in zoom-in duration-500">
        <div className="bg-emerald-900/20 p-6 rounded-full border border-emerald-900/50">
          <Leaf className="h-12 w-12 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-semibold text-white">Conecte sua carteira</h2>
        <p className="text-zinc-400">Para registrar um projeto na Credita Carbon, conecte sua carteira MetaMask.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pt-8 pb-20">
      <div className="flex items-center space-x-4 mb-8">
        <Link href="/projects">
          <Button variant="ghost" size="sm" className="rounded-full text-zinc-400 hover:text-white hover:bg-white/10">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Novo Registro de Produção</h1>
          <p className="text-zinc-400">Cadastre seu lote de algas e vincule ao bioproduto final.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
            <CardContent className="p-6 space-y-6">
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Nome do Projeto / Fazenda</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                  placeholder="Ex: Fazenda AlgaTech Sul"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Espécie de Alga</label>
                  <input
                    name="algaeType"
                    value={formData.algaeType}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                    placeholder="Ex: Chlorella vulgaris"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Capacidade Estimada (ton/ano)</label>
                  <input
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                    placeholder="Ex: 50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Localização (GPS ou Endereço)</label>
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                  placeholder="Ex: -23.5505, -46.6333"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Parâmetros de Produção (JSON ou Texto)</label>
                <textarea
                  name="productionParams"
                  value={formData.productionParams}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all h-24"
                  placeholder="Ex: Fotobiorreator tubular, pH 7.5, Temp 25°C..."
                />
              </div>

              <div className="bg-emerald-900/20 p-4 rounded-xl border border-emerald-900/30">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Bioproduto Vinculado (Destino)
                  </label>
                  <input
                    name="bioproductTarget"
                    value={formData.bioproductTarget}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-emerald-900/50 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all placeholder:text-emerald-900/50"
                    placeholder="Ex: Biofertilizante Líquido Premium"
                    required
                  />
                  <p className="text-xs text-emerald-500/70">
                    Obrigatório para rastreabilidade da cadeia.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/20"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Registrando na Blockchain...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Registrar Projeto Beta
                    </span>
                  )}
                </Button>
                {errorMessage && (
                  <p className="mt-4 text-sm text-red-400 bg-red-900/20 p-3 rounded-lg border border-red-900/30 text-center">
                    {errorMessage}
                  </p>
                )}
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Info Column */}
        <div className="space-y-6">
          <div className="bg-blue-900/20 p-6 rounded-2xl border border-blue-900/30">
            <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
              <Info className="h-5 w-5" />
              Critérios de Aprovação
            </h3>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2" />
                <span>Rastreabilidade funcional ponta a ponta.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2" />
                <span>Cálculo de captura validado.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2" />
                <span>Bioproduto de destino identificado.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
