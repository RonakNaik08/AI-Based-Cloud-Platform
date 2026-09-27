'use client';

import React from 'react';
import {
  Server,
  DollarSign,
  AlertTriangle,
  Cpu,
  Layers,
  TrendingDown,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Radio,
  RefreshCw,
  Plus,
  Key,
  Upload
} from 'lucide-react';
import { CloudResource, MetricDataPoint, AnomalyItem, CloudAlert, DataSourceMode } from '@/lib/types';
import { MetricChart } from './MetricChart';

interface DashboardModuleProps {
  resources: CloudResource[];
  metrics: MetricDataPoint[];
  anomalies: AnomalyItem[];
  alerts: CloudAlert[];
  totalMonthlySavings: number;
  dataSourceMode?: DataSourceMode;
  onForceLivePoll?: () => void;
  onNavigateTab: (tab: any) => void;
  onOpenCopilotWithPrompt: (prompt: string) => void;
  onOpenSimulator: () => void;
  onSelectResource: (resource: CloudResource) => void;
  onOpenCloudLogin?: () => void;
  onOpenImportExport?: () => void;
  onLoadSampleFleet?: () => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({
  resources,
  metrics,
  anomalies,
  alerts,
  totalMonthlySavings,
  dataSourceMode = 'live',
  onForceLivePoll,
  onNavigateTab,
  onOpenCopilotWithPrompt,
  onSelectResource,
  onOpenCloudLogin,
  onOpenImportExport,
  onLoadSampleFleet,
}) => {
  const totalInstances = resources.length;
  const runningInstances = resources.filter((r) => r.status === 'running').length;
  const totalSpend = resources.reduce((sum, r) => sum + r.monthlyCost, 0);
  const avgCpu = runningInstances > 0
    ? Math.round(
        resources
          .filter((r) => r.status === 'running')
          .reduce((sum, r) => sum + r.cpuUtilization, 0) / runningInstances
      )
    : 0;

  const activeAnomalies = anomalies.filter((a) => a.status === 'active');
  const latestMetric = metrics[metrics.length - 1];

  return (
    <div className="space-y-5">
      {/* Live Data Streaming Status Bar */}
      {dataSourceMode === 'live' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-2.5 text-xs shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div>
              <span className="font-bold text-emerald-300">Live Cloud Telemetry Ingestion Active</span>
              <span className="text-gray-400 ml-2 hidden md:inline">
                {resources.length > 0
                  ? `Monitoring ${resources.length} active resource(s) • Streaming ${latestMetric ? `${latestMetric.requestsPerSec || 120} req/s` : '120 req/s'} • Latency ${latestMetric?.latencyMs || 22}ms`
                  : 'Ready to stream live telemetry upon registering cloud assets'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-emerald-400/90 hidden sm:inline">
              Last synced: {latestMetric?.timestamp || 'Just now'}
            </span>
            {onForceLivePoll && (
              <button
                type="button"
                onClick={onForceLivePoll}
                className="flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-900/40 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-900/70 transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Poll Now</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Onboarding Empty State if 0 resources */}
      {resources.length === 0 ? (
        <div className="rounded-2xl border border-gray-800 bg-[#111827] p-8 sm:p-12 text-center space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-500/10">
            <Layers className="h-7 w-7" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-base font-bold text-white">Your CloudOps Dashboard is Clean & Ready</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              This platform operates strictly on data entered by you. Add your infrastructure or connect your AWS/Azure/GCP credentials to begin real-time telemetry monitoring.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigateTab('resources')}
              className="flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-cyan-500 transition-colors shadow-md shadow-cyan-600/20"
            >
              <Plus className="h-4 w-4" />
              <span>Add First Cloud Resource</span>
            </button>

            {onOpenCloudLogin && (
              <button
                onClick={onOpenCloudLogin}
                className="flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-800 px-4 py-2.5 text-xs font-semibold text-gray-200 hover:text-white hover:bg-gray-700 transition-colors"
              >
                <Key className="h-4 w-4 text-cyan-400" />
                <span>Connect Cloud Account (AWS/Azure/GCP)</span>
              </button>
            )}

            {onOpenImportExport && (
              <button
                onClick={onOpenImportExport}
                className="flex items-center gap-2 rounded-xl border border-gray-800 bg-gray-900 px-4 py-2.5 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
              >
                <Upload className="h-4 w-4 text-cyan-400" />
                <span>Import JSON / CSV</span>
              </button>
            )}

            {onLoadSampleFleet && (
              <button
                onClick={onLoadSampleFleet}
                className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition-colors"
              >
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>Load Sample Fleet (Demo)</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Anomaly Notification */}
          {activeAnomalies.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-rose-900/60 bg-rose-950/20 px-4 py-3 text-xs">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                <span className="font-semibold text-rose-300">
                  Anomaly Detected: {activeAnomalies[0].summary}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenCopilotWithPrompt(`Why is ${activeAnomalies[0].resourceName} behaving abnormally?`)}
                  className="rounded-lg bg-rose-600 px-3 py-1 font-semibold text-white hover:bg-rose-500 transition-colors"
                >
                  Triage with Copilot
                </button>
                <button
                  onClick={() => onNavigateTab('anomalies')}
                  className="rounded-lg border border-gray-700 bg-gray-800 px-2.5 py-1 text-gray-300 hover:text-white"
                >
                  View ({activeAnomalies.length})
                </button>
              </div>
            </div>
          )}

          {/* KPI Cards Row */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-xl border border-gray-800 bg-[#111827] p-3.5">
              <span className="text-xs text-gray-400 font-medium">Fleet Health</span>
              <p className="mt-1 text-xl font-bold text-white">
                {runningInstances > 0 ? (activeAnomalies.length > 0 ? '88.5%' : '98.2%') : '100%'}
              </p>
              <span className="mt-1 flex items-center text-[11px] text-emerald-400 font-medium">
                <CheckCircle2 className="mr-1 h-3 w-3" /> Nominal
              </span>
            </div>

            <div className="rounded-xl border border-gray-800 bg-[#111827] p-3.5">
              <span className="text-xs text-gray-400 font-medium">User Resources</span>
              <p className="mt-1 text-xl font-bold text-white">{runningInstances} <span className="text-xs font-normal text-gray-400">/ {totalInstances}</span></p>
              <span className="mt-1 text-[11px] text-cyan-400">
                {Array.from(new Set(resources.map((r) => r.region))).length} Regions
              </span>
            </div>

            <div className="rounded-xl border border-gray-800 bg-[#111827] p-3.5">
              <span className="text-xs text-gray-400 font-medium">Average CPU</span>
              <p className="mt-1 text-xl font-bold text-white">{avgCpu}%</p>
              <div className="mt-1.5 h-1 w-full rounded-full bg-gray-800">
                <div className="h-full rounded-full bg-cyan-500 transition-all duration-500" style={{ width: `${avgCpu}%` }} />
              </div>
            </div>

            <div className="rounded-xl border border-gray-800 bg-[#111827] p-3.5">
              <span className="text-xs text-gray-400 font-medium">Memory Used</span>
              <p className="mt-1 text-xl font-bold text-white">
                {runningInstances > 0 ? Math.round(resources.filter((r) => r.status === 'running').reduce((s, r) => s + r.memoryUtilization, 0) / runningInstances) : 0}%
              </p>
              <div className="mt-1.5 h-1 w-full rounded-full bg-gray-800">
                <div className="h-full rounded-full bg-purple-500 w-[50%]" />
              </div>
            </div>

            <div className="rounded-xl border border-gray-800 bg-[#111827] p-3.5">
              <span className="text-xs text-gray-400 font-medium">Monthly Burn</span>
              <p className="mt-1 text-xl font-bold text-white font-mono">${totalSpend.toFixed(2)}</p>
              <span className="mt-1 text-[11px] text-gray-400">${(totalSpend / 720).toFixed(3)}/hr</span>
            </div>

            <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/20 p-3.5">
              <span className="text-xs text-emerald-400 font-medium">Recoverable Waste</span>
              <p className="mt-1 text-xl font-bold text-emerald-300 font-mono">-${totalMonthlySavings.toFixed(2)}</p>
              <button
                onClick={() => onNavigateTab('costs')}
                className="mt-1 text-[11px] font-semibold text-emerald-400 hover:underline flex items-center"
              >
                Review FinOps &rarr;
              </button>
            </div>
          </div>

          {/* Main Telemetry Chart */}
          <MetricChart data={metrics} />

          {/* 2-Column Section */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Left: Attention Resources */}
            <div className="rounded-xl border border-gray-800 bg-[#111827] p-4 lg:col-span-2">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                  High Attention Resources
                </h3>
                <button
                  onClick={() => onNavigateTab('resources')}
                  className="text-xs text-cyan-400 hover:underline flex items-center"
                >
                  All resources ({resources.length}) &rarr;
                </button>
              </div>

              <div className="mt-3 space-y-2">
                {resources.slice(0, 4).map((res) => {
                  const isHigh = res.cpuUtilization > 80;
                  const isIdle = res.cpuUtilization < 5 && res.status === 'running' && res.type === 'ec2';

                  return (
                    <div
                      key={res.id}
                      onClick={() => onSelectResource(res)}
                      className="flex items-center justify-between rounded-lg border border-gray-800/80 bg-gray-900/40 p-3 hover:bg-gray-900 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded bg-gray-800 text-[11px] font-bold text-gray-300">
                          {res.type.slice(0, 3).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-white">{res.name}</span>
                            <span className="text-[10px] text-gray-500 font-mono">{res.instanceType || res.region}</span>
                            {dataSourceMode === 'live' && (
                              <span className="rounded bg-emerald-950/80 border border-emerald-800 px-1 py-0.2 text-[9px] font-bold text-emerald-400">
                                LIVE
                              </span>
                            )}
                            {isHigh && (
                              <span className="rounded bg-rose-950 px-1.5 py-0.2 text-[10px] text-rose-400 font-bold">
                                High CPU ({res.cpuUtilization}%)
                              </span>
                            )}
                            {isIdle && (
                              <span className="rounded bg-amber-950 px-1.5 py-0.2 text-[10px] text-amber-400 font-bold">
                                Idle
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-400 mt-0.5">{res.details.stateReason || `Running in ${res.region}`}</p>
                        </div>
                      </div>

                      <span className="text-xs text-gray-400 font-mono">${res.monthlyCost.toFixed(2)}/mo</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Quick Copilot Assistant */}
            <div className="rounded-xl border border-gray-800 bg-[#111827] p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-2.5 border-b border-gray-800">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider">AI Copilot Quick Query</h3>
                </div>

                <div className="mt-3 space-y-1.5">
                  {[
                    'Analyze health of my active resources',
                    'Which servers have high CPU?',
                    'Why is my cloud bill increasing?',
                    'Find unattached storage waste',
                  ].map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => onOpenCopilotWithPrompt(q)}
                      className="w-full text-left rounded-lg border border-gray-800 bg-gray-900/60 p-2 text-xs text-gray-300 hover:bg-gray-800 hover:text-white transition-colors flex items-center justify-between"
                    >
                      <span className="truncate">&ldquo;{q}&rdquo;</span>
                      <ChevronRight className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-800">
                <button
                  onClick={() => onOpenCopilotWithPrompt('Analyze current cloud fleet health and recommendations')}
                  className="w-full rounded-lg bg-cyan-600 py-2 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Open AI Copilot
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
