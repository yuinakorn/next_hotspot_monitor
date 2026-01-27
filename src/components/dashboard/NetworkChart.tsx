"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface NetworkChartProps {
  data: { date: string; download: number; upload: number }[];
}

export function NetworkChart({ data }: NetworkChartProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Network Traffic</h3>
          <p className="text-sm text-slate-500">Daily Upload vs Download (GB)</p>
        </div>
        <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Last 30 Days</span>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} stackOffset="sign">
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12, fill: '#64748b' }} 
              axisLine={false}
              tickLine={false}
              tickMargin={10}
              minTickGap={30}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#64748b' }} 
              axisLine={false}
              tickLine={false}
              tickMargin={10}
              label={{ value: 'GB', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8' } }}
            />
            <Tooltip 
              cursor={{ fill: '#f1f5f9' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend iconType="circle" />
            <Bar dataKey="download" name="Download" fill="#3b82f6" stackId="stack" radius={[0, 0, 4, 4]} />
            <Bar dataKey="upload" name="Upload" fill="#f59e0b" stackId="stack" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
