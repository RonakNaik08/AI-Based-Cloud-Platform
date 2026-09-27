'use client';

import React, { useState } from 'react';
import {
  Zap,
  Cpu,
  Layers,
  DollarSign,
  Database,
  X,
  CheckCircle2
} from 'lucide-react';

interface AnomalySimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInjectFault: (faultType: 'cpu_spike' | 'memory_leak' | 'cost_surge' | 'rds_connections') => void;
}

export const AnomalySimulatorModal: React.FC<AnomalySimulatorModalProps> = ({
  isOpen,
  onClose,
  onInjectFault,
}) => {
  const [selectedFault, setSelectedFault] = useState<'cpu_spike' | 'memory_leak' | 'cost_surge' | 'rds_connections'>('cpu_spike');
  const [injectedSuccess, setInjectedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInject = () => {
    onInjectFault(selectedFault);
    setInjectedSuccess(true);
    setTimeout(() => {
      setInjectedSuccess(false);
      onClose();
    }, 1000);
  };

  const faults = [
    {
      id: 'cpu_spike' as const,
      title: 'Compute Saturation Loop (CPU Spike)',
      target: 'prod-server-02 (EC2 t3.medium)',
      description: 'Spikes CPU to 95.8% and depletes burst credits.',
      icon: Cpu,
    },
    {
      id: 'memory_leak' as const,
      title: 'Monotonic Memory Leak (Heap Creep)',
      target: 'analytics-worker-03 (EC2 m5.2xlarge)',
      description: 'Drives RAM from 24% to 93.6% over time.',
      icon: Layers,
    },
    {
      id: 'cost_surge' as const,
      title: 'S3 Data Transfer Billing Surge',
      target: 'corporate-db-backups-archive (S3)',
      description: 'Spikes daily data retrieval charges by 16x.',
      icon: DollarSign,
    },
    {
      id: 'rds_connections' as const,
      title: 'PostgreSQL Connection Exhaustion',
      target: 'prod-postgres-main (RDS)',
      description: 'Fills 485/500 connection slots with idle locks.',
      icon: Database,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className="w-full max-w-md rounded-xl border border-gray-800 bg-[#111827] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Simulate Live Fault</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2">
          {faults.map((f) => {
            const isSelected = selectedFault === f.id;
            const Icon = f.icon;
            return (
              <div
                key={f.id}
                onClick={() => setSelectedFault(f.id)}
                className={`rounded-lg border p-3 cursor-pointer transition-colors ${
                  isSelected
                    ? 'border-cyan-500 bg-gray-900'
                    : 'border-gray-800 bg-gray-950/60 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-cyan-400" />
                  <span className="font-semibold text-xs text-white">{f.title}</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">{f.description}</p>
                <p className="text-[10px] text-gray-500 font-mono mt-0.5">Target: {f.target}</p>
              </div>
            );
          })}
        </div>

        {injectedSuccess && (
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>Fault injected into fleet!</span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-800">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-800 bg-gray-900 px-3 py-1.5 text-xs text-gray-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleInject}
            className="rounded-lg bg-amber-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-amber-500"
          >
            Inject Fault
          </button>
        </div>
      </div>
    </div>
  );
};
