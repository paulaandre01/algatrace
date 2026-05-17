'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Activity, Save, Leaf } from 'lucide-react';
import Link from 'next/link';
import { useWallet } from '@/hooks/useWallet';
import {
  accountExists,
  addLocalMeasurement,
  buildAddMeasurementXdr,
  friendbotFund,
  sha256Base64Url,
  sha256Hex,
  submitSignedTransactionXdr,
} from '@/lib/stellar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { calculateCO2, MRV_CONSTANTS } from '@/lib/mrv';

export default function NewMeasurementPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { wallet, signTransactionXdr } = useWallet();
  
  const [loading, setLoading] = useState(false);
  const [biomass, setBiomass] = useState<string>('');
  const [co2Captured, setCo2Captured] = useState<number>(0);

  // Auto-calculate CO2 when biomass changes
  useEffect(() => {
    const val = parseFloat(biomass);
    if (!isNaN(val)) {
      setCo2Captured(calculateCO2(val));
    } else {
      setCo2Captured(0);
    }
  }, [biomass]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.isConnected || !wallet.publicKey || !id) {
      alert("Carteira não conectada.");
      return;
    }

    setLoading(true);
    try {
      const biomassAmount = Math.floor(parseFloat(biomass));
      const co2Amount = Number(co2Captured.toFixed(2));
      
      const now = Date.now();
      const dataPayload = {
        projectId: id,
        timestamp: now,
        biomassKg: biomassAmount,
        co2Kg: co2Amount,
        factor: MRV_CONSTANTS.CO2_CONVERSION_FACTOR,
      };

      const raw = JSON.stringify(dataPayload);
      const dataHash = await sha256Hex(raw);
      const measurementId = await sha256Base64Url(`${id}|${now}|${dataHash}`);

      const exists = await accountExists(wallet.publicKey);
      if (!exists) await friendbotFund(wallet.publicKey);

      const xdr = await buildAddMeasurementXdr({
        publicKey: wallet.publicKey,
        projectId: id,
        measurementId,
        biomassKg: biomassAmount,
        co2Kg: co2Amount,
        dataHash,
      });
      const signed = await signTransactionXdr(xdr);
      await submitSignedTransactionXdr(signed);

      addLocalMeasurement({
        measurementId,
        projectId: id,
        timestamp: now,
        biomassKg: biomassAmount,
        co2Kg: co2Amount,
        rawDataHash: dataHash,
        createdAt: new Date(now).toISOString(),
      });

      router.push(`/projects/${id}`);
    } catch (error) {
      console.error("Error adding measurement:", error);
      alert("Erro ao registrar medição. Verifique o console.");
    } finally {
      setLoading(false);
    }
  };

  if (!wallet.isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 text-center px-4">
        <div className="bg-secondary p-6 rounded-full">
          <Leaf className="h-16 w-16 text-muted-foreground" />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Conecte sua carteira</h2>
          <p className="text-muted-foreground">
            Conecte sua Freighter para registrar novas medições.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center space-x-4">
        <Link href={`/projects/${id}`}>
          <Button variant="outline" size="sm" className="hover:bg-accent">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nova Medição MRV</h1>
          <p className="text-muted-foreground mt-1">Registre o crescimento de biomassa para cálculo de CO₂.</p>
        </div>
      </div>

      <Card className="p-8 shadow-lg border-border">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="p-5 bg-primary/5 border border-primary/10 rounded-xl text-sm text-primary flex items-start">
            <Activity className="h-5 w-5 mr-3 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold mb-1">Metodologia Beta v0.1</h4>
              <p className="text-muted-foreground leading-relaxed">
                O cálculo utiliza o fator de conversão padrão de <strong className="font-mono bg-primary/10 px-1 rounded">{MRV_CONSTANTS.CO2_CONVERSION_FACTOR} kg CO₂</strong> por kg de biomassa seca de algas.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <label htmlFor="biomass" className="text-sm font-semibold text-foreground block">
              Biomassa Produzida (kg - Peso Seco)
            </label>
            <div className="relative">
              <input
                id="biomass"
                type="number"
                min="0"
                step="1"
                required
                className="block w-full rounded-xl bg-input border-input pl-4 pr-12 py-3 text-lg focus:border-primary focus:ring-primary shadow-sm transition-all text-foreground"
                placeholder="Ex: 100"
                value={biomass}
                onChange={(e) => setBiomass(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <span className="text-muted-foreground font-medium">kg</span>
              </div>
            </div>
          </div>

          <div className="p-8 bg-secondary/50 rounded-2xl border border-border text-center transition-all hover:bg-secondary">
            <p className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">CO₂e Capturado Estimado</p>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-5xl font-bold text-primary tracking-tight">{co2Captured.toFixed(2)}</span>
              <span className="text-xl text-muted-foreground font-medium self-end mb-1">kg</span>
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full h-12 text-base shadow-lg shadow-primary/10" disabled={loading || !biomass}>
              {loading ? (
                <>
                  <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Registrando no Blockchain...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  Salvar Medição
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
