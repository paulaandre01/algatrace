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
          tokenContract.queryFilter(tokenContract.filters.CreditRetired(), fromBlock)
        ]);

        const items: ActivityItem[] = [];

        for (const log of addedLogs) {
          if (!('args' in log)) continue; // Type guard
          const block = await log.getBlock();
          items.push({
            id: log.transactionHash,
            type: 'measurement',
            title: 'Nova Medição',
            description: `Projeto #${log.args[1]} registrou ${log.args[2]}kg de CO₂`,
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
            description: `${ethers.formatUnits(log.args[1], 18)} queimados. ${log.args[2]}`,
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
      case 'measurement': return <Plus className="h-4 w-4 text-blue-500" />;
      case 'verification': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'issuance': return <Leaf className="h-4 w-4 text-green-600" />;
      case 'retirement': return <Flame className="h-4 w-4 text-orange-500" />;
      default: return <Activity className="h-4 w-4 text-slate-500" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'measurement': return 'bg-blue-50 border-blue-100';
      case 'verification': return 'bg-emerald-50 border-emerald-100';
      case 'issuance': return 'bg-green-50 border-green-100';
      case 'retirement': return 'bg-orange-50 border-orange-100';
      default: return 'bg-slate-50 border-slate-100';
    }
  };

  return (
    <Card className="border border-slate-100 shadow-xl shadow-slate-200/50 h-full">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Clock className="mr-2 h-5 w-5 text-slate-400" />
          Atividade Recente
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-4 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-slate-100"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-slate-100 rounded"></div>
                  <div className="h-3 w-1/2 bg-slate-100 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activities.length > 0 ? (
          <div className="relative border-l border-slate-200 ml-5 space-y-8 my-2">
            {activities.map((item, index) => (
              <div key={`${item.hash}-${index}`} className="relative pl-8 group">
                <span className={`absolute -left-[17px] top-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white ring-1 ring-slate-100 ${getBgColor(item.type)} transition-all group-hover:scale-110`}>
                  {getIcon(item.type)}
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    {item.title}
                  </span>
                  <span className="text-xs text-slate-500 mb-1">
                    {item.timestamp.toLocaleDateString()} às {item.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                  <p className="text-sm text-slate-600 bg-slate-50/50 p-3 rounded-lg border border-slate-100 mt-1 group-hover:bg-slate-50 transition-colors">
                    {item.description}
                  </p>
                  <a 
                    href={`https://etherscan.io/tx/${item.hash}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center text-[10px] text-slate-400 hover:text-emerald-500 mt-2 w-fit transition-colors"
                  >
                    Ver na Blockchain <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-slate-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">Nenhuma atividade registrada</p>
            <p className="text-xs text-slate-400 mt-1">As transações aparecerão aqui.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
