'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { MetricDataPoint } from '@/lib/types';
import { Cpu, Wifi, DollarSign, Activity, Layers } from 'lucide-react';

interface MetricChartProps {
  data: MetricDataPoint[];
  title?: string;
  defaultMetric?: 'cpu' | 'memory' | 'network' | 'cost' | 'latency';
}

export const MetricChart: React.FC<MetricChartProps> = ({
  data,
  title = 'Live Infrastructure Telemetry',
  defaultMetric = 'cpu',
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'cpu' | 'memory' | 'network' | 'cost' | 'latency'>(defaultMetric);
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h'>('24h');

  const displayData = timeRange === '1h' ? data.slice(-5) : timeRange === '6h' ? data.slice(-12) : data;

  const metricConfigs = {
    cpu: {
      label: 'CPU Utilization',
      color: '#06b6d4',
      icon: Cpu,
      formatter: (v: number) => `${v}%`,
    },
    memory: {
      label: 'Memory',
      color: '#8b5cf6',
      icon: Layers,
      formatter: (v: number) => `${v}%`,
    },
    network: {
      label: 'Network Out',
      color: '#10b981',
      icon: Wifi,
      formatter: (v: number) => `${v} Mbps`,
    },
    cost: {
      label: 'Hourly Spend',
      color: '#f59e0b',
      icon: DollarSign,
      formatter: (v: number) => `$${v}/hr`,
    },
    latency: {
      label: 'P95 Latency',
      color: '#f43f5e',
      icon: Activity,
      formatter: (v: number) => `${v} ms`,
    },
  };

  const currentCfg = metricConfigs[selectedMetric];

  return (
    <div className="rounded-xl border border-gray-800 bg-[#111827] p-4 sm:p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-3">
        <div>
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          <p className="text-xs text-gray-400 mt-0.5">Aggregated metrics from CloudWatch</p>
        </div>

        {/* Time Selector */}
        <div className="flex items-center gap-1 rounded-lg border border-gray-800 bg-gray-900 p-0.5 text-xs">
          {(['1h', '6h', '24h'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                timeRange === r ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Selector Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-3">
        {(Object.keys(metricConfigs) as (keyof typeof metricConfigs)[]).map((key) => {
          const cfg = metricConfigs[key];
          const isSelected = selectedMetric === key;
          const Icon = cfg.icon;
          return (
            <button
              key={key}
              onClick={() => setSelectedMetric(key)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                isSelected
                  ? 'bg-gray-800 text-cyan-400 border border-gray-700'
                  : 'bg-gray-900/60 text-gray-400 border border-gray-800 hover:text-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5" style={{ color: cfg.color }} />
              <span>{cfg.label}</span>
            </button>
          );
        })}
      </div>

      {/* Chart Canvas */}
      <div className="mt-4 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentCfg.color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={currentCfg.color} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis dataKey="timestamp" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis
              stroke="#6b7280"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}${selectedMetric === 'cpu' || selectedMetric === 'memory' ? '%' : ''}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111827',
                borderColor: '#374151',
                borderRadius: '0.5rem',
                fontSize: '12px',
                color: '#f9fafb',
              }}
              formatter={(val: any) => [currentCfg.formatter(val), currentCfg.label]}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <Area
              type="monotone"
              dataKey={
                selectedMetric === 'cpu'
                  ? 'cpu'
                  : selectedMetric === 'memory'
                  ? 'memory'
                  : selectedMetric === 'network'
                  ? 'networkOut'
                  : selectedMetric === 'cost'
                  ? 'cost'
                  : 'latencyMs'
              }
              stroke={currentCfg.color}
              strokeWidth={2}
              fill="url(#chartGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
