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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 pt-8 max-w-7xl mx-auto px-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-emerald-500" />
            Mercado & Investimentos
          </h1>
          <p className="text-zinc-400 mt-2 text-lg max-w-2xl">
            Acesse oportunidades de investimento direto em projetos regenerativos e negocie ativos ambientais.
          </p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-900/20">
                <Wallet className="h-4 w-4 mr-2" />
                Conectar Carteira
            </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-black/40 p-1 rounded-xl border border-white/10 w-fit">
        <button
            onClick={() => setActiveTab('investment')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'investment' 
                ? "bg-emerald-600 text-white shadow-lg" 
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
        >
            <TrendingUp className="h-4 w-4" />
            Tokens de Investimento
        </button>
        <button
            onClick={() => setActiveTab('credits')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'credits' 
                ? "bg-blue-600 text-white shadow-lg" 
                : "text-zinc-400 hover:text-white hover:bg-white/5"
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
                <div className="bg-yellow-900/20 border border-yellow-900/50 p-4 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-yellow-400 font-semibold text-sm">Atenção: Mercado Experimental Beta</h4>
                        <p className="text-yellow-200/70 text-xs mt-1">
                            Estes tokens representam direitos futuros sobre a produção ou receita dos projetos. 
                            Eles <strong>NÃO</strong> são créditos de carbono e possuem riscos financeiros distintos.
                            Esta interface é uma simulação técnica.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MOCK_INVESTMENT_TOKENS.map((token) => (
                        <Card key={token.id} className="bg-zinc-900/50 border-white/10 hover:border-emerald-500/30 transition-all duration-300 group overflow-hidden">
                            <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-400 w-full" />
                            <CardHeader>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="bg-emerald-900/30 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded border border-emerald-900/50 uppercase tracking-wider">
                                        {token.symbol}
                                    </span>
                                    {token.status === 'coming_soon' && (
                                        <span className="bg-zinc-800 text-zinc-400 text-[10px] font-bold px-2 py-1 rounded border border-zinc-700 uppercase tracking-wider">
                                            Em Breve
                                        </span>
                                    )}
                                </div>
                                <CardTitle className="text-white text-xl">{token.name}</CardTitle>
                                <p className="text-zinc-500 text-sm font-medium mt-1">{token.project}</p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-zinc-400 text-sm leading-relaxed min-h-[60px]">
                                    {token.description}
                                </p>
                                
                                <div className="grid grid-cols-2 gap-4 py-4 border-t border-white/5 border-b">
                                    <div>
                                        <p className="text-xs text-zinc-500 uppercase">Preço Inicial</p>
                                        <p className="text-white font-mono font-semibold">{token.price}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500 uppercase">Rentabilidade Est.</p>
                                        <p className="text-emerald-400 font-mono font-semibold">{token.apy}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500 uppercase">Disponível</p>
                                        <p className="text-white font-mono font-semibold">{token.available} un.</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500 uppercase">Risco</p>
                                        <p className={`font-mono font-semibold ${token.risk === 'Alto' ? 'text-orange-400' : 'text-yellow-400'}`}>{token.risk}</p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button 
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-900/20"
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
                    <Card className="bg-zinc-900/20 border-zinc-800 border-dashed flex flex-col items-center justify-center text-center p-8 hover:bg-zinc-900/40 transition-all cursor-pointer group">
                        <div className="bg-zinc-800 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                            <TrendingUp className="h-8 w-8 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                        </div>
                        <h3 className="text-white font-bold text-lg mb-2">Busca Investimento?</h3>
                        <p className="text-zinc-500 text-sm max-w-xs mb-6">
                            Tokenize seu projeto de algas e capte recursos diretamente com investidores globais.
                        </p>
                        <Button variant="outline" className="border-zinc-700 text-zinc-400 hover:text-white hover:border-white">
                            Saiba Mais
                        </Button>
                    </Card>
                </div>
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center h-[400px] bg-zinc-900/20 rounded-xl border border-zinc-800 border-dashed">
                <div className="bg-blue-900/20 p-6 rounded-full mb-4">
                    <Leaf className="h-12 w-12 text-blue-500" />
                </div>
                <h3 className="text-white font-bold text-xl mb-2">Mercado Secundário de Créditos</h3>
                <p className="text-zinc-400 max-w-md text-center">
                    A negociação de créditos de carbono (Token ALGACO2e) estará disponível na próxima fase do Beta.
                </p>
            </div>
        )}
      </div>
    </div>
  );
}
