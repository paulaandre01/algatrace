'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Leaf, Activity, CheckCircle2, XCircle, Clock, Search, Flame } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { getMRVRegistry, getCarbonCreditToken } from '@/lib/contracts';
import { ethers } from 'ethers';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Measurement {
  id: number;
  projectId: number;
  timestamp: number;
  biomassAmount: number;
  co2Captured: number;
  dataHash: string;
  status: number; // 0: Pending, 1: Verified, 2: Rejected, 3: Minted
}

const STATUS_LABELS = ['Pendente', 'Verificado', 'Rejeitado', 'Creditado', 'Aposentado'];

export default function MeasurementsPage() {
  const { wallet } = useWallet();
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(false);
  const [isVerifier, setIsVerifier] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!wallet.isConnected || !wallet.signer) return;

      setLoading(true);
      try {
        const mrvContract = getMRVRegistry(wallet.signer);

        // Check if user is verifier
        const verifierRole = ethers.id("VERIFIER_ROLE");
        const hasRole = await mrvContract.hasRole(verifierRole, wallet.address);
        setIsVerifier(hasRole);

        // Fetch all measurements
        // In Beta, we iterate from 0 to total. In production, use The Graph.
        let total = 0;
        try {
            total = Number(await mrvContract.getTotalMeasurements());
        } catch (e) {
            console.warn("Contract might not support getTotalMeasurements yet", e);
        }

        const fetched: Measurement[] = [];
        // Limit to last 50 for performance in Beta
        const start = Math.max(0, total - 50);
        
        for (let i = start; i < total; i++) {
          const m = await mrvContract.getMeasurement(i);
          fetched.push({
            id: Number(m.id),
            projectId: Number(m.projectId),
            timestamp: Number(m.timestamp),
            biomassAmount: Number(m.biomassAmount),
            co2Captured: Number(m.co2Captured),
            dataHash: m.dataHash,
            status: Number(m.status),
          });
        }

        setMeasurements(fetched.reverse());

      } catch (error) {
        console.error("Error fetching measurements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [wallet.isConnected, wallet.signer, wallet.address]);

  const handleVerify = async (measurementId: number) => {
    if (!wallet.signer) return;
    try {
      const contract = getMRVRegistry(wallet.signer);
      const tx = await contract.verifyMeasurement(measurementId, true);
      await tx.wait();
      window.location.reload();
    } catch (error) {
      console.error("Error verifying:", error);
      alert("Erro ao verificar.");
    }
  };

  const handleIssueCredits = async (measurementId: number) => {
    if (!wallet.signer) return;
    try {
      const contract = getMRVRegistry(wallet.signer);
      const tx = await contract.issueCredits(measurementId);
      await tx.wait();
      window.location.reload();
    } catch (error) {
      console.error("Error issuing credits:", error);
      alert("Erro ao emitir créditos.");
    }
  };

  const handleRetire = async (measurement: Measurement) => {
    if (!wallet.signer) return;
    try {
      const mrvContract = getMRVRegistry(wallet.signer);
      
      // 1. Calculate amount (same logic as contract)
      const amount = BigInt(measurement.co2Captured) * BigInt(10**18);

      // 2. Approve MRV contract to burn tokens
      // We need CarbonCreditToken contract instance here.
      // Importing getCarbonCreditToken at top of file
      const tokenContract = getCarbonCreditToken(wallet.signer);
      const mrvAddress = await mrvContract.getAddress();
      
      const txApprove = await tokenContract.approve(mrvAddress, amount);
      await txApprove.wait();

      // 3. Call retireCredits
      const tx = await mrvContract.retireCredits(measurement.id, "Uso via Dashboard de Medições", "Relatório Geral");
      await tx.wait();
      window.location.reload();
    } catch (error) {
      console.error("Error retiring credits:", error);
      alert("Erro ao aposentar créditos. Verifique se você é o dono do projeto.");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pt-10">
      
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/20 to-secondary text-foreground shadow-xl shadow-primary/10 p-8 sm:p-10 border border-border">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-secondary/40 blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-sm font-medium backdrop-blur-md border border-primary/30 mb-4 text-primary">
                <Activity className="mr-2 h-4 w-4" />
                <span>Registro Global MRV</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Medições e Verificações</h1>
              <p className="text-muted-foreground mt-2 max-w-2xl text-lg">
                Acompanhe o fluxo de dados de todos os projetos registrados na rede.
              </p>
            </div>
            {isVerifier && (
              <div className="bg-secondary/50 p-4 rounded-xl backdrop-blur-md border border-border">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">Status da Conta</p>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="font-bold text-foreground">Verificador Autorizado</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Card className="border-border shadow-xl shadow-primary/5 overflow-hidden backdrop-blur-sm bg-card/80">
        <div className="p-6 border-b border-border bg-secondary/20 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Search className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Histórico Recente</span>
            <span className="bg-secondary text-muted-foreground px-2 py-0.5 rounded-full text-xs font-bold border border-border">{measurements.length}</span>
          </div>
          
          <div className="flex gap-2">
             {/* Filter placeholder */}
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Carregando dados da blockchain...</p>
            </div>
          ) : measurements.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p>Nenhuma medição registrada ainda.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold">ID / Projeto</th>
                  <th className="px-6 py-4 font-semibold">Data</th>
                  <th className="px-6 py-4 font-semibold text-right">Biomassa (kg)</th>
                  <th className="px-6 py-4 font-semibold text-right">CO₂e (kg)</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {measurements.map((m) => (
                  <tr key={m.id} className="hover:bg-secondary/30 transition-colors group">
                    <td className="px-6 py-4 font-medium text-foreground">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground mb-0.5">#{m.id}</span>
                        <Link href={`/projects/${m.projectId}`} className="hover:text-primary transition-colors text-muted-foreground">
                          Projeto #{m.projectId}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
                        {new Date(m.timestamp * 1000).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-xs text-muted-foreground/70 pl-5.5">
                        {new Date(m.timestamp * 1000).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-muted-foreground">
                      {m.biomassAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-medium text-primary">
                      {m.co2Captured.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        m.status === 0 ? 'bg-secondary text-muted-foreground border-border' :
                        m.status === 1 ? 'bg-primary/10 text-primary border-primary/20' :
                        m.status === 2 ? 'bg-destructive/10 text-destructive border-destructive/20' :
                        m.status === 3 ? 'bg-primary/20 text-primary border-primary/30' :
                        'bg-destructive/10 text-destructive border-destructive/20'
                      }`}>
                        {STATUS_LABELS[m.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isVerifier && m.status === 0 && (
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            onClick={() => handleVerify(m.id)} 
                            size="sm" 
                            className="h-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 border-0"
                          >
                            Verificar
                          </Button>
                        </div>
                      )}
                      {m.status === 1 && (
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            onClick={() => handleIssueCredits(m.id)} 
                            size="sm" 
                            className="h-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 border-0"
                          >
                            Emitir Créditos
                          </Button>
                        </div>
                      )}
                      {m.status === 3 && (
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            onClick={() => handleRetire(m)} 
                            size="sm" 
                            className="h-8 bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-md shadow-destructive/20 border-0"
                          >
                            <Flame className="w-3 h-3 mr-1.5" />
                            Aposentar
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
