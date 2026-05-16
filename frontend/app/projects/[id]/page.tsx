'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Leaf, Activity, MapPin, Clock, CheckCircle2, Flame, ArrowRight } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import {
  STELLAR_CONFIG,
  accountExists,
  buildRetireCreditsXdr,
  getAlgCO2Trustline,
  friendbotFund,
  getAlgCO2Balance,
  getLocalProject,
  listAnchorsForAccount,
  listLocalMeasurements,
  submitSignedTransactionXdr,
  type AnchoredEvent,
  type LocalMeasurement,
  type LocalProjectMetadata,
} from '@/lib/stellar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type UiStatus = 'PENDENTE' | 'VERIFICADO' | 'APOSENTADO';
type UiMeasurement = LocalMeasurement & { status: UiStatus };

const STATUS_LABELS: Record<UiStatus, string> = {
  PENDENTE: 'Pendente',
  VERIFICADO: 'Verificado',
  APOSENTADO: 'Aposentado',
};

const STATUS_COLORS: Record<UiStatus, string> = {
  PENDENTE: 'text-muted-foreground bg-secondary border-border',
  VERIFICADO: 'text-primary bg-primary/10 border-primary/20',
  APOSENTADO: 'text-destructive bg-destructive/10 border-destructive/20',
};

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

function isVerifiedAnchor(
  e: AnchoredEvent
): e is Extract<AnchoredEvent, { type: 'MEASUREMENT_VERIFIED' }> {
  return e.type === 'MEASUREMENT_VERIFIED';
}

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectId = params?.id as string;
  const { wallet, signTransactionXdr } = useWallet();

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [project, setProject] = useState<LocalProjectMetadata | null>(null);
  const [measurements, setMeasurements] = useState<UiMeasurement[]>([]);
  const [anchors, setAnchors] = useState<AnchoredEvent[]>([]);
  const [creditBalance, setCreditBalance] = useState('0');

  const chartData = useMemo(() => {
    return [...measurements]
      .reverse()
      .map((m) => ({ date: new Date(m.timestamp).toLocaleDateString(), biomass: m.biomassKg, co2: m.co2Kg }));
  }, [measurements]);

  useEffect(() => {
    const run = async () => {
      if (!projectId) return;
      setLoading(true);
      setNotFound(false);
      try {
        const p = getLocalProject(projectId);
        if (!p) {
          setNotFound(true);
          return;
        }
        setProject(p);

        const local = listLocalMeasurements(projectId).sort((a, b) => b.timestamp - a.timestamp);
        const retired = readRetired();

        const registryPk = STELLAR_CONFIG.registryPublicKey;
        const registryAnchors = registryPk ? await listAnchorsForAccount(registryPk, 200) : [];
        setAnchors(registryAnchors);

        const verifiedSet = new Set<string>();
        for (const e of registryAnchors) {
          if (isVerifiedAnchor(e) && e.approved) verifiedSet.add(e.measurementId);
        }

        const ui: UiMeasurement[] = local.map((m) => {
          const status: UiStatus = retired.has(m.measurementId)
            ? 'APOSENTADO'
            : verifiedSet.has(m.measurementId)
              ? 'VERIFICADO'
              : 'PENDENTE';
          return { ...m, status };
        });
        setMeasurements(ui);

        if (wallet.publicKey) {
          const bal = await getAlgCO2Balance(wallet.publicKey);
          setCreditBalance(bal);
        }
      } finally {
        setLoading(false);
      }
    };

    run().catch((e) => console.error(e));
  }, [projectId, wallet.publicKey]);

  const handleVerifyAndIssue = async (measurementId: string) => {
    if (!wallet.publicKey) return;
    const m = measurements.find((x) => x.measurementId === measurementId);
    if (!m) return;

    setActionLoading(true);
    try {
      const trust = await getAlgCO2Trustline(wallet.publicKey);
      if (!trust.hasTrustline) {
        alert('Você precisa ativar a trustline de ALGCO2 antes de receber créditos. Vá em Créditos e clique em "Ativar ALGCO2".');
        return;
      }

      const res = await fetch('/api/stellar/verify-and-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          measurementId,
          projectId,
          receiver: wallet.publicKey,
          co2Kg: m.co2Kg,
          approved: true,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Falha ao verificar e emitir');

      const registryPk = STELLAR_CONFIG.registryPublicKey;
      const registryAnchors = registryPk ? await listAnchorsForAccount(registryPk, 200) : [];
      setAnchors(registryAnchors);

      const bal = await getAlgCO2Balance(wallet.publicKey);
      setCreditBalance(bal);

      setMeasurements((prev) =>
        prev.map((mm) => (mm.measurementId === measurementId ? { ...mm, status: 'VERIFICADO' } : mm))
      );
    } catch (e: any) {
      alert(e?.message || 'Erro ao verificar e emitir.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetire = async (measurementId: string) => {
    if (!wallet.publicKey) return;
    const m = measurements.find((x) => x.measurementId === measurementId);
    if (!m) return;

    setActionLoading(true);
    try {
      const trust = await getAlgCO2Trustline(wallet.publicKey);
      if (!trust.hasTrustline) {
        alert('Você precisa ativar a trustline de ALGCO2 antes de aposentar créditos. Vá em Créditos e clique em "Ativar ALGCO2".');
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
      const bal = await getAlgCO2Balance(wallet.publicKey);
      setCreditBalance(bal);

      setMeasurements((prev) =>
        prev.map((mm) => (mm.measurementId === measurementId ? { ...mm, status: 'APOSENTADO' } : mm))
      );
    } catch (e: any) {
      alert(e?.message || 'Erro ao aposentar créditos.');
    } finally {
      setActionLoading(false);
    }
  };

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 text-center px-4 animate-in fade-in duration-500">
        <div className="bg-secondary p-6 rounded-full">
          <Leaf className="h-16 w-16 text-muted-foreground" />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Projeto não encontrado</h2>
          <p className="text-muted-foreground">O projeto com ID {projectId} não existe neste navegador.</p>
        </div>
        <Link href="/projects">
          <Button variant="outline" className="border-border hover:bg-secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos projetos
          </Button>
        </Link>
      </div>
    );
  }

  if (!wallet.isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 text-center px-4">
        <div className="bg-secondary p-6 rounded-full">
          <Leaf className="h-16 w-16 text-muted-foreground" />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Conecte sua carteira</h2>
          <p className="text-muted-foreground">Conecte sua Freighter para visualizar detalhes do projeto.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 pt-8 max-w-7xl mx-auto px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/projects">
            <Button variant="outline" size="sm" className="hover:bg-accent">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">{project?.name || 'Projeto'}</h1>
            <p className="text-muted-foreground mt-1 max-w-2xl">
              {project?.description || 'Projeto Beta MRV ancorado na Stellar Testnet.'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/projects/${projectId}/measure`}>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
              <Activity className="h-4 w-4 mr-2" />
              Nova Medição
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border shadow-lg hover:shadow-primary/5 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Localização</CardTitle>
            <MapPin className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-foreground">{project?.location || 'Não informado'}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-lg hover:shadow-primary/5 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Espécie</CardTitle>
            <Leaf className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-foreground">{project?.algaeType || 'Não informado'}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-lg hover:shadow-primary/5 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Capacidade Estimada</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-foreground">{project?.estimatedCapacity || 'Não informado'}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-card border-border shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-foreground">Crescimento & Captura de CO₂ (Local)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {measurements.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Activity className="h-10 w-10 mb-3 opacity-50" />
                  <p>Nenhuma medição registrada ainda.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorBiomass" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis dataKey="date" className="text-xs fill-muted-foreground" />
                    <YAxis className="text-xs fill-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Area type="monotone" dataKey="co2" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorBiomass)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-lg">
          <CardHeader>
            <CardTitle className="text-foreground">Saldo ALGCO2</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{Number(creditBalance).toFixed(2)}</div>
            <p className="text-sm text-muted-foreground mt-1">Custom Asset na Stellar Testnet.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border shadow-lg">
        <CardHeader>
          <CardTitle className="text-foreground">Medições</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="h-4 w-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
              Carregando...
            </div>
          ) : measurements.length === 0 ? (
            <div className="text-muted-foreground">Nenhuma medição ainda.</div>
          ) : (
            <div className="space-y-3">
              {measurements.map((m) => (
                <div
                  key={m.measurementId}
                  className="p-4 rounded-xl border border-border bg-secondary/20 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">Medição</span>
                      <span className="text-xs text-muted-foreground">{m.measurementId.slice(0, 10)}</span>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full border', STATUS_COLORS[m.status])}>
                        {STATUS_LABELS[m.status]}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Biomassa: <span className="text-foreground font-medium">{m.biomassKg} kg</span> · CO₂:{' '}
                      <span className="text-foreground font-medium">{m.co2Kg} kg</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{new Date(m.timestamp).toLocaleString()}</div>
                  </div>

                  <div className="flex gap-2">
                    {m.status === 'PENDENTE' && (
                      <Button
                        onClick={() => handleVerifyAndIssue(m.measurementId)}
                        disabled={actionLoading || !STELLAR_CONFIG.registryPublicKey}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Verificar + Emitir
                      </Button>
                    )}

                    {m.status === 'VERIFICADO' && (
                      <Button
                        onClick={() => handleRetire(m.measurementId)}
                        disabled={actionLoading || !STELLAR_CONFIG.distributorPublicKey}
                        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                      >
                        <Flame className="h-4 w-4 mr-2" />
                        Aposentar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card border-border shadow-lg">
        <CardHeader>
          <CardTitle className="text-foreground">Verificações (Stellar Expert)</CardTitle>
        </CardHeader>
        <CardContent>
          {!STELLAR_CONFIG.registryPublicKey ? (
            <div className="text-sm text-muted-foreground">
              Configure NEXT_PUBLIC_STELLAR_REGISTRY_PUBLIC para habilitar a linha do tempo de verificações.
            </div>
          ) : (
            <div className="space-y-2">
              {anchors
                .filter(isVerifiedAnchor)
                .slice(0, 10)
                .map((e) => (
                  <div key={e.txHash} className="flex items-center justify-between text-sm">
                    <div className="text-muted-foreground">
                      {e.approved ? 'Aprovado' : 'Rejeitado'} · {e.measurementId.slice(0, 10)} · {e.projectId}
                    </div>
                    <a
                      className="text-primary hover:underline"
                      href={`https://stellar.expert/explorer/testnet/tx/${e.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ver tx <ArrowRight className="inline h-3 w-3" />
                    </a>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
