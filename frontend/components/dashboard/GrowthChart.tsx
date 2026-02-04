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
      <div className="h-[200px] w-full flex items-center justify-center text-slate-400 text-sm">
        Nenhum dado de medição disponível
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorBiomass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis dataKey="date" tick={{fontSize: 12}} />
        <YAxis tick={{fontSize: 12}} />
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <Tooltip />
        <Area 
          type="monotone" 
          dataKey="biomass" 
          stroke="#16a34a" 
          fillOpacity={1} 
          fill="url(#colorBiomass)" 
          name="Biomassa (kg)"
        />
        <Area 
          type="monotone" 
          dataKey="co2" 
          stroke="#2563eb" 
          fillOpacity={1} 
          fill="url(#colorCo2)" 
          name="CO2 (kg)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
