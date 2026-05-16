'use client';

import React, { useEffect, useState } from 'react';
import { Leaf, Flame, History, ArrowRight, Activity, Wind, TrendingUp } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import {
  accountExists,
  buildChangeTrustXdr,
  buildRetireCreditsXdr,
  friendbotFund,
  getAlgCO2Trustline,
  submitSignedTransactionXdr,
} from '@/lib/stellar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function CreditsPage() {
  const { wallet, signTransactionXdr } = useWallet();
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  const [burnAmount, setBurnAmount] = useState('');
  const [burning, setBurning] = useState(false);
  const [hasTrustline, setHasTrustline] = useState<boolean>(true);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!wallet.isConnected || !wallet.publicKey) return;

      try {
        const info = await getAlgCO2Trustline(wallet.publicKey);
        setHasTrustline(info.hasTrustline);
        setBalance(info.balance);
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    };

    fetchBalance();
  }, [wallet.isConnected, wallet.publicKey]);

  const handleCreateTrustline = async () => {
    if (!wallet.publicKey) return;
    setLoading(true);
    try {
      const exists = await accountExists(wallet.publicKey);
      if (!exists) await friendbotFund(wallet.publicKey);

      const xdr = await buildChangeTrustXdr({ publicKey: wallet.publicKey });
      const signed = await signTransactionXdr(xdr);
      await submitSignedTransactionXdr(signed);

      const info = await getAlgCO2Trustline(wallet.publicKey);
      setHasTrustline(info.hasTrustline);
      setBalance(info.balance);
    } catch (e: any) {
      alert(e?.message || 'Erro ao criar trustline.');
    } finally {
      setLoading(false);
    }
  };

  const handleBurn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.publicKey || !burnAmount) return;

    setBurning(true);
    try {
      const exists = await accountExists(wallet.publicKey);
      if (!exists) await friendbotFund(wallet.publicKey);

      const xdr = await buildRetireCreditsXdr({
        publicKey: wallet.publicKey,
        amount: burnAmount,
        reason: 'ESG Beta',
      });
      const signed = await signTransactionXdr(xdr);
      await submitSignedTransactionXdr(signed);

      const info = await getAlgCO2Trustline(wallet.publicKey);
      setHasTrustline(info.hasTrustline);
      setBalance(info.balance);
      setBurnAmount('');
      alert("Créditos aposentados com sucesso!");
    } catch (error) {
      console.error("Error burning credits:", error);
      alert("Erro ao aposentar créditos.");
    } finally {
      setBurning(false);
    }
  };

  if (!wallet.isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 text-center px-4 animate-in fade-in zoom-in duration-500">
        <div className="bg-secondary p-8 rounded-full shadow-inner">
          <Leaf className="h-16 w-16 text-muted-foreground" />
        </div>
        <div className="max-w-md space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Conecte sua carteira</h2>
          <p className="text-muted-foreground leading-relaxed">
            Para visualizar e gerenciar seus créditos de carbono (Custom Asset ALGCO2), conecte sua carteira Freighter.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pt-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Carteira de Créditos</h1>
          <p className="text-muted-foreground mt-1">Gerencie e aposente seus créditos de carbono (Token ALGACO2e).</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Balance Card - Premium Design */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-background text-foreground shadow-2xl shadow-primary/10 p-8 group border border-primary/20">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 h-80 w-80 rounded-full bg-primary/10 blur-3xl group-hover:bg-primary/20 transition-all duration-700"></div>
          <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-64 w-64 rounded-full bg-background/40 blur-3xl"></div>
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-primary/70 font-medium text-lg flex items-center">
                  <Wind className="mr-2 h-5 w-5 opacity-70" />
                  Saldo Disponível
                </p>
              </div>
              <div className="bg-primary/10 p-3 rounded-2xl backdrop-blur-md border border-primary/20">
                <Leaf className="h-8 w-8 text-primary" />
              </div>
            </div>
            
            <div className="mt-8">
              <div className="flex items-baseline space-x-3">
                <h2 className="text-6xl font-bold tracking-tighter text-foreground">{parseFloat(balance).toFixed(2)}</h2>
                <span className="text-xl text-primary font-medium bg-primary/10 px-3 py-1 rounded-full backdrop-blur-sm border border-primary/20">ALGCO2</span>
              </div>
              {!hasTrustline && (
                <div className="mt-6">
                  <Button
                    onClick={handleCreateTrustline}
                    disabled={loading}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                  >
                    Ativar ALGCO2 (Trustline)
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Necessário para receber e enviar o Custom Asset na Stellar Testnet.
                  </p>
                </div>
              )}
              <p className="text-muted-foreground text-sm mt-4 flex items-center">
                <TrendingUp className="mr-2 h-4 w-4" />
                Valor estimado: -- (Mercado Beta)
              </p>
            </div>
          </div>
        </div>

        {/* Burn Card */}
        <Card className="border-border bg-card shadow-xl shadow-black/5">
          <CardHeader>
            <CardTitle className="flex items-center text-xl text-foreground">
              <Flame className="mr-2 h-6 w-6 text-destructive" />
              Aposentar Créditos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBurn} className="space-y-6">
              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm leading-relaxed">
                <p className="font-semibold mb-1 flex items-center">
                  <Activity className="h-4 w-4 mr-2" />
                  Ação Irreversível
                </p>
                Ao aposentar, você envia ALGCO2 para o endereço de retirement com um memo. Esta ação é registrada na blockchain.
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Quantidade para queimar</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={burnAmount}
                    onChange={(e) => setBurnAmount(e.target.value)}
                    className="w-full h-12 pl-4 pr-20 rounded-xl border border-input bg-input focus:bg-background focus:border-destructive focus:ring-2 focus:ring-destructive/20 transition-all outline-none text-lg font-medium text-foreground placeholder:text-muted-foreground"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                    ALGCO2
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-destructive hover:bg-destructive/90 shadow-lg shadow-destructive/20 text-destructive-foreground font-bold text-base rounded-xl border border-destructive/50"
                disabled={burning || !burnAmount || parseFloat(burnAmount) <= 0}
              >
                {burning ? (
                   <span className="flex items-center">
                     <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                     Processando...
                   </span>
                ) : (
                  <span className="flex items-center">
                    Queimar Créditos <Flame className="ml-2 h-5 w-5" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Lifecycle Info */}
      <div className="mt-12">
        <h3 className="text-lg font-bold text-foreground mb-6 flex items-center">
          <History className="mr-2 h-5 w-5 text-muted-foreground" />
          Ciclo de Vida do Crédito
        </h3>
        <div className="grid gap-6 md:grid-cols-4">
          {[
            { step: 1, title: 'Monitoramento', desc: 'Coleta de dados de biomassa', icon: Activity },
            { step: 2, title: 'Verificação', desc: 'Validação técnica dos dados', icon: Leaf },
            { step: 3, title: 'Emissão', desc: 'Geração de tokens ALGACO2', icon: Wind },
            { step: 4, title: 'Aposentadoria', desc: 'Queima para compensação', icon: Flame },
          ].map((item, i) => (
            <div key={i} className="bg-card p-6 rounded-xl border border-border shadow-sm hover:border-primary/50 transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <item.icon className="h-16 w-16 text-foreground" />
              </div>
              <div className="relative z-10">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-secondary text-secondary-foreground text-sm font-bold mb-4 shadow-lg border border-border">
                  {item.step}
                </span>
                <h4 className="font-bold text-foreground mb-1">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
