'use client';

import React, { useState } from 'react';
import {
  GitCommit,
  GitBranch,
  Rocket,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  User
} from 'lucide-react';
import { DeploymentEvent } from '@/lib/types';
import { globalDeploymentCorrelator } from '@/lib/deploymentCorrelator';

interface DeploymentsCorrelatorModuleProps {
  onOpenCopilotWithPrompt: (prompt: string) => void;
}

export const DeploymentsCorrelatorModule: React.FC<DeploymentsCorrelatorModuleProps> = ({
  onOpenCopilotWithPrompt,
}) => {
  const [deployments, setDeployments] = useState<DeploymentEvent[]>(globalDeploymentCorrelator.getDeployments());
  const [rollbackStatus, setRollbackStatus] = useState<string | null>(null);

  const handleRollback = (id: string) => {
    setRollbackStatus(`Initiated automated GitOps rollback for deployment ${id}. Rolling back image tag...`);
    setTimeout(() => {
      setDeployments((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: 'rolled_back' } : d))
      );
      setRollbackStatus('Rollback completed successfully! Traffic restored to previous stable release.');
      setTimeout(() => setRollbackStatus(null), 4000);
    }, 1200);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <GitCommit className="h-4 w-4 text-cyan-400" />
            CI/CD & Deployment Outage Correlator
          </h2>
          <p className="text-xs text-gray-400">
            Correlate CPU spikes, error surges, and incidents with GitHub/GitLab releases
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
            <GitBranch className="h-3.5 w-3.5" />
            <span>Branch: main (Production)</span>
          </span>
        </div>
      </div>

      {rollbackStatus && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          <span>{rollbackStatus}</span>
        </div>
      )}

      {/* Deployment Timeline */}
      <div className="space-y-3">
        {deployments.map((deploy) => {
          const hasImpact = deploy.impactMetric.cpuDelta > 20 || deploy.impactMetric.latencyDeltaMs > 30;
          const isRolledBack = deploy.status === 'rolled_back';

          return (
            <div
              key={deploy.id}
              className={`rounded-2xl border p-5 transition-all space-y-3 ${
                hasImpact && !isRolledBack
                  ? 'border-rose-900/60 bg-rose-950/20 shadow-lg shadow-rose-950/20'
                  : 'border-gray-800 bg-[#111827]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-800 text-cyan-400 font-mono text-xs font-bold">
                    {deploy.commitSha.slice(0, 7)}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">{deploy.commitMessage}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" /> {deploy.author}
                      </span>
                      <span>•</span>
                      <span>{deploy.service}</span>
                      <span>•</span>
                      <span className="text-gray-500">{deploy.deployedAt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${
                      isRolledBack
                        ? 'bg-purple-950 text-purple-400 border-purple-800'
                        : hasImpact
                        ? 'bg-rose-950 text-rose-400 border-rose-800 animate-pulse'
                        : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                    }`}
                  >
                    {isRolledBack ? 'ROLLED BACK' : hasImpact ? 'INCIDENT CORRELATED' : 'HEALTHY'}
                  </span>
                </div>
              </div>

              {/* Metric Impact Delta */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-2.5">
                  <span className="text-[10px] text-gray-500 block">Post-Deploy CPU Delta</span>
                  <span
                    className={`font-mono font-bold ${
                      deploy.impactMetric.cpuDelta > 0 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {deploy.impactMetric.cpuDelta > 0 ? `+${deploy.impactMetric.cpuDelta}%` : `${deploy.impactMetric.cpuDelta}%`}
                  </span>
                </div>

                <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-2.5">
                  <span className="text-[10px] text-gray-500 block">Latency Delta</span>
                  <span
                    className={`font-mono font-bold ${
                      deploy.impactMetric.latencyDeltaMs > 0 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {deploy.impactMetric.latencyDeltaMs > 0 ? `+${deploy.impactMetric.latencyDeltaMs}ms` : `${deploy.impactMetric.latencyDeltaMs}ms`}
                  </span>
                </div>

                <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-2.5">
                  <span className="text-[10px] text-gray-500 block">Error Rate</span>
                  <span className="font-mono font-bold text-gray-200">
                    {deploy.impactMetric.errorRateDelta > 0 ? `+${deploy.impactMetric.errorRateDelta}%` : 'Nominal (0.0%)'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-1">
                {hasImpact && !isRolledBack ? (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1.5 font-semibold">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    AI Copilot correlated this commit directly with the active CPU saturation alert.
                  </p>
                ) : (
                  <span />
                )}

                <div className="flex items-center gap-2">
                  {hasImpact && !isRolledBack && (
                    <button
                      onClick={() => handleRollback(deploy.id)}
                      className="flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1 text-xs font-bold text-white hover:bg-rose-500 transition-colors shadow-sm"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>1-Click Rollback</span>
                    </button>
                  )}
                  <button
                    onClick={() => onOpenCopilotWithPrompt(`Analyze commit ${deploy.commitSha} impact on fleet telemetry`)}
                    className="rounded-lg border border-gray-700 bg-gray-800 px-2.5 py-1 text-xs text-gray-300 hover:text-white"
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
