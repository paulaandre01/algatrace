'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface DataPoint {
  date: string;
  biomass: number;
  co2: number;
}

interface GrowthChartProps {
  data: DataPoint[];
}

export const GrowthChart: React.FC<GrowthChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-[200px] w-full flex items-center justify-center text-muted-foreground text-sm">
        Nenhum dado de medição disponível
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorBiomass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis dataKey="date" tick={{fontSize: 12, fill: '#94a3b8'}} stroke="#334155" />
        <YAxis tick={{fontSize: 12, fill: '#94a3b8'}} stroke="#334155" />
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
        <Tooltip 
          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
          itemStyle={{ color: '#f1f5f9' }}
        />
        <Area 
          type="monotone" 
          dataKey="biomass" 
          stroke="#22c55e" 
          fillOpacity={1} 
          fill="url(#colorBiomass)" 
          name="Biomassa (kg)"
        />
        <Area 
          type="monotone" 
          dataKey="co2" 
          stroke="#3b82f6" 
          fillOpacity={1} 
          fill="url(#colorCo2)" 
          name="CO₂e (kg)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
