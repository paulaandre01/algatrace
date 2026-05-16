'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Activity, CheckCircle2, Clock, Flame, Search } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import {
  STELLAR_CONFIG,
  accountExists,
  buildRetireCreditsXdr,
  friendbotFund,
  getAlgCO2Trustline,
  getLocalProject,
  listAnchorsForAccount,
  listLocalMeasurements,
  submitSignedTransactionXdr,
} from '@/lib/stellar';

type RowStatus = 'PENDENTE' | 'VERIFICADO' | 'APOSENTADO';

const RETIRED_KEY = 'mrv_algae_retired_v1';

function readRetired(): Set<string> {
  if (typeof window === 'undefined') return new Set<string>();
  try {
    const raw = window.localStorage.getItem(RETIRED_KEY);
    const arr = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(arr);
  } catch {
    return new Set<string>();
  }
}

function persistRetired(measurementId: string) {
  if (typeof window === 'undefined') return;
  const current = readRetired();
  current.add(measurementId);
  window.localStorage.setItem(RETIRED_KEY, JSON.stringify(Array.from(current)));
}

export default function MeasurementsPage() {
  const { wallet, signTransactionXdr } = useWallet();

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [verifiedIds, setVerifiedIds] = useState<Set<string>>(new Set());
  const [rows, setRows] = useState(listLocalMeasurements());

  const canVerify = Boolean(STELLAR_CONFIG.registryPublicKey);
  const canRetire = Boolean(STELLAR_CONFIG.distributorPublicKey);

  const enrichedRows = useMemo(() => {
    const retired = readRetired();
    return rows
      .map((m) => {
        const status: RowStatus = retired.has(m.measurementId)
          ? 'APOSENTADO'
          : verifiedIds.has(m.measurementId)
            ? 'VERIFICADO'
            : 'PENDENTE';
        return { ...m, status };
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [rows, verifiedIds]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        setRows(listLocalMeasurements());
        if (STELLAR_CONFIG.registryPublicKey) {
          const anchors = await listAnchorsForAccount(STELLAR_CONFIG.registryPublicKey, 200);
          const set = new Set<string>();
          for (const e of anchors) {
            if (e.type === 'MEASUREMENT_VERIFIED' && e.approved) set.add(e.measurementId);
          }
          setVerifiedIds(set);
        }
      } finally {
        setLoading(false);
      }
    };

    load().catch((e) => console.error(e));
  }, []);

  const handleVerifyAndIssue = async (measurementId: string) => {
    if (!wallet.publicKey) return;
    const m = rows.find((x) => x.measurementId === measurementId);
    if (!m) return;

    setActionLoading(true);
    try {
      const trust = await getAlgCO2Trustline(wallet.publicKey);
      if (!trust.hasTrustline) {
        alert('Ative a trustline de ALGCO2 na página Créditos antes de receber créditos.');
        return;
      }

      const res = await fetch('/api/stellar/verify-and-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          measurementId,
          projectId: m.projectId,
          receiver: wallet.publicKey,
          co2Kg: m.co2Kg,
          approved: true,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Falha ao verificar e emitir');

      setVerifiedIds((prev) => new Set([...Array.from(prev), measurementId]));
    } catch (e: any) {
      alert(e?.message || 'Erro ao verificar e emitir.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetire = async (measurementId: string) => {
    if (!wallet.publicKey) return;
    const m = rows.find((x) => x.measurementId === measurementId);
    if (!m) return;

    setActionLoading(true);
    try {
      const trust = await getAlgCO2Trustline(wallet.publicKey);
      if (!trust.hasTrustline) {
        alert('Ative a trustline de ALGCO2 na página Créditos antes de aposentar.');
        return;
      }

      const exists = await accountExists(wallet.publicKey);
      if (!exists) await friendbotFund(wallet.publicKey);

      const xdr = await buildRetireCreditsXdr({
        publicKey: wallet.publicKey,
        amount: String(m.co2Kg),
        reason: 'Beta',
      });
      const signed = await signTransactionXdr(xdr);
      await submitSignedTransactionXdr(signed);
      persistRetired(measurementId);
      setRows(listLocalMeasurements());
    } catch (e: any) {
      alert(e?.message || 'Erro ao aposentar.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pt-10">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/20 to-secondary text-foreground shadow-xl shadow-primary/10 p-8 sm:p-10 border border-border">
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-sm font-medium backdrop-blur-md border border-primary/30 mb-4 text-primary">
                <Activity className="mr-2 h-4 w-4" />
                <span>MRV (Local + Horizon)</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Medições</h1>
              <p className="text-muted-foreground mt-2 max-w-2xl text-lg">
                Lista local das medições registradas e status de verificação (Horizon).
              </p>
            </div>
          </div>
        </div>
      </div>

      <Card className="border-border shadow-xl shadow-primary/5 overflow-hidden backdrop-blur-sm bg-card/80">
        <div className="p-6 border-b border-border bg-secondary/20 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Search className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Histórico</span>
            <span className="bg-secondary text-muted-foreground px-2 py-0.5 rounded-full text-xs font-bold border border-border">
              {enrichedRows.length}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Carregando...</p>
            </div>
          ) : enrichedRows.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p>Nenhuma medição registrada ainda.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold">Medição / Projeto</th>
                  <th className="px-6 py-4 font-semibold">Data</th>
                  <th className="px-6 py-4 font-semibold text-right">Biomassa (kg)</th>
                  <th className="px-6 py-4 font-semibold text-right">CO₂e (kg)</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {enrichedRows.map((m) => {
                  const project = getLocalProject(m.projectId);
                  const statusClass =
                    m.status === 'PENDENTE'
                      ? 'bg-secondary text-muted-foreground border-border'
                      : m.status === 'VERIFICADO'
                        ? 'bg-primary/10 text-primary border-primary/20'
                        : 'bg-destructive/10 text-destructive border-destructive/20';

                  return (
                    <tr key={m.measurementId} className="hover:bg-secondary/30 transition-colors group">
                      <td className="px-6 py-4 font-medium text-foreground">
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground mb-0.5">{m.measurementId.slice(0, 10)}</span>
                          <Link href={`/projects/${m.projectId}`} className="hover:text-primary transition-colors text-muted-foreground">
                            {project?.name || `Projeto ${m.projectId.slice(0, 8)}`}
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
                          {new Date(m.timestamp).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-xs text-muted-foreground/70 pl-5.5">
                          {new Date(m.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-muted-foreground">{m.biomassKg.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-mono font-medium text-primary">{m.co2Kg.toFixed(2)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusClass}`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {m.status === 'PENDENTE' && (
                            <Button
                              onClick={() => handleVerifyAndIssue(m.measurementId)}
                              size="sm"
                              className="h-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 border-0"
                              disabled={!wallet.publicKey || actionLoading || !canVerify}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Verificar + Emitir
                            </Button>
                          )}

                          {m.status === 'VERIFICADO' && (
                            <Button
                              onClick={() => handleRetire(m.measurementId)}
                              size="sm"
                              className="h-8 bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-md shadow-destructive/20 border-0"
                              disabled={!wallet.publicKey || actionLoading || !canRetire}
                            >
                              <Flame className="h-4 w-4 mr-2" />
                              Aposentar
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
