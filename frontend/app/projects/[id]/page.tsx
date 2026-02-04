'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Leaf, Activity, CheckCircle2, XCircle, Clock, MapPin, History, Play, Factory, Truck, Droplets, ArrowRight, Flame } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { getAlgaeProjectNFT, getMRVRegistry } from '@/lib/contracts';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { ethers } from 'ethers';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Measurement {
  id: number;
  projectId: number;
  timestamp: number;
  biomassAmount: number;
  co2Captured: number;
  dataHash: string;
  status: number; // 0: Pending, 1: Verified, 2: Rejected, 3: Minted
}

interface ProjectMetadata {
  name: string;
  description: string;
  attributes: { trait_type: string; value: string }[];
  image: string;
}

const STATUS_LABELS = ['Pendente', 'Verificado', 'Rejeitado', 'Creditado', 'Aposentado'];
const STATUS_COLORS = ['text-yellow-400 bg-yellow-900/30 border-yellow-700/50', 'text-blue-400 bg-blue-900/30 border-blue-700/50', 'text-red-400 bg-red-900/30 border-red-700/50', 'text-emerald-400 bg-emerald-900/30 border-emerald-700/50', 'text-purple-400 bg-purple-900/30 border-purple-700/50'];

export default function ProjectDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const { wallet } = useWallet();
  
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [metadata, setMetadata] = useState<ProjectMetadata | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [owner, setOwner] = useState<string>('');
  const [isVerifier, setIsVerifier] = useState(false);
  const [activeTab, setActiveTab] = useState<'monitoring' | 'traceability'>('traceability');

  useEffect(() => {
    const fetchData = async () => {
      if (!wallet.isConnected || !wallet.signer || !id) return;

      setLoading(true);
      try {
        const nftContract = getAlgaeProjectNFT(wallet.signer);
        const mrvContract = getMRVRegistry(wallet.signer);

        // Check if user is verifier
        const verifierRole = ethers.id("VERIFIER_ROLE");
        const hasRole = await mrvContract.hasRole(verifierRole, wallet.address);
        setIsVerifier(hasRole);

        // Fetch Project Details
        const tokenURI = await nftContract.tokenURI(id);
        const ownerAddr = await nftContract.ownerOf(id);
        setOwner(ownerAddr);

        if (tokenURI.startsWith('data:application/json;base64,')) {
          try {
            const base64 = tokenURI.split(',')[1];
            const json = atob(base64);
            setMetadata(JSON.parse(json));
          } catch (e) {
            console.error("Error parsing metadata", e);
          }
        }

        // Fetch Measurements
        const rawMeasurements = await mrvContract.getProjectMeasurements(id);
        
        const parsedMeasurements: Measurement[] = rawMeasurements.map((m: any) => ({
          id: Number(m.id),
          projectId: Number(m.projectId),
          timestamp: Number(m.timestamp),
          biomassAmount: Number(m.biomassAmount),
          co2Captured: Number(m.co2Captured),
          dataHash: m.dataHash,
          status: Number(m.status),
        }));

        setMeasurements(parsedMeasurements.reverse()); // Show newest first

      } catch (error) {
        console.error("Error fetching project data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [wallet.isConnected, wallet.signer, wallet.address, id]);

  const getLocation = () => metadata?.attributes.find(a => a.trait_type === "Location")?.value;
  const getAlgaeType = () => metadata?.attributes.find(a => a.trait_type === "Algae Species" || a.trait_type === "Algae Type")?.value;
  const getCapacity = () => metadata?.attributes.find(a => a.trait_type === "Estimated Capacity")?.value;
  const getBioproduct = () => metadata?.attributes.find(a => a.trait_type === "Bioproduct Target")?.value || "Não especificado";
  const getProductionParams = () => metadata?.attributes.find(a => a.trait_type === "Production Params")?.value || "Padrão";

  const handleVerify = async (measurementId: number) => {
    if (!wallet.signer) return;
    setActionLoading(true);
    try {
      const contract = getMRVRegistry(wallet.signer);
      const tx = await contract.verifyMeasurement(measurementId, true);
      await tx.wait();
      window.location.reload();
    } catch (error) {
      console.error("Error verifying:", error);
      alert("Erro ao verificar. Você tem permissão de Verificador?");
    } finally {
        setActionLoading(false);
    }
  };

  const handleIssueCredits = async (measurementId: number) => {
    if (!wallet.signer) return;
    setActionLoading(true);
    try {
      const contract = getMRVRegistry(wallet.signer);
      const tx = await contract.issueCredits(measurementId);
      await tx.wait();
      window.location.reload();
    } catch (error) {
      console.error("Error issuing credits:", error);
      alert("Erro ao emitir créditos.");
    } finally {
        setActionLoading(false);
    }
  };

  const handleRetire = async (measurementId: number) => {
    if (!wallet.signer) return;
    setActionLoading(true);
    try {
      const contract = getMRVRegistry(wallet.signer);
      // Assuming retireCredits exists in the contract for the Beta scope
      const tx = await contract.retireCredits(measurementId, "Uso interno Beta", "Relatório ESG 2024");
      await tx.wait();
      window.location.reload();
    } catch (error) {
      console.error("Error retiring credits:", error);
      alert("Erro ao aposentar créditos. Verifique se a função está disponível no contrato.");
    } finally {
        setActionLoading(false);
    }
  };

  const handleSimulateMeasurement = async () => {
    if (!wallet.signer) return;
    setActionLoading(true);
    try {
        const contract = getMRVRegistry(wallet.signer);
        
        // Simulação de dados realistas
        const lastBiomass = measurements.length > 0 ? measurements[0].biomassAmount : 100;
        const growthRate = 1.05 + (Math.random() * 0.1); // 5-15% growth
        const newBiomass = Math.round(lastBiomass * growthRate);
        const co2Captured = Math.round(newBiomass * 1.83); // 1.83 factor
        const dataHash = `ipfs://QmSimulatedData${Date.now()}`;

        const tx = await contract.addMeasurement(id, newBiomass, co2Captured, dataHash);
        await tx.wait();
        window.location.reload();
    } catch (error) {
        console.error("Error simulating:", error);
        alert("Erro ao simular medição.");
    } finally {
        setActionLoading(false);
    }
  };

  const chartData = [...measurements].reverse().map(m => ({
    date: new Date(m.timestamp * 1000).toLocaleDateString(),
    biomass: m.biomassAmount,
    co2: m.co2Captured
  }));

  if (!wallet.isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 text-center px-4 animate-in fade-in zoom-in duration-500">
        <div className="bg-emerald-900/20 p-6 rounded-full border border-emerald-900/50">
          <Leaf className="h-16 w-16 text-emerald-500" />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-2xl font-bold text-white">Conecte sua carteira</h2>
          <p className="text-zinc-400">
            Conecte sua carteira para visualizar os detalhes deste projeto e a rastreabilidade completa.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
            <Link href="/projects">
            <Button variant="ghost" size="sm" className="rounded-full text-zinc-400 hover:text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
            </Button>
            </Link>
            <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
                {metadata?.name || `Projeto #${id}`}
            </h1>
            <p className="text-zinc-400 mt-1 flex items-center gap-2">
                <span className="bg-emerald-900/30 text-emerald-400 px-2 py-0.5 rounded text-xs border border-emerald-900/50">Beta v0.1</span>
                <span>•</span>
                <span>Detalhes do projeto e rastreabilidade</span>
            </p>
            </div>
        </div>
        <div className="flex gap-2">
             <Button 
                onClick={handleSimulateMeasurement} 
                disabled={actionLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20 border border-blue-500/50"
             >
                {actionLoading ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : (
                    <Play className="h-4 w-4 mr-2" />
                )}
                Simular Crescimento
             </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Info & Actions */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-emerald-600 to-green-400 w-full"></div>
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-emerald-500" />
                    Dados do Projeto
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start">
                <div className="bg-emerald-900/20 p-2.5 rounded-lg mr-3 border border-emerald-900/30">
                  <Leaf className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Espécie</span>
                  <p className="font-semibold text-zinc-200">{getAlgaeType() || "N/A"}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-blue-900/20 p-2.5 rounded-lg mr-3 border border-blue-900/30">
                  <MapPin className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Localização</span>
                  <p className="font-semibold text-zinc-200">{getLocation() || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-orange-900/20 p-2.5 rounded-lg mr-3 border border-orange-900/30">
                  <Factory className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Capacidade</span>
                  <p className="font-semibold text-zinc-200">{getCapacity() ? `${getCapacity()} t/ano` : "N/A"}</p>
                </div>
              </div>

               <div className="flex items-start">
                <div className="bg-purple-900/20 p-2.5 rounded-lg mr-3 border border-purple-900/30">
                  <Droplets className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Bioproduto Alvo</span>
                  <p className="font-semibold text-zinc-200">{getBioproduct()}</p>
                </div>
              </div>
              
              <div className="pt-6 border-t border-white/5">
                <p className="text-xs text-zinc-500 mb-2 font-medium">OWNER</p>
                <div className="bg-black/50 p-3 rounded-lg border border-white/5 font-mono text-xs text-zinc-400 break-all">
                    {owner}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Traceability & Charts */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Tabs */}
            <div className="flex space-x-1 bg-black/40 p-1 rounded-xl border border-white/10 w-fit">
                <button
                    onClick={() => setActiveTab('traceability')}
                    className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                        activeTab === 'traceability' ? "bg-emerald-600 text-white shadow-lg" : "text-zinc-400 hover:text-white hover:bg-white/5"
                    )}
                >
                    Rastreabilidade da Cadeia
                </button>
                <button
                    onClick={() => setActiveTab('monitoring')}
                    className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                        activeTab === 'monitoring' ? "bg-emerald-600 text-white shadow-lg" : "text-zinc-400 hover:text-white hover:bg-white/5"
                    )}
                >
                    Monitoramento de Crescimento
                </button>
            </div>

            {activeTab === 'traceability' && (
                <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white text-lg">Cadeia de Custódia (Chain of Custody)</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 pb-12">
                        <div className="relative">
                            {/* Connecting Line */}
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-zinc-800 -translate-y-1/2 hidden md:block z-0"></div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                                {/* Step 1: Cultivo */}
                                <div className="flex flex-col items-center text-center space-y-3">
                                    <div className="w-16 h-16 rounded-full bg-emerald-900/80 border-2 border-emerald-500 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                        <Leaf className="h-8 w-8 text-emerald-400" />
                                    </div>
                                    <div className="bg-black/60 p-3 rounded-lg border border-emerald-500/30 w-full">
                                        <h4 className="font-bold text-emerald-400 text-sm">1. Cultivo</h4>
                                        <p className="text-xs text-zinc-400 mt-1">{getAlgaeType()}</p>
                                        <p className="text-[10px] text-zinc-500 mt-2 font-mono">{getLocation()}</p>
                                    </div>
                                </div>

                                {/* Step 2: Biomassa */}
                                <div className="flex flex-col items-center text-center space-y-3">
                                    <div className={cn("w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all", measurements.length > 0 ? "bg-emerald-900/80 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-zinc-900 border-zinc-700")}>
                                        <Activity className={cn("h-8 w-8", measurements.length > 0 ? "text-emerald-400" : "text-zinc-600")} />
                                    </div>
                                    <div className={cn("p-3 rounded-lg border w-full", measurements.length > 0 ? "bg-black/60 border-emerald-500/30" : "bg-black/30 border-zinc-800")}>
                                        <h4 className={cn("font-bold text-sm", measurements.length > 0 ? "text-emerald-400" : "text-zinc-600")}>2. Biomassa</h4>
                                        <p className="text-xs text-zinc-400 mt-1">
                                            {measurements.length > 0 ? `${measurements[0].biomassAmount} kg acumulados` : "Aguardando dados"}
                                        </p>
                                        {measurements.length > 0 && <p className="text-[10px] text-emerald-600 mt-1">Verificado on-chain</p>}
                                    </div>
                                </div>

                                {/* Step 3: Bioproduto */}
                                <div className="flex flex-col items-center text-center space-y-3">
                                    <div className={cn("w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all", measurements.length > 0 ? "bg-blue-900/80 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "bg-zinc-900 border-zinc-700")}>
                                        <Factory className={cn("h-8 w-8", measurements.length > 0 ? "text-blue-400" : "text-zinc-600")} />
                                    </div>
                                    <div className={cn("p-3 rounded-lg border w-full", measurements.length > 0 ? "bg-black/60 border-blue-500/30" : "bg-black/30 border-zinc-800")}>
                                        <h4 className={cn("font-bold text-sm", measurements.length > 0 ? "text-blue-400" : "text-zinc-600")}>3. Bioproduto</h4>
                                        <p className="text-xs text-zinc-400 mt-1">{getBioproduct()}</p>
                                        <p className="text-[10px] text-zinc-500 mt-2">Transformação Industrial</p>
                                    </div>
                                </div>

                                {/* Step 4: Mercado */}
                                <div className="flex flex-col items-center text-center space-y-3">
                                    <div className={cn("w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all", measurements.length > 0 ? "bg-purple-900/80 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]" : "bg-zinc-900 border-zinc-700")}>
                                        <Truck className={cn("h-8 w-8", measurements.length > 0 ? "text-purple-400" : "text-zinc-600")} />
                                    </div>
                                    <div className={cn("p-3 rounded-lg border w-full", measurements.length > 0 ? "bg-black/60 border-purple-500/30" : "bg-black/30 border-zinc-800")}>
                                        <h4 className={cn("font-bold text-sm", measurements.length > 0 ? "text-purple-400" : "text-zinc-600")}>4. Destino</h4>
                                        <p className="text-xs text-zinc-400 mt-1">Mercado de Carbono</p>
                                        <p className="text-[10px] text-zinc-500 mt-2">Emissão de Créditos</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                            <h5 className="text-sm font-semibold text-zinc-300 mb-2">Parâmetros de Produção Registrados:</h5>
                            <p className="text-xs font-mono text-zinc-500 leading-relaxed">
                                {getProductionParams()}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {activeTab === 'monitoring' && (
                <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white text-lg">Curva de Crescimento de Biomassa</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorBiomass" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="date" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="biomass" stroke="#10b981" fillOpacity={1} fill="url(#colorBiomass)" name="Biomassa (kg)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

          {/* History List */}
          <Card className="h-full flex flex-col border-white/10 bg-black/40 backdrop-blur-sm">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center">
                <History className="mr-2 h-5 w-5 text-zinc-400" />
                Histórico de Eventos On-Chain
              </h3>
              <span className="bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full text-xs font-bold border border-zinc-700">
                {measurements.length} registros
              </span>
            </div>
            
            <div className="flex-1 overflow-auto p-6 space-y-4 max-h-[500px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent"></div>
                  <p className="text-sm text-zinc-500">Sincronizando com blockchain...</p>
                </div>
              ) : measurements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-xl bg-black/20">
                  <Activity className="h-8 w-8 text-zinc-700 mb-3" />
                  <p className="font-medium text-zinc-500">Nenhum evento registrado</p>
                  <p className="text-xs mt-1">Clique em "Simular Crescimento" para iniciar.</p>
                </div>
              ) : (
                measurements.map((m) => (
                  <div key={m.id} className="group bg-black/40 p-5 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start space-x-4">
                        <div className={cn("p-2 rounded-lg border", STATUS_COLORS[m.status] || "bg-zinc-800 border-zinc-700")}>
                           <div className="h-2 w-2 rounded-full bg-current animate-pulse" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-zinc-200 text-sm">Evento #{m.id}</span>
                            <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border", STATUS_COLORS[m.status])}>
                              {STATUS_LABELS[m.status]}
                            </span>
                          </div>
                          <div className="text-sm text-zinc-400 flex items-center gap-4 mt-2">
                            <span className="flex items-center">
                              <Leaf className="w-3 h-3 mr-1.5 text-emerald-500" />
                              <b className="text-white mr-1">{m.biomassAmount}</b> kg
                            </span>
                            <span className="flex items-center">
                              <Activity className="w-3 h-3 mr-1.5 text-blue-500" />
                              <b className="text-white mr-1">{m.co2Captured}</b> kg CO₂
                            </span>
                          </div>
                          <p className="text-xs text-zinc-600 mt-2 font-mono">
                            {new Date(m.timestamp * 1000).toLocaleString()} • Hash: {m.dataHash.substring(0, 12)}...
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-end space-x-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                        {isVerifier && m.status === 0 && (
                          <Button 
                            size="sm" 
                            disabled={actionLoading}
                            className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-600/50" 
                            onClick={() => handleVerify(m.id)}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1.5" />
                            Verificar
                          </Button>
                        )}
                        {isVerifier && m.status === 1 && (
                          <Button 
                            size="sm" 
                            disabled={actionLoading}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20" 
                            onClick={() => handleIssueCredits(m.id)}
                          >
                            <Leaf className="w-4 h-4 mr-1.5" />
                            Emitir Créditos
                          </Button>
                        )}
                        {isVerifier && m.status === 3 && (
                          <Button 
                            size="sm" 
                            disabled={actionLoading}
                            className="bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20" 
                            onClick={() => handleRetire(m.id)}
                          >
                            <Flame className="w-4 h-4 mr-1.5" />
                            Aposentar (Burn)
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}