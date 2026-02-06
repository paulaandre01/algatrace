import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Activity, CheckCircle, Flame, Leaf, Plus, ExternalLink, Clock } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { getCarbonCreditToken, getMRVRegistry } from '@/lib/contracts';
import { ethers } from 'ethers';

type ActivityItem = {
  id: string;
  type: 'measurement' | 'verification' | 'issuance' | 'retirement';
  title: string;
  description: string;
  timestamp: Date;
  hash: string;
};

export const RecentActivity = () => {
  const { wallet } = useWallet();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!wallet.signer) return;

      setLoading(true);
      try {
        const mrvContract = getMRVRegistry(wallet.signer);
        const tokenContract = getCarbonCreditToken(wallet.signer);

        const currentBlock = await wallet.signer.provider?.getBlockNumber() || 0;
        const fromBlock = Math.max(0, currentBlock - 5000);

        const [addedLogs, verifiedLogs, issuedLogs, retiredLogs] = await Promise.all([
          mrvContract.queryFilter(mrvContract.filters.MeasurementAdded(), fromBlock),
          mrvContract.queryFilter(mrvContract.filters.MeasurementVerified(), fromBlock),
          mrvContract.queryFilter(mrvContract.filters.CreditsIssued(), fromBlock),
          mrvContract.queryFilter(mrvContract.filters.CreditsRetired(), fromBlock)
        ]);

        const items: ActivityItem[] = [];

        for (const log of addedLogs) {
          if (!('args' in log)) continue; // Type guard
          const block = await log.getBlock();
          items.push({
            id: log.transactionHash,
            type: 'measurement',
            title: 'Nova Medição',
            description: `Projeto #${log.args[1]} registrou ${log.args[2]}kg de CO₂e`,
            timestamp: new Date(block.timestamp * 1000),
            hash: log.transactionHash
          });
        }

        for (const log of verifiedLogs) {
          if (!('args' in log)) continue;
          const block = await log.getBlock();
          items.push({
            id: log.transactionHash,
            type: 'verification',
            title: 'Medição Verificada',
            description: `Medição #${log.args[0]} aprovada`,
            timestamp: new Date(block.timestamp * 1000),
            hash: log.transactionHash
          });
        }

        for (const log of issuedLogs) {
          if (!('args' in log)) continue;
          const block = await log.getBlock();
          items.push({
            id: log.transactionHash,
            type: 'issuance',
            title: 'Créditos Emitidos',
            description: `${ethers.formatUnits(log.args[1], 18)} créditos gerados`,
            timestamp: new Date(block.timestamp * 1000),
            hash: log.transactionHash
          });
        }

        for (const log of retiredLogs) {
          if (!('args' in log)) continue;
          const block = await log.getBlock();
          items.push({
            id: log.transactionHash,
            type: 'retirement',
            title: 'Créditos Aposentados',
            description: `${ethers.formatUnits(log.args[1], 18)} aposentados. ${log.args[2]}`,
            timestamp: new Date(block.timestamp * 1000),
            hash: log.transactionHash
          });
        }

        // Sort by date desc
        items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setActivities(items.slice(0, 10)); // Show last 10

      } catch (error) {
        console.error("Error fetching activity:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [wallet.signer]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'measurement': return <Plus className="h-4 w-4 text-primary" />;
      case 'verification': return <CheckCircle className="h-4 w-4 text-primary" />;
      case 'issuance': return <Leaf className="h-4 w-4 text-primary" />;
      case 'retirement': return <Flame className="h-4 w-4 text-destructive" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'measurement': return 'bg-primary/10 border-primary/20';
      case 'verification': return 'bg-primary/10 border-primary/20';
      case 'issuance': return 'bg-primary/10 border-primary/20';
      case 'retirement': return 'bg-destructive/10 border-destructive/20';
      default: return 'bg-secondary border-border';
    }
  };

  return (
    <Card className="border border-border bg-card shadow-xl shadow-primary/5 h-full">
      <CardHeader>
        <CardTitle className="flex items-center text-lg text-foreground">
          <Clock className="mr-2 h-5 w-5 text-muted-foreground" />
          Atividade Recente
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-4 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-secondary"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-secondary rounded"></div>
                  <div className="h-3 w-1/2 bg-secondary rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activities.length > 0 ? (
          <div className="relative border-l border-border ml-5 space-y-8 my-2">
            {activities.map((item, index) => (
              <div key={`${item.hash}-${index}`} className="relative pl-8 group">
                <span className={`absolute -left-[17px] top-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-background ring-1 ring-border ${getBgColor(item.type)} transition-all group-hover:scale-110`}>
                  {getIcon(item.type)}
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </span>
                  <span className="text-xs text-muted-foreground mb-1">
                    {item.timestamp.toLocaleDateString()} às {item.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                  <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg border border-border mt-1 group-hover:bg-secondary transition-colors">
                    {item.description}
                  </p>
                  <a 
                    href={`https://etherscan.io/tx/${item.hash}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center text-[10px] text-muted-foreground/70 hover:text-primary mt-2 w-fit transition-colors"
                  >
                    Ver na Blockchain <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-secondary h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">Nenhuma atividade registrada</p>
            <p className="text-xs text-muted-foreground/70 mt-1">As transações aparecerão aqui.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
