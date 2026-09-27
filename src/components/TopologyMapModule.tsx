'use client';

import React, { useState } from 'react';
import {
  Layers,
  Server,
  Database,
  HardDrive,
  Globe,
  Sparkles,
  ArrowRight,
  Activity,
  ShieldCheck,
  Zap,
  Info,
  CheckCircle2
} from 'lucide-react';
import { CloudResource, CloudProvider } from '@/lib/types';

interface TopologyMapModuleProps {
  resources: CloudResource[];
  onSelectResource: (resource: CloudResource) => void;
  onOpenCopilotWithPrompt: (prompt: string) => void;
}

export const TopologyMapModule: React.FC<TopologyMapModuleProps> = ({
  resources,
  onSelectResource,
  onOpenCopilotWithPrompt,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [activeNode, setActiveNode] = useState<CloudResource | null>(resources[0] || null);

  const filteredResources = resources.filter((r) =>
    selectedProvider === 'all' ? true : r.provider === selectedProvider
  );

  const computeNodes = filteredResources.filter(
    (r) => r.type === 'ec2' || r.type === 'azure_vm' || r.type === 'gcp_vm' || r.type === 'lambda'
  );
  const dbNodes = filteredResources.filter(
    (r) => r.type === 'rds' || r.type === 'azure_sql' || r.type === 'gcp_sql'
  );
  const storageNodes = filteredResources.filter(
    (r) => r.type === 's3' || r.type === 'azure_blob' || r.type === 'gcp_storage' || r.type === 'ebs'
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="h-4 w-4 text-cyan-400" />
            Visual Cloud Architecture & Topology Map
          </h2>
          <p className="text-xs text-gray-400">
            Interactive multi-tier dependency graph with live telemetry flows
          </p>
        </div>

        {/* Provider Filter */}
        <div className="flex items-center rounded-lg border border-gray-800 bg-gray-900 p-0.5 text-xs">
          {['all', 'aws', 'azure', 'gcp'].map((p) => (
            <button
              key={p}
              onClick={() => setSelectedProvider(p)}
              className={`rounded-md px-2.5 py-1 font-semibold uppercase transition-colors ${
                selectedProvider === p ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Main Graph Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Visual Map Canvas */}
        <div className="lg:col-span-8 rounded-2xl border border-gray-800 bg-[#0d121f] p-5 space-y-6 relative overflow-hidden">
          {/* Subtle Grid Background */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

          {/* Tier 1: Ingress / Edge Router */}
          <div className="relative z-10 space-y-2 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              Tier 1: Global Ingress & API Gateway
            </span>
            <div className="flex justify-center gap-4">
              <div className="flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-950/40 px-4 py-2 text-xs font-semibold text-cyan-300 shadow-md">
                <Globe className="h-4 w-4 text-cyan-400 animate-pulse" />
                <span>CloudFront CDN & Route 53 (Global Anycast)</span>
                <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] text-emerald-400">18ms</span>
              </div>
            </div>
          </div>

          {/* Flow Connector Line */}
          <div className="flex justify-center text-gray-600">
            <div className="h-4 w-0.5 bg-gradient-to-b from-cyan-500 to-indigo-500" />
          </div>

          {/* Tier 2: Compute Fleet */}
          <div className="relative z-10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                Tier 2: Compute & Microservices ({computeNodes.length} nodes)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {computeNodes.map((node) => {
                const isSelected = activeNode?.id === node.id;
                const isHigh = node.cpuUtilization > 80;

                return (
                  <button
                    key={node.id}
                    onClick={() => setActiveNode(node)}
                    className={`rounded-xl border p-3 text-left transition-all ${
                      isSelected
                        ? 'border-cyan-500 bg-gray-900 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500'
                        : isHigh
                        ? 'border-rose-500/50 bg-rose-950/20 hover:border-rose-400'
                        : 'border-gray-800 bg-gray-900/60 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Server className={`h-3.5 w-3.5 ${isHigh ? 'text-rose-400' : 'text-cyan-400'}`} />
                        <span className="text-xs font-bold text-white truncate max-w-[120px]">{node.name}</span>
                      </div>
                      <span className="text-[9px] font-mono text-gray-400 uppercase">{node.provider}</span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="text-gray-400">{node.instanceType || node.type}</span>
                      <span className={`font-mono font-bold ${isHigh ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {node.cpuUtilization}% CPU
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Flow Connector Line */}
          <div className="flex justify-center text-gray-600">
            <div className="h-4 w-0.5 bg-gradient-to-b from-indigo-500 to-purple-500" />
          </div>

          {/* Tier 3: Database & Storage Tiers */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Database Column */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                Tier 3: Relational Databases ({dbNodes.length} clusters)
              </span>
              <div className="space-y-2">
                {dbNodes.map((db) => (
                  <button
                    key={db.id}
                    onClick={() => setActiveNode(db)}
                    className={`w-full rounded-xl border p-2.5 text-left transition-all ${
                      activeNode?.id === db.id
                        ? 'border-cyan-500 bg-gray-900 ring-1 ring-cyan-500'
                        : 'border-gray-800 bg-gray-900/60 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Database className="h-3.5 w-3.5 text-purple-400" />
                        <span className="text-xs font-bold text-white">{db.name}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">${db.monthlyCost.toFixed(0)}/mo</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">{db.details?.engine || 'PostgreSQL Engine'}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Storage Column */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Tier 4: Object & Block Storage ({storageNodes.length} assets)
              </span>
              <div className="space-y-2">
                {storageNodes.slice(0, 3).map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setActiveNode(st)}
                    className={`w-full rounded-xl border p-2.5 text-left transition-all ${
                      activeNode?.id === st.id
                        ? 'border-cyan-500 bg-gray-900 ring-1 ring-cyan-500'
                        : 'border-gray-800 bg-gray-900/60 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <HardDrive className="h-3.5 w-3.5 text-amber-400" />
                        <span className="text-xs font-bold text-white truncate max-w-[130px]">{st.name}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">${st.monthlyCost.toFixed(0)}/mo</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">{st.type.toUpperCase()} Storage</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Node Deep Inspector Sidebar */}
        <div className="lg:col-span-4 rounded-2xl border border-gray-800 bg-[#111827] p-5 flex flex-col justify-between space-y-4">
          {activeNode ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Node Telemetry</h3>
                </div>
                <span className="rounded bg-cyan-500/10 border border-cyan-500/30 px-1.5 py-0.5 text-[9px] font-bold text-cyan-400 uppercase">
                  {activeNode.provider}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white">{activeNode.name}</h4>
                <p className="text-[11px] font-mono text-gray-400">{activeNode.id}</p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-gray-800/60 pb-1.5">
                  <span className="text-gray-400">Instance Spec</span>
                  <span className="font-mono text-white">{activeNode.instanceType || activeNode.type}</span>
                </div>
                <div className="flex justify-between border-b border-gray-800/60 pb-1.5">
                  <span className="text-gray-400">Region</span>
                  <span className="text-gray-200">{activeNode.region}</span>
                </div>
                <div className="flex justify-between border-b border-gray-800/60 pb-1.5">
                  <span className="text-gray-400">CPU Load</span>
                  <span className={`font-mono font-bold ${activeNode.cpuUtilization > 80 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {activeNode.cpuUtilization}%
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-800/60 pb-1.5">
                  <span className="text-gray-400">Monthly Cost</span>
                  <span className="font-mono text-white font-bold">${activeNode.monthlyCost.toFixed(2)}/mo</span>
                </div>
              </div>

              {activeNode.details?.stateReason && (
                <div className="rounded-xl border border-gray-800 bg-gray-950 p-3 text-[11px] text-gray-300">
                  <span className="text-cyan-400 font-bold block mb-1">State Diagnostic:</span>
                  {activeNode.details.stateReason}
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-400">Select any node in the topology map to inspect.</p>
          )}

          <div className="pt-3 border-t border-gray-800 space-y-2">
            {activeNode && (
              <button
                onClick={() => onSelectResource(activeNode)}
                className="w-full rounded-lg bg-cyan-600 py-2 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors"
              >
                Inspect Resource Details
              </button>
            )}
            <button
              onClick={() => onOpenCopilotWithPrompt(`Analyze the architectural topology of ${activeNode?.name || 'my fleet'}`)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2 text-xs font-semibold text-gray-200 hover:text-white transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>Ask Copilot about Topology</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
