'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Leaf, CheckCircle2, Info } from 'lucide-react';
import Link from 'next/link';
import { useWallet } from '@/hooks/useWallet';
import {
  accountExists,
  buildRegisterProjectXdr,
  friendbotFund,
  sha256Hex,
  submitSignedTransactionXdr,
  upsertLocalProject,
} from '@/lib/stellar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function NewProjectPage() {
  const router = useRouter();
  const { wallet, signTransactionXdr } = useWallet();
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

  const handleSubmit = async () => {
    if (!wallet.isConnected || !wallet.publicKey) {
      alert("Por favor, conecte sua carteira primeiro.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const exists = await accountExists(wallet.publicKey);
      if (!exists) {
        await friendbotFund(wallet.publicKey);
      }

      const projectId = crypto.randomUUID();
      const createdAt = new Date().toISOString();

      const metadata = {
        id: projectId,
        name: formData.name,
        description: `Projeto Beta MRV - ${formData.name}: ${formData.algaeType}. Destinado a ${formData.bioproductTarget}.`,
        location: formData.location,
        algaeType: formData.algaeType,
        estimatedCapacity: formData.capacity,
        imageDataUrl:
          "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzAyOTczOCIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iNjAiIGZpbGw9IiMwRDJDMzUiIG9wYWNpdHk9IjAuMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIyMCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiPkNyZWRpdGE8L3RleHQ+PC9zdmc+",
        createdAt,
      };

      const dataHash = await sha256Hex(JSON.stringify({ ...metadata, methodology: formData.methodology, productionParams: formData.productionParams }));
      const xdr = await buildRegisterProjectXdr({ publicKey: wallet.publicKey, projectId, dataHash });
      const signed = await signTransactionXdr(xdr);
      await submitSignedTransactionXdr(signed);

      upsertLocalProject({ ...metadata, anchoredDataHash: dataHash });
      router.push('/projects');
    } catch (error: any) {
      console.error("Error registering project:", error);
      let msg = error?.reason || error?.message || "Erro desconhecido ao registrar projeto.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!wallet.isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4 animate-in fade-in zoom-in duration-500">
        <div className="bg-primary/10 p-6 rounded-full border border-primary/20">
          <Leaf className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground">Conecte sua carteira</h2>
        <p className="text-muted-foreground">Para registrar um projeto, conecte sua carteira Freighter (Stellar).</p>
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
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 space-y-6">
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Nome do Projeto / Fazenda</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-input border border-border rounded-lg p-3 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                  placeholder="Ex: Fazenda AlgaTech Sul"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Espécie de Alga</label>
                  <input
                    name="algaeType"
                    value={formData.algaeType}
                    onChange={handleChange}
                    className="w-full bg-input border border-border rounded-lg p-3 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                    placeholder="Ex: Chlorella vulgaris"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Capacidade Estimada (ton/ano)</label>
                  <input
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    className="w-full bg-input border border-border rounded-lg p-3 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                    placeholder="Ex: 50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Localização (GPS ou Endereço)</label>
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full bg-input border border-border rounded-lg p-3 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                  placeholder="Ex: -23.5505, -46.6333"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Parâmetros de Produção (JSON ou Texto)</label>
                <textarea
                  name="productionParams"
                  value={formData.productionParams}
                  onChange={handleChange}
                  className="w-full bg-input border border-border rounded-lg p-3 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all h-24"
                  placeholder="Ex: Fotobiorreator tubular, pH 7.5, Temp 25°C..."
                />
              </div>

              <div className="bg-primary/10 p-4 rounded-xl border border-primary/20">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-primary flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Bioproduto Vinculado / Biomassa
                  </label>
                  <input
                    name="bioproductTarget"
                    value={formData.bioproductTarget}
                    onChange={handleChange}
                    className="w-full bg-input border border-primary/30 rounded-lg p-3 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50"
                    placeholder="Ex: Biomassa, Biofertilizante, ou Múltiplos"
                    required
                  />
                  <div className="text-xs text-primary/70 space-y-1 mt-2">
                    <p>• Defina o destino final (ex: Biofertilizante) se já souber.</p>
                    <p>• Use <strong>"Biomassa"</strong> para alocação futura ou venda fracionada.</p>
                    <p>• Use vírgulas para múltiplos produtos (ex: "Óleo, Proteína").</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all"
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
          <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
            <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
              <Info className="h-5 w-5" />
              Critérios de Aprovação
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                <span>Rastreabilidade funcional ponta a ponta.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                <span>Cálculo de captura validado.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                <span>Bioproduto de destino identificado.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
