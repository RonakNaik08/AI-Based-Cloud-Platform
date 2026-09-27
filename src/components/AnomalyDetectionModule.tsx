'use client';

import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Zap,
  Sparkles,
} from 'lucide-react';
import { AnomalyItem, CloudResource } from '@/lib/types';

interface AnomalyDetectionModuleProps {
  anomalies: AnomalyItem[];
  resources: CloudResource[];
  onOpenSimulator: () => void;
  onMitigateAnomaly: (id: string, anomaly: AnomalyItem) => void;
  onAcknowledgeAnomaly: (id: string) => void;
  onOpenCopilotWithPrompt: (prompt: string) => void;
}

export const AnomalyDetectionModule: React.FC<AnomalyDetectionModuleProps> = ({
  anomalies,
  onOpenSimulator,
  onMitigateAnomaly,
  onAcknowledgeAnomaly,
  onOpenCopilotWithPrompt,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'mitigated'>('all');

  const filteredAnomalies = anomalies.filter((a) => {
    if (activeFilter === 'all') return true;
    return a.status === activeFilter;
  });

  const activeCount = anomalies.filter((a) => a.status === 'active').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Activity className="h-4 w-4 text-rose-400" />
            AI Anomaly Detection ({activeCount} Active)
          </h2>
          <p className="text-xs text-gray-400">
            Statistical Z-Score and rolling IQR models detecting performance and cost outliers
          </p>
        </div>

        <button
          onClick={onOpenSimulator}
          className="flex items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs font-semibold text-amber-400 hover:text-white transition-colors"
        >
          <Zap className="h-3.5 w-3.5" />
          <span>Simulate Anomaly</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-800 pb-2">
        {(['all', 'active', 'mitigated'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
              activeFilter === filter
                ? 'bg-gray-800 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {filter} ({filter === 'all' ? anomalies.length : anomalies.filter((a) => a.status === filter).length})
          </button>
        ))}
      </div>

      {/* Anomaly Cards */}
      <div className="space-y-3">
        {filteredAnomalies.map((anom) => {
          const isMitigated = anom.status === 'mitigated';

          return (
            <div
              key={anom.id}
              className={`rounded-xl border p-4 transition-colors ${
                isMitigated
                  ? 'border-gray-800 bg-[#111827] opacity-60'
                  : 'border-gray-800 bg-[#111827]'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.2 text-[10px] font-bold uppercase ${
                        anom.severity === 'critical'
                          ? 'bg-rose-950 text-rose-400'
                          : 'bg-amber-950 text-amber-400'
                      }`}
                    >
                      {anom.severity}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      Score: {anom.score}% &bull; {anom.detectionMethod}
                    </span>
                    <span className="text-[11px] text-gray-500">
                      {new Date(anom.detectedAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-white">{anom.summary}</h3>
                  <p className="text-xs text-gray-300">{anom.aiExplanation}</p>

                  <div className="flex items-center gap-3 text-xs text-gray-400 pt-1">
                    <span>
                      Current: <strong className="text-rose-400 font-mono">{anom.currentValue} {anom.unit}</strong>
                    </span>
                    <span>
                      Baseline: <strong className="text-gray-200 font-mono">{anom.baselineValue} {anom.unit}</strong>
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {!isMitigated && (
                    <button
                      onClick={() => onMitigateAnomaly(anom.id, anom)}
                      className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors"
                    >
                      Apply Fix: {anom.recommendedAction.title}
                    </button>
                  )}
                  <button
                    onClick={() =>
                      onOpenCopilotWithPrompt(
                        `Deep dive into anomaly ${anom.id} on ${anom.resourceName}: ${anom.summary}`
                      )
                    }
                    className="rounded-lg border border-gray-700 bg-gray-800 px-2.5 py-1.5 text-xs text-gray-300 hover:text-white"
                  >
                    Ask Copilot
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
