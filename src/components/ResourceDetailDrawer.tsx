'use client';

import React, { useState } from 'react';
import {
  X,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import { CloudResource } from '@/lib/types';

interface ResourceDetailDrawerProps {
  resource: CloudResource | null;
  onClose: () => void;
  onRequestAction: (actionType: string, resource: CloudResource, params?: any) => void;
  onOpenCopilotWithPrompt: (prompt: string) => void;
}

export const ResourceDetailDrawer: React.FC<ResourceDetailDrawerProps> = ({
  resource,
  onClose,
  onRequestAction,
  onOpenCopilotWithPrompt,
}) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'logs' | 'config'>('metrics');

  if (!resource) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full sm:w-[460px] flex-col border-l border-gray-800 bg-[#0e1424] shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3 bg-gray-900">
        <div>
          <h3 className="text-sm font-bold text-white">{resource.name}</h3>
          <p className="text-[11px] font-mono text-gray-400">{resource.id} &bull; {resource.region}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-800 px-4 pt-2">
        {(['metrics', 'logs', 'config'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`border-b-2 px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
              activeTab === tab
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {activeTab === 'metrics' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-lg border border-gray-800 bg-gray-900 p-3">
                <span className="text-gray-400">CPU Load</span>
                <p className="text-xl font-bold font-mono text-white mt-0.5">{resource.cpuUtilization}%</p>
              </div>
              <div className="rounded-lg border border-gray-800 bg-gray-900 p-3">
                <span className="text-gray-400">Memory</span>
                <p className="text-xl font-bold font-mono text-white mt-0.5">{resource.memoryUtilization}%</p>
              </div>
            </div>

            <div className="rounded-lg border border-gray-800 bg-gray-900 p-3 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-400">Monthly Cost</span>
                <span className="font-mono text-white font-semibold">${resource.monthlyCost.toFixed(2)}/mo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status</span>
                <span className="text-emerald-400 font-semibold">{resource.status.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Instance Type</span>
                <span className="font-mono text-white">{resource.instanceType || resource.type}</span>
              </div>
            </div>

            <div className="rounded-lg border border-gray-800 bg-gray-900 p-3 space-y-1">
              <span className="font-semibold text-cyan-400">AI Assessment</span>
              <p className="text-gray-300">{resource.details.stateReason || 'Resource is nominal.'}</p>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="rounded-lg bg-gray-950 p-3 font-mono text-[11px] text-gray-300 space-y-1.5">
            <p className="text-gray-500">[INFO] 2026-09-26T16:48:12Z - Health check /healthz 200 OK (12ms)</p>
            <p className="text-gray-500">[INFO] 2026-09-26T16:48:22Z - Worker processed job #90812 (4.8MB)</p>
            {resource.cpuUtilization > 80 && (
              <p className="text-rose-400">[WARN] 2026-09-26T16:48:45Z - Thread contention delay &gt; 250ms</p>
            )}
            <p className="text-gray-500">[INFO] 2026-09-26T16:49:01Z - CloudWatch agent metrics exported</p>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="rounded-lg border border-gray-800 bg-gray-900 p-3 space-y-1.5 text-[11px] font-mono">
            {Object.entries(resource.tags).map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-gray-800/60 pb-1">
                <span className="text-gray-400">{k}:</span>
                <span className="text-white">{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="border-t border-gray-800 p-3 bg-gray-900 flex justify-between">
        <button
          onClick={() => onOpenCopilotWithPrompt(`Why is ${resource.name} operating with current metrics?`)}
          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-cyan-400 hover:text-white"
        >
          Ask Copilot
        </button>

        <div className="flex gap-1.5">
          {resource.type === 'ec2' && (
            <button
              onClick={() =>
                onRequestAction('scale_instance', resource, {
                  currentType: resource.instanceType,
                  targetType: 'c5.xlarge',
                })
              }
              className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500"
            >
              Scale
            </button>
          )}

          {resource.status === 'running' ? (
            <button
              onClick={() => onRequestAction('stop_instance', resource)}
              className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-950"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={() => onRequestAction('start_instance', resource)}
              className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-emerald-400 hover:bg-emerald-950"
            >
              Start
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
