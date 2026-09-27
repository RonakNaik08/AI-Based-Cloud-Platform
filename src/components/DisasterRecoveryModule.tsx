'use client';

import React, { useState } from 'react';
import {
  Globe2,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Server,
  RefreshCw
} from 'lucide-react';
import { DRRegionStatus } from '@/lib/types';

export const DisasterRecoveryModule: React.FC = () => {
  const [regions, setRegions] = useState<DRRegionStatus[]>([
    {
      region: 'us-east-1 (N. Virginia)',
      role: 'primary',
      health: 'healthy',
      dnsWeight: 100,
      replicationLagSec: 0.2,
      rtoTargetSec: 30,
      rpoTargetSec: 0,
    },
    {
      region: 'us-west-2 (Oregon)',
      role: 'standby',
      health: 'healthy',
      dnsWeight: 0,
      replicationLagSec: 0.8,
      rtoTargetSec: 30,
      rpoTargetSec: 0,
    },
  ]);

  const [isFailoverTesting, setIsFailoverTesting] = useState(false);
  const [failoverLog, setFailoverLog] = useState<string | null>(null);

  const handleSimulateOutage = () => {
    setIsFailoverTesting(true);
    setFailoverLog('Simulating total failure on primary region us-east-1...');

    setTimeout(() => {
      setRegions([
        {
          region: 'us-east-1 (N. Virginia)',
          role: 'standby',
          health: 'offline',
          dnsWeight: 0,
          replicationLagSec: 99.0,
          rtoTargetSec: 30,
          rpoTargetSec: 0,
        },
        {
          region: 'us-west-2 (Oregon)',
          role: 'primary',
          health: 'healthy',
          dnsWeight: 100,
          replicationLagSec: 0.0,
          rtoTargetSec: 30,
          rpoTargetSec: 0,
        },
      ]);
      setFailoverLog('Route 53 DNS Health Check failed on us-east-1. Automated failover shifted 100% traffic to us-west-2 in 18.4s. (RTO: 18.4s, RPO: 0s).');
      setIsFailoverTesting(false);
    }, 1800);
  };

  const handleRestorePrimary = () => {
    setIsFailoverTesting(true);
    setFailoverLog('Restoring primary active-passive configuration...');

    setTimeout(() => {
      setRegions([
        {
          region: 'us-east-1 (N. Virginia)',
          role: 'primary',
          health: 'healthy',
          dnsWeight: 100,
          replicationLagSec: 0.2,
          rtoTargetSec: 30,
          rpoTargetSec: 0,
        },
        {
          region: 'us-west-2 (Oregon)',
          role: 'standby',
          health: 'healthy',
          dnsWeight: 0,
          replicationLagSec: 0.8,
          rtoTargetSec: 30,
          rpoTargetSec: 0,
        },
      ]);
      setFailoverLog('Nominal multi-region routing restored to primary us-east-1.');
      setIsFailoverTesting(false);
    }, 1000);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Globe2 className="h-4 w-4 text-cyan-400" />
            Multi-Region Disaster Recovery (DR) & Failover Simulator
          </h2>
          <p className="text-xs text-gray-400">
            Route 53 DNS failover, cross-region Aurora replication, and RTO/RPO SLA verification
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateOutage}
            disabled={isFailoverTesting}
            className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-500 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Simulate Region Outage</span>
          </button>

          <button
            onClick={handleRestorePrimary}
            disabled={isFailoverTesting}
            className="flex items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs font-semibold text-gray-200 hover:text-white transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset Active Region</span>
          </button>
        </div>
      </div>

      {failoverLog && (
        <div className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-3 text-xs text-cyan-300">
          <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
          <span>{failoverLog}</span>
        </div>
      )}

      {/* Region Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {regions.map((reg) => {
          const isPrimary = reg.role === 'primary';
          const isOffline = reg.health === 'offline';

          return (
            <div
              key={reg.region}
              className={`rounded-2xl border p-5 space-y-4 transition-all ${
                isOffline
                  ? 'border-rose-900/80 bg-rose-950/20'
                  : isPrimary
                  ? 'border-cyan-500/50 bg-[#111827] shadow-xl shadow-cyan-950/20'
                  : 'border-gray-800 bg-[#111827]/80'
              }`}
            >
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">{reg.region}</h3>
                  <span className="text-[11px] font-mono text-gray-400 capitalize">{reg.role} Region</span>
                </div>
                <span
                  className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${
                    isOffline
                      ? 'bg-rose-950 text-rose-400 border-rose-800'
                      : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  }`}
                >
                  {reg.health}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-2.5">
                  <span className="text-[10px] text-gray-500 block">DNS Traffic Routing</span>
                  <span className="font-mono text-base font-bold text-white">{reg.dnsWeight}%</span>
                </div>

                <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-2.5">
                  <span className="text-[10px] text-gray-500 block">Replication Lag</span>
                  <span className="font-mono text-base font-bold text-cyan-400">{reg.replicationLagSec}s</span>
                </div>

                <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-2.5">
                  <span className="text-[10px] text-gray-500 block">RTO Target</span>
                  <span className="font-mono text-base font-bold text-emerald-400">&lt; {reg.rtoTargetSec}s</span>
                </div>
              </div>

              <div className="rounded-xl border border-gray-800/80 bg-gray-950/40 p-2.5 text-[11px] text-gray-400 flex items-center justify-between">
                <span>Recovery Point Objective (RPO):</span>
                <span className="font-bold text-emerald-400">0 seconds (Synchronous WAL replication)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
