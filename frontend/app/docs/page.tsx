import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Book, Calculator, Workflow, Cpu, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

export default function DocsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700 pt-10">
      
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-card text-foreground shadow-2xl shadow-primary/10 p-10 sm:p-14 text-center border border-border">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-72 w-72 rounded-full bg-secondary/20 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="bg-secondary p-3 rounded-2xl backdrop-blur-md border border-border mb-6">
            <Book className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-green-400">
            Documentação Técnica MRV
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Metodologia Beta para monitoramento, reporte e verificação de captura de carbono via microalgas.
          </p>
          <div className="mt-8 flex gap-3">
             <span className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-semibold uppercase tracking-wider">Versão Beta 0.1.0</span>
             <span className="px-3 py-1 rounded-full bg-secondary border border-border text-muted-foreground text-xs font-semibold uppercase tracking-wider">Sepolia Testnet</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Section 1: Credita Carbon Overview */}
        <Card className="md:col-span-2 border-border shadow-xl shadow-primary/5 overflow-hidden bg-card/95 backdrop-blur-sm">
            <div className="h-1.5 bg-gradient-to-r from-primary to-green-600 w-full"></div>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="bg-primary/20 p-2.5 rounded-xl border border-primary/30">
                    <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <CardTitle className="text-xl text-foreground">1. Credita Carbon: Objetivo do Projeto</CardTitle>
                    <p className="text-sm text-muted-foreground font-normal mt-1">Comprovando algas como solução real de descarbonização</p>
                </div>
            </CardHeader>
            <CardContent className="text-muted-foreground leading-relaxed space-y-6 pt-4">
                <p>
                    O projeto tem como objetivo comprovar que cultivos de algas e seus bioprodutos são soluções reais de descarbonização e que podem gerar créditos de carbono validados.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <h4 className="font-semibold text-primary text-sm uppercase tracking-wider">A Solução Deve:</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                                <span>Registrar quando cada lote de alga foi cultivado e colhido.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                                <span>Calcular a taxa de crescimento e conversão em carbono (kg de C e CO2eq).</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                                <span>Comprovar que o carbono não retornou à atmosfera (bioprodutos de longa duração).</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                                <span>Rastrear cadeia completa: Alga → Biomassa → Bioproduto → Destino.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-3">
                         <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider">Público-Alvo</h4>
                         <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary/60"></span>
                                <span>Auditores e certificadoras.</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary/60"></span>
                                <span>Curiosos e entusiastas da bioeconomia azul.</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary/60"></span>
                                <span>Compradores de créditos (futuro).</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary/60"></span>
                                <span>Produtores de algas e bioprodutos.</span>
                            </li>
                         </ul>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Section 2: Methodology & Rules */}
        <Card className="border-border bg-card shadow-lg hover:bg-card/80 transition-all duration-300">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="bg-secondary p-2 rounded-lg border border-border">
                    <Calculator className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg text-foreground">2. Regras de Negócio e Metodologia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
                <div className="bg-secondary/50 text-primary p-5 rounded-xl font-mono text-sm shadow-inner border border-border">
                    <p className="opacity-50 text-xs mb-2">// Regra Principal</p>
                    <p className="text-lg font-bold">1 Crédito = 1 Tonelada CO₂eq</p>
                    <p className="text-xs text-muted-foreground mt-1">Capturado ou evitado (baseado em literatura na Fase Beta).</p>
                </div>
                
                <div className="space-y-2 text-sm text-muted-foreground">
                    <p><strong className="text-foreground">Conversão:</strong> Depende da espécie, localização e condições.</p>
                    <p><strong className="text-foreground">Unicidade:</strong> Cada lote gera um identificador único (Hash).</p>
                    <p><strong className="text-foreground">Bioprodutos Válidos:</strong> Bioestimulantes, biofertilizantes, bioplásticos, alimentos, etc.</p>
                </div>

                <div className="bg-yellow-900/10 p-3 rounded-lg border border-yellow-900/20 flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />
                    <p className="text-xs text-yellow-600 dark:text-yellow-400">
                        <span className="font-semibold">Nota:</span> A primeira versão concentra-se apenas na CAPTURA. A redução de emissões entra na V2.
                    </p>
                </div>
            </CardContent>
        </Card>

        {/* Section 3: Traceability Workflow */}
        <Card className="border-border bg-card shadow-lg hover:bg-card/80 transition-all duration-300">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="bg-secondary p-2 rounded-lg border border-border">
                    <Workflow className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg text-foreground">3. Fluxo do Processo</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
                <ol className="relative border-l border-border ml-3 space-y-6">
                    <li className="ml-6">
                        <span className="absolute flex items-center justify-center w-6 h-6 bg-secondary rounded-full -left-3 ring-4 ring-card">
                            <span className="text-xs font-bold text-primary">1</span>
                        </span>
                        <h3 className="font-semibold text-foreground text-sm">Registro do Projeto (NFT)</h3>
                        <p className="text-xs text-muted-foreground mt-1">Criação da identidade digital da fazenda.</p>
                    </li>
                    <li className="ml-6">
                        <span className="absolute flex items-center justify-center w-6 h-6 bg-secondary rounded-full -left-3 ring-4 ring-card">
                            <span className="text-xs font-bold text-primary">2</span>
                        </span>
                        <h3 className="font-semibold text-foreground text-sm">Medição & Hash</h3>
                        <p className="text-xs text-muted-foreground mt-1">Input de dados e ancoragem na blockchain.</p>
                    </li>
                    <li className="ml-6">
                        <span className="absolute flex items-center justify-center w-6 h-6 bg-secondary rounded-full -left-3 ring-4 ring-card">
                            <span className="text-xs font-bold text-primary">3</span>
                        </span>
                        <h3 className="font-semibold text-foreground text-sm">Verificação & Emissão</h3>
                        <p className="text-xs text-muted-foreground mt-1">Validação e minting do token ERC-20.</p>
                    </li>
                </ol>
            </CardContent>
        </Card>

        {/* Section 4: Business Rules */}
        <Card className="border-border bg-card shadow-lg hover:bg-card/80 transition-all duration-300">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="bg-secondary p-2 rounded-lg border border-border">
                    <Calculator className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg text-foreground">4. Regras de Negócio (Beta)</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
                <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm text-muted-foreground bg-secondary/50 p-2 rounded-lg border border-border">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span><strong>Conversão:</strong> 1 Token = 1 Tonelada de CO₂e capturada.</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-muted-foreground bg-secondary/50 p-2 rounded-lg border border-border">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span><strong>Beta:</strong> Tokens não são negociáveis no app (uso experimental).</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-muted-foreground bg-secondary/50 p-2 rounded-lg border border-border">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span><strong>Validação:</strong> Créditos só são emitidos após validação de verificador autorizado.</span>
                    </li>
                </ul>
            </CardContent>
        </Card>

        {/* Section 5: Tech Stack */}
        <Card className="border-border bg-card shadow-lg hover:bg-card/80 transition-all duration-300">
             <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="bg-secondary p-2 rounded-lg border border-border">
                    <Cpu className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg text-foreground">5. Arquitetura Técnica</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
                <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm text-muted-foreground bg-secondary/50 p-2 rounded-lg border border-border">
                        <div className="h-2 w-2 rounded-full bg-muted-foreground/50"></div>
                        <span className="font-semibold">Blockchain:</span> Stellar Testnet
                    </li>
                    <li className="flex items-center gap-3 text-sm text-muted-foreground bg-secondary/50 p-2 rounded-lg border border-border">
                        <div className="h-2 w-2 rounded-full bg-muted-foreground/50"></div>
                        <span className="font-semibold">Identidade do Projeto:</span> Manage Data + ID local (Beta)
                    </li>
                    <li className="flex items-center gap-3 text-sm text-muted-foreground bg-secondary/50 p-2 rounded-lg border border-border">
                        <div className="h-2 w-2 rounded-full bg-muted-foreground/50"></div>
                        <span className="font-semibold">Token de Crédito:</span> Custom Asset ALGCO2
                    </li>
                    <li className="flex items-center gap-3 text-sm text-muted-foreground bg-secondary/50 p-2 rounded-lg border border-border">
                        <div className="h-2 w-2 rounded-full bg-muted-foreground/50"></div>
                        <span className="font-semibold">Registro de Eventos:</span> Horizon API (REST)
                    </li>
                    <li className="flex items-center gap-3 text-sm text-muted-foreground bg-secondary/50 p-2 rounded-lg border border-border">
                        <div className="h-2 w-2 rounded-full bg-muted-foreground/50"></div>
                        <span className="font-semibold">Verificação / Auditoria:</span> Stellar Expert
                    </li>
                    <li className="flex items-center gap-3 text-sm text-muted-foreground bg-secondary/50 p-2 rounded-lg border border-border">
                        <div className="h-2 w-2 rounded-full bg-muted-foreground/50"></div>
                        <span className="font-semibold">Wallet:</span> Freighter (non-custodial)
                    </li>
                </ul>
            </CardContent>
        </Card>

        {/* Section 6: Limitations */}
        <Card className="border-destructive/30 bg-destructive/10 shadow-lg hover:bg-destructive/20 transition-all duration-300">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="bg-destructive/20 p-2 rounded-lg border border-destructive/30">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <CardTitle className="text-lg text-destructive-foreground">6. Limitações (Beta)</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 space-y-2">
                <p className="text-sm text-destructive-foreground/90 font-medium">
                    Este software é experimental e destinado apenas para fins de demonstração técnica.
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-destructive-foreground/80 pl-2">
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
