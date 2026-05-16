'use client';

import React, { useState } from 'react';
import { ShoppingBag, TrendingUp, Info, ArrowRight, Lock, AlertTriangle, Wallet, Leaf } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

// Mock Data for Investment Tokens
const MOCK_INVESTMENT_TOKENS = [
  {
    id: 1,
    name: 'AlgaTech Expansion Token',
    symbol: 'ATX-01',
    project: 'Fazenda AlgaTech Sul',
    price: '0.05 ETH',
    available: 1000,
    apy: '12% a.a.',
    risk: 'Moderado',
    description: 'Financiamento para expansão de fotobiorreatores na unidade Sul. Retorno baseado na venda futura de bioprodutos.',
    status: 'active'
  },
  {
    id: 2,
    name: 'GreenBio Infrastructure',
    symbol: 'GBI-SEED',
    project: 'GreenBio Labs',
    price: '0.1 ETH',
    available: 500,
    apy: '15% a.a.',
    risk: 'Alto',
    description: 'Capital semente para infraestrutura de processamento de biomassa para bioplásticos.',
    status: 'coming_soon'
  }
];

export default function MarketPage() {
  const [activeTab, setActiveTab] = useState<'investment' | 'credits'>('investment');
  const [x402Loading, setX402Loading] = useState(false);
  const [x402Quote, setX402Quote] = useState<any>(null);
  const [x402Tx, setX402Tx] = useState('');
  const [x402Report, setX402Report] = useState<any>(null);
  const [x402Error, setX402Error] = useState<string | null>(null);

  const requestX402 = async () => {
    setX402Loading(true);
    setX402Error(null);
    setX402Report(null);
    try {
      const res = await fetch('/api/x402/report');
      const json = await res.json();
      if (res.status !== 402) throw new Error(json?.error || 'Falha ao gerar desafio x402');
      setX402Quote(json.quote);
    } catch (e: any) {
      setX402Error(e?.message || 'Erro no x402');
    } finally {
      setX402Loading(false);
    }
  };

  const unlockX402 = async () => {
    if (!x402Quote?.memo || !x402Tx) return;
    setX402Loading(true);
    setX402Error(null);
    try {
      const nonce = String(x402Quote.memo).replace('X402:', '');
      const res = await fetch(`/api/x402/report?nonce=${encodeURIComponent(nonce)}&tx=${encodeURIComponent(x402Tx)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || json?.message || 'Pagamento não verificado');
      setX402Report(json.report);
    } catch (e: any) {
      setX402Error(e?.message || 'Erro ao validar pagamento');
    } finally {
      setX402Loading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 pt-8 max-w-7xl mx-auto px-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-primary" />
            Mercado & Investimentos
          </h1>
          <p className="text-muted-foreground mt-2 text-lg max-w-2xl">
            Acesse oportunidades de investimento direto em projetos regenerativos e negocie ativos ambientais.
          </p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/20">
                <Wallet className="h-4 w-4 mr-2" />
                Conectar Carteira
            </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-secondary/50 p-1 rounded-xl border border-border w-fit">
        <button
            onClick={() => setActiveTab('investment')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'investment' 
                ? "bg-primary text-primary-foreground shadow-lg" 
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            }`}
        >
            <TrendingUp className="h-4 w-4" />
            Tokens de Investimento
        </button>
        <button
            onClick={() => setActiveTab('credits')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'credits' 
                ? "bg-primary text-primary-foreground shadow-lg" 
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            }`}
        >
            <Leaf className="h-4 w-4" />
            Créditos de Carbono
        </button>
      </div>

      {/* Content Area */}
      <div className="min-h-[500px]">
        {activeTab === 'investment' ? (
            <div className="space-y-6">
                {/* Disclaimer */}
                <div className="bg-secondary/50 border border-primary/20 p-4 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-primary font-semibold text-sm">Atenção: Mercado Experimental Beta</h4>
                        <p className="text-muted-foreground text-xs mt-1">
                            Estes tokens representam direitos futuros sobre a produção ou receita dos projetos. 
                            Eles <strong>NÃO</strong> são créditos de carbono e possuem riscos financeiros distintos.
                            Esta interface é uma simulação técnica.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MOCK_INVESTMENT_TOKENS.map((token) => (
                        <Card key={token.id} className="bg-card border-border hover:border-primary/30 transition-all duration-300 group overflow-hidden">
                            <div className="h-2 bg-gradient-to-r from-primary to-primary/60 w-full" />
                            <CardHeader>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-1 rounded border border-primary/50 uppercase tracking-wider">
                                        {token.symbol}
                                    </span>
                                    {token.status === 'coming_soon' && (
                                        <span className="bg-secondary text-muted-foreground text-[10px] font-bold px-2 py-1 rounded border border-border uppercase tracking-wider">
                                            Em Breve
                                        </span>
                                    )}
                                </div>
                                <CardTitle className="text-foreground text-xl">{token.name}</CardTitle>
                                <p className="text-muted-foreground text-sm font-medium mt-1">{token.project}</p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-muted-foreground/80 text-sm leading-relaxed min-h-[60px]">
                                    {token.description}
                                </p>
                                
                                <div className="grid grid-cols-2 gap-4 py-4 border-t border-border border-b">
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase">Preço Inicial</p>
                                        <p className="text-foreground font-mono font-semibold">{token.price}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase">Rentabilidade Est.</p>
                                        <p className="text-primary font-mono font-semibold">{token.apy}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase">Disponível</p>
                                        <p className="text-foreground font-mono font-semibold">{token.available} un.</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase">Risco</p>
                                        <p className={`font-mono font-semibold ${token.risk === 'Alto' ? 'text-orange-400' : 'text-yellow-400'}`}>{token.risk}</p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button 
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20"
                                    disabled={token.status === 'coming_soon'}
                                >
                                    {token.status === 'coming_soon' ? (
                                        <span className="flex items-center gap-2">
                                            <Lock className="h-4 w-4" />
                                            Aguardando Lançamento
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            Investir Agora
                                            <ArrowRight className="h-4 w-4" />
                                        </span>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}

                    {/* Card de "Cadastre seu Token" */}
                    <Card className="bg-secondary/20 border-border border-dashed flex flex-col items-center justify-center text-center p-8 hover:bg-secondary/40 transition-all cursor-pointer group">
                        <div className="bg-secondary p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                            <TrendingUp className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <h3 className="text-foreground font-bold text-lg mb-2">Busca Investimento?</h3>
                        <p className="text-muted-foreground text-sm max-w-xs mb-6">
                            Tokenize seu projeto de algas e capte recursos diretamente com investidores globais.
                        </p>
                        <Button variant="outline" className="border-border text-muted-foreground hover:text-foreground hover:border-foreground">
                            Saiba Mais
                        </Button>
                    </Card>
                </div>
            </div>
        ) : (
            <div className="space-y-6">
                <Card className="bg-card border-border shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-foreground flex items-center gap-2">
                            <Leaf className="h-5 w-5 text-primary" />
                            x402 (Payment Required) — Demo
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Exemplo de paywall usando HTTP 402 + pagamento em XLM (Testnet) para destravar um relatório Beta.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-2">
                            <Button onClick={requestX402} disabled={x402Loading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                Gerar cobrança (402)
                            </Button>
                            {x402Quote?.payment_uri && (
                                <a
                                    href={x402Quote.payment_uri}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm text-primary underline underline-offset-4 self-center"
                                >
                                    Abrir pagamento (SEP-7)
                                </a>
                            )}
                        </div>

                        {x402Quote && (
                            <div className="text-xs text-muted-foreground bg-secondary/30 border border-border rounded-lg p-4 space-y-1">
                                <div>Destination: {x402Quote.destination}</div>
                                <div>Amount (XLM): {x402Quote.amount}</div>
                                <div>Memo: {x402Quote.memo}</div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Tx hash do pagamento (depois de pagar)</label>
                            <input
                                value={x402Tx}
                                onChange={(e) => setX402Tx(e.target.value)}
                                className="w-full h-12 pl-4 pr-4 rounded-xl border border-input bg-input focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm text-foreground"
                                placeholder="Cole aqui o hash da transação confirmada"
                            />
                            <Button onClick={unlockX402} disabled={x402Loading || !x402Tx || !x402Quote} className="bg-secondary hover:bg-secondary/80 text-foreground">
                                Validar pagamento e destravar
                            </Button>
                        </div>

                        {x402Error && (
                            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                                {x402Error}
                            </div>
                        )}

                        {x402Report && (
                            <div className="text-sm text-foreground bg-primary/5 border border-primary/10 rounded-lg p-4 space-y-1">
                                <div className="font-semibold">{x402Report.title}</div>
                                <div className="text-muted-foreground">{x402Report.note}</div>
                                <div className="text-muted-foreground">Unlocked by: {x402Report.unlocked_by}</div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        )}
      </div>
    </div>
  );
}
