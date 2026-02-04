import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Book, Calculator, Workflow, Cpu, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

export default function DocsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700 pt-10">
      
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-zinc-900 text-white shadow-2xl shadow-black/50 p-10 sm:p-14 text-center border border-zinc-800">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="bg-zinc-800 p-3 rounded-2xl backdrop-blur-md border border-zinc-700 mb-6">
            <Book className="h-8 w-8 text-emerald-500" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-400">
            Documentação Técnica MRV
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Metodologia Beta para monitoramento, reporte e verificação de captura de carbono via microalgas.
          </p>
          <div className="mt-8 flex gap-3">
             <span className="px-3 py-1 rounded-full bg-emerald-900/30 border border-emerald-900/50 text-emerald-400 text-xs font-semibold uppercase tracking-wider">Versão Beta 0.1.0</span>
             <span className="px-3 py-1 rounded-full bg-blue-900/30 border border-blue-900/50 text-blue-400 text-xs font-semibold uppercase tracking-wider">Sepolia Testnet</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Section 1: Credita Carbon Overview */}
        <Card className="md:col-span-2 border-white/10 shadow-xl shadow-black/50 overflow-hidden bg-black/40 backdrop-blur-sm">
            <div className="h-1.5 bg-gradient-to-r from-emerald-600 to-blue-600 w-full"></div>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="bg-emerald-900/30 p-2.5 rounded-xl border border-emerald-900/50">
                    <FileText className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                    <CardTitle className="text-xl text-white">1. Credita Carbon: Objetivo do Projeto</CardTitle>
                    <p className="text-sm text-zinc-400 font-normal mt-1">Comprovando algas como solução real de descarbonização</p>
                </div>
            </CardHeader>
            <CardContent className="text-zinc-300 leading-relaxed space-y-6 pt-4">
                <p>
                    O projeto tem como objetivo comprovar que cultivos de algas e seus bioprodutos são soluções reais de descarbonização e que podem gerar créditos de carbono validados.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <h4 className="font-semibold text-emerald-400 text-sm uppercase tracking-wider">A Solução Deve:</h4>
                        <ul className="space-y-2 text-sm text-zinc-400">
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" />
                                <span>Registrar quando cada lote de alga foi cultivado e colhido.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" />
                                <span>Calcular a taxa de crescimento e conversão em carbono (kg de C e CO2eq).</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" />
                                <span>Comprovar que o carbono não retornou à atmosfera (bioprodutos de longa duração).</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" />
                                <span>Rastrear cadeia completa: Alga → Biomassa → Bioproduto → Destino.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-3">
                         <h4 className="font-semibold text-blue-400 text-sm uppercase tracking-wider">Público-Alvo</h4>
                         <ul className="space-y-2 text-sm text-zinc-400">
                            <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                                <span>Auditores e certificadoras.</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                                <span>Curiosos e entusiastas da bioeconomia azul.</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                                <span>Compradores de créditos (futuro).</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                                <span>Produtores de algas e bioprodutos.</span>
                            </li>
                         </ul>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Section 2: Methodology & Rules */}
        <Card className="border-white/10 bg-black/40 backdrop-blur-sm shadow-lg hover:bg-black/60 transition-all duration-300">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="bg-blue-900/30 p-2 rounded-lg border border-blue-900/50">
                    <Calculator className="h-5 w-5 text-blue-500" />
                </div>
                <CardTitle className="text-lg text-white">2. Regras de Negócio e Metodologia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
                <div className="bg-black/60 text-emerald-400 p-5 rounded-xl font-mono text-sm shadow-inner border border-white/5">
                    <p className="opacity-50 text-xs mb-2">// Regra Principal</p>
                    <p className="text-lg font-bold">1 Crédito = 1 Tonelada CO₂eq</p>
                    <p className="text-xs text-zinc-500 mt-1">Capturado ou evitado (baseado em literatura na Fase Beta).</p>
                </div>
                
                <div className="space-y-2 text-sm text-zinc-400">
                    <p><strong className="text-white">Conversão:</strong> Depende da espécie, localização e condições.</p>
                    <p><strong className="text-white">Unicidade:</strong> Cada lote gera um identificador único (Hash).</p>
                    <p><strong className="text-white">Bioprodutos Válidos:</strong> Bioestimulantes, biofertilizantes, bioplásticos, alimentos, etc.</p>
                </div>

                <div className="bg-yellow-900/20 p-3 rounded-lg border border-yellow-900/30 flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />
                    <p className="text-xs text-yellow-200/80">
                        <span className="font-semibold">Nota:</span> A primeira versão concentra-se apenas na CAPTURA. A redução de emissões entra na V2.
                    </p>
                </div>
            </CardContent>
        </Card>

        {/* Section 3: Traceability Workflow */}
        <Card className="border-zinc-800 bg-zinc-900/50 shadow-lg hover:bg-zinc-900 transition-all duration-300">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="bg-purple-900/30 p-2 rounded-lg border border-purple-900/50">
                    <Workflow className="h-5 w-5 text-purple-500" />
                </div>
                <CardTitle className="text-lg text-white">3. Fluxo do Processo</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
                <ol className="relative border-l border-zinc-800 ml-3 space-y-6">
                    <li className="ml-6">
                        <span className="absolute flex items-center justify-center w-6 h-6 bg-purple-900/50 rounded-full -left-3 ring-4 ring-zinc-900">
                            <span className="text-xs font-bold text-purple-400">1</span>
                        </span>
                        <h3 className="font-semibold text-white text-sm">Registro do Projeto (NFT)</h3>
                        <p className="text-xs text-zinc-500 mt-1">Criação da identidade digital da fazenda.</p>
                    </li>
                    <li className="ml-6">
                        <span className="absolute flex items-center justify-center w-6 h-6 bg-purple-900/50 rounded-full -left-3 ring-4 ring-zinc-900">
                            <span className="text-xs font-bold text-purple-400">2</span>
                        </span>
                        <h3 className="font-semibold text-white text-sm">Medição & Hash</h3>
                        <p className="text-xs text-zinc-500 mt-1">Input de dados e ancoragem na blockchain.</p>
                    </li>
                    <li className="ml-6">
                        <span className="absolute flex items-center justify-center w-6 h-6 bg-purple-900/50 rounded-full -left-3 ring-4 ring-zinc-900">
                            <span className="text-xs font-bold text-purple-400">3</span>
                        </span>
                        <h3 className="font-semibold text-white text-sm">Verificação & Emissão</h3>
                        <p className="text-xs text-zinc-500 mt-1">Validação e minting do token ERC-20.</p>
                    </li>
                </ol>
            </CardContent>
        </Card>

        {/* Section 3: Business Rules */}
        <Card className="border-zinc-800 bg-zinc-900/50 shadow-lg hover:bg-zinc-900 transition-all duration-300">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="bg-yellow-900/30 p-2 rounded-lg border border-yellow-900/50">
                    <Calculator className="h-5 w-5 text-yellow-500" />
                </div>
                <CardTitle className="text-lg text-white">4. Regras de Negócio (Beta)</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
                <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm text-zinc-300 bg-zinc-900 p-2 rounded-lg border border-zinc-800">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span><strong>Conversão:</strong> 1 Token = 1 Tonelada de CO₂eq capturada.</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-zinc-300 bg-zinc-900 p-2 rounded-lg border border-zinc-800">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span><strong>Intransferível:</strong> Tokens deste Beta são Soulbound (não negociáveis).</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-zinc-300 bg-zinc-900 p-2 rounded-lg border border-zinc-800">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span><strong>Validação:</strong> Créditos só são emitidos após validação de verificador autorizado.</span>
                    </li>
                </ul>
            </CardContent>
        </Card>

        {/* Section 4: Tech Stack */}
        <Card className="border-zinc-800 bg-zinc-900/50 shadow-lg hover:bg-zinc-900 transition-all duration-300">
             <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="bg-orange-900/30 p-2 rounded-lg border border-orange-900/50">
                    <Cpu className="h-5 w-5 text-orange-500" />
                </div>
                <CardTitle className="text-lg text-white">5. Arquitetura Técnica</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
                <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm text-zinc-300 bg-zinc-900 p-2 rounded-lg border border-zinc-800">
                        <div className="h-2 w-2 rounded-full bg-zinc-600"></div>
                        <span className="font-semibold">Blockchain:</span> Ethereum (Hardhat)
                    </li>
                    <li className="flex items-center gap-3 text-sm text-zinc-300 bg-zinc-900 p-2 rounded-lg border border-zinc-800">
                        <div className="h-2 w-2 rounded-full bg-zinc-600"></div>
                        <span className="font-semibold">NFT (ERC-721):</span> Identidade do Projeto
                    </li>
                    <li className="flex items-center gap-3 text-sm text-zinc-300 bg-zinc-900 p-2 rounded-lg border border-zinc-800">
                        <div className="h-2 w-2 rounded-full bg-zinc-600"></div>
                        <span className="font-semibold">Token (ERC-20):</span> Crédito de Carbono
                    </li>
                </ul>
            </CardContent>
        </Card>

        {/* Section 6: Limitations */}
        <Card className="border-red-900/30 bg-red-900/10 shadow-lg hover:bg-red-900/20 transition-all duration-300">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="bg-red-900/30 p-2 rounded-lg border border-red-900/50">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <CardTitle className="text-lg text-red-200">6. Limitações (Beta)</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 space-y-2">
                <p className="text-sm text-red-300 font-medium">
                    Este software é experimental e destinado apenas para fins de demonstração técnica.
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-red-400/80 pl-2">
                    <li>Dados de biomassa são auto-declarados.</li>
                    <li>Verificação centralizada nesta versão.</li>
                    <li>Tokens sem valor financeiro real.</li>
                </ul>
            </CardContent>
        </Card>

      </div>
    </div>
  );
}
