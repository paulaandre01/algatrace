'use client';

import React, { useEffect, useState } from 'react';
import { Leaf, Flame, History, ArrowRight, Activity, Wind, TrendingUp } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { getCarbonCreditToken } from '@/lib/contracts';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ethers } from 'ethers';

export default function CreditsPage() {
  const { wallet } = useWallet();
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  const [burnAmount, setBurnAmount] = useState('');
  const [burning, setBurning] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!wallet.isConnected || !wallet.signer || !wallet.address) return;

      try {
        const contract = getCarbonCreditToken(wallet.signer);
        const bal = await contract.balanceOf(wallet.address);
        setBalance(ethers.formatUnits(bal, 18));
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    };

    fetchBalance();
    // Set up a listener for Transfer events to update balance in real-time could be added here
  }, [wallet.isConnected, wallet.signer, wallet.address]);

  const handleBurn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.signer || !burnAmount) return;

    setBurning(true);
    try {
      const contract = getCarbonCreditToken(wallet.signer);
      const amount = ethers.parseUnits(burnAmount, 18);
      const tx = await contract.burn(amount);
      console.log("Burn tx:", tx.hash);
      await tx.wait();
      
      // Update balance
      const bal = await contract.balanceOf(wallet.address);
      setBalance(ethers.formatUnits(bal, 18));
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
        <div className="bg-zinc-800 p-8 rounded-full shadow-inner">
          <Leaf className="h-16 w-16 text-zinc-500" />
        </div>
        <div className="max-w-md space-y-4">
          <h2 className="text-2xl font-bold text-white">Conecte sua carteira</h2>
          <p className="text-zinc-400 leading-relaxed">
            Para visualizar e gerenciar seus créditos de carbono (Token ALGACO2), é necessário conectar sua carteira MetaMask.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pt-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Carteira de Créditos</h1>
          <p className="text-zinc-400 mt-1">Gerencie e aposente seus créditos de carbono (Token ALGACO2).</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Balance Card - Premium Design */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-900 to-black text-white shadow-2xl shadow-emerald-900/20 p-8 group border border-emerald-900/50">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 h-80 w-80 rounded-full bg-emerald-600/10 blur-3xl group-hover:bg-emerald-600/20 transition-all duration-700"></div>
          <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-64 w-64 rounded-full bg-black/40 blur-3xl"></div>
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-emerald-100/70 font-medium text-lg flex items-center">
                  <Wind className="mr-2 h-5 w-5 opacity-70" />
                  Saldo Disponível
                </p>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl backdrop-blur-md border border-white/10">
                <Leaf className="h-8 w-8 text-emerald-500" />
              </div>
            </div>
            
            <div className="mt-8">
              <div className="flex items-baseline space-x-3">
                <h2 className="text-6xl font-bold tracking-tighter text-white">{parseFloat(balance).toFixed(2)}</h2>
                <span className="text-xl text-emerald-400 font-medium bg-emerald-950/50 px-3 py-1 rounded-full backdrop-blur-sm border border-emerald-900">ALGACO2</span>
              </div>
              <p className="text-emerald-100/50 text-sm mt-4 flex items-center">
                <TrendingUp className="mr-2 h-4 w-4" />
                Valor estimado: -- (Mercado Beta)
              </p>
            </div>
          </div>
        </div>

        {/* Burn Card */}
        <Card className="border-zinc-800 bg-zinc-900/50 shadow-xl shadow-black/50">
          <CardHeader>
            <CardTitle className="flex items-center text-xl text-white">
              <Flame className="mr-2 h-6 w-6 text-orange-500" />
              Aposentar Créditos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBurn} className="space-y-6">
              <div className="p-4 bg-orange-900/10 border border-orange-900/30 rounded-xl text-orange-200 text-sm leading-relaxed">
                <p className="font-semibold mb-1 flex items-center text-orange-400">
                  <Activity className="h-4 w-4 mr-2" />
                  Ação Irreversível
                </p>
                Ao "queimar" tokens, você os retira de circulação permanentemente para compensar emissões de carbono. Esta ação é registrada na blockchain.
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Quantidade para queimar</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={burnAmount}
                    onChange={(e) => setBurnAmount(e.target.value)}
                    className="w-full h-12 pl-4 pr-20 rounded-xl border border-zinc-700 bg-zinc-950 focus:bg-zinc-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-900/20 transition-all outline-none text-lg font-medium text-white placeholder:text-zinc-600"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-500">
                    ALGACO2
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-500 hover:to-red-600 shadow-lg shadow-orange-900/20 text-white font-bold text-base rounded-xl border border-orange-800"
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
        <h3 className="text-lg font-bold text-white mb-6 flex items-center">
          <History className="mr-2 h-5 w-5 text-zinc-500" />
          Ciclo de Vida do Crédito
        </h3>
        <div className="grid gap-6 md:grid-cols-4">
          {[
            { step: 1, title: 'Monitoramento', desc: 'Coleta de dados de biomassa', icon: Activity },
            { step: 2, title: 'Verificação', desc: 'Validação técnica dos dados', icon: Leaf },
            { step: 3, title: 'Emissão', desc: 'Geração de tokens ALGACO2', icon: Wind },
            { step: 4, title: 'Aposentadoria', desc: 'Queima para compensação', icon: Flame },
          ].map((item, i) => (
            <div key={i} className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 shadow-sm hover:bg-zinc-900 hover:border-zinc-700 transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <item.icon className="h-16 w-16 text-white" />
              </div>
              <div className="relative z-10">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-zinc-800 text-zinc-300 text-sm font-bold mb-4 shadow-lg border border-zinc-700">
                  {item.step}
                </span>
                <h4 className="font-bold text-white mb-1">{item.title}</h4>
                <p className="text-sm text-zinc-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
