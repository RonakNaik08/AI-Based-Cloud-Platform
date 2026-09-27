'use client';

import React, { useState } from 'react';
import {
  Boxes,
  Server,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  Play
} from 'lucide-react';
import { K8sPod, K8sNode, PodStatus } from '@/lib/types';
import { globalK8sEngine } from '@/lib/k8sEngine';

interface KubernetesModuleProps {
  onOpenCopilotWithPrompt: (prompt: string) => void;
}

export const KubernetesModule: React.FC<KubernetesModuleProps> = ({
  onOpenCopilotWithPrompt,
}) => {
  const [pods, setPods] = useState<K8sPod[]>(globalK8sEngine.getPods());
  const [nodes, setNodes] = useState<K8sNode[]>(globalK8sEngine.getNodes());
  const [selectedNamespace, setSelectedNamespace] = useState<string>('all');
  const [activeLogPod, setActiveLogPod] = useState<K8sPod | null>(null);

  const handleRestartPod = (id: string) => {
    const res = globalK8sEngine.restartPod(id);
    if (res.success) {
      setPods([...globalK8sEngine.getPods()]);
    }
  };

  const filteredPods = pods.filter((p) =>
    selectedNamespace === 'all' ? true : p.namespace === selectedNamespace
  );

  const getStatusColor = (status: PodStatus) => {
    switch (status) {
      case 'Running':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'CrashLoopBackOff':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse';
      case 'OOMKilled':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-gray-800 text-gray-400 border-gray-700';
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Boxes className="h-4 w-4 text-cyan-400" />
            Kubernetes (K8s) Cluster & Container Fleet
          </h2>
          <p className="text-xs text-gray-400">
            Node capacity, container pod health, memory limits, and CrashLoop diagnostics
          </p>
        </div>

        {/* Namespace Pills */}
        <div className="flex items-center rounded-lg border border-gray-800 bg-gray-900 p-0.5 text-xs">
          {['all', 'production', 'staging', 'kube-system'].map((ns) => (
            <button
              key={ns}
              onClick={() => setSelectedNamespace(ns)}
              className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                selectedNamespace === ns ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {ns}
            </button>
          ))}
        </div>
      </div>

      {/* Cluster Node Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {nodes.map((node) => (
          <div key={node.id} className="rounded-2xl border border-gray-800 bg-[#111827] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-bold text-white truncate max-w-[150px]">{node.name}</span>
              </div>
              <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400">
                {node.status}
              </span>
            </div>

            <div className="space-y-1 text-xs text-gray-400">
              <div className="flex justify-between text-[11px]">
                <span>Role / Type</span>
                <span className="font-mono text-gray-200">{node.role} • {node.instanceType}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>CPU Allocatable</span>
                <span className="font-mono text-cyan-400">{node.cpuCapacity}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>Active Pods</span>
                <span className="font-mono text-white font-bold">{node.podsCount} pods</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pods Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-800 bg-[#111827]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-800 bg-gray-900 text-gray-400 font-semibold">
              <tr>
                <th className="px-4 py-2.5">Pod Name</th>
                <th className="px-4 py-2.5">Namespace</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">CPU Usage</th>
                <th className="px-4 py-2.5">Memory Usage</th>
                <th className="px-4 py-2.5">Restarts</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredPods.map((pod) => (
                <tr key={pod.id} className="hover:bg-gray-900/60 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-white">{pod.name}</td>
                  <td className="px-4 py-3 text-gray-400">{pod.namespace}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(pod.status)}`}>
                      {pod.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-300">
                    {pod.cpuCurrentMilli}m <span className="text-gray-500">/ {pod.cpuLimitMilli}m</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-300">
                    {pod.memoryCurrentMb}MB <span className="text-gray-500">/ {pod.memoryLimitMb}MB</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-400">{pod.restarts}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleRestartPod(pod.id)}
                        className="rounded border border-gray-700 bg-gray-800 px-2 py-1 text-[11px] font-semibold text-cyan-400 hover:text-white hover:bg-gray-700 transition-colors"
                      >
                        Rolling Restart
                      </button>
                      <button
                        onClick={() => setActiveLogPod(pod)}
                        className="rounded border border-gray-700 bg-gray-800 p-1 text-gray-400 hover:text-white"
                        title="View Logs"
                      >
                        <Terminal className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pod Logs Terminal Modal */}
      {activeLogPod && (
        <div className="rounded-2xl border border-gray-800 bg-gray-950 p-4 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2 text-gray-400">
            <span className="text-cyan-400 font-bold flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5" /> kubectl logs {activeLogPod.name} -n {activeLogPod.namespace}
            </span>
            <button onClick={() => setActiveLogPod(null)} className="text-gray-500 hover:text-white">
              ✕ Close Logs
            </button>
          </div>
          <div className="space-y-1 text-gray-300 max-h-36 overflow-y-auto pt-1">
            <p className="text-gray-500">[2026-09-27T06:12:00Z] Initializing container runtime v1.28.2...</p>
            <p className="text-emerald-400">[2026-09-27T06:12:01Z] HTTP Server listening on port 8080</p>
            {activeLogPod.status === 'CrashLoopBackOff' ? (
              <p className="text-rose-400">[2026-09-27T06:12:15Z] FATAL: Node.js heap limit exceeded (1980MB / 2048MB). Process exiting with code 137 (SIGKILL)</p>
            ) : (
              <p className="text-gray-400">[2026-09-27T06:12:15Z] Health check probe /healthz returned 200 OK (latency: 3ms)</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
