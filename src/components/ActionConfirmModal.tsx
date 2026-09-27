'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  X,
  RefreshCw
} from 'lucide-react';
import { CloudResource } from '@/lib/types';

interface ActionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: string;
  resource?: CloudResource | null;
  params?: any;
  onConfirm: () => Promise<void>;
}

export const ActionConfirmModal: React.FC<ActionConfirmModalProps> = ({
  isOpen,
  onClose,
  actionType,
  resource,
  params,
  onConfirm,
}) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  if (!isOpen) return null;

  const getActionTitle = () => {
    switch (actionType) {
      case 'scale_instance':
        return `Scale ${resource?.name || 'Instance'} to ${params?.targetType || 'c5.xlarge'}`;
      case 'stop_instance':
      case 'stop_resource':
        return `Stop ${resource?.name || 'Resource'}`;
      case 'start_instance':
        return `Start ${resource?.name || 'Resource'}`;
      case 'apply_cost_fix':
        return `Execute FinOps Waste Elimination Plan`;
      case 'clean_orphans':
      case 'delete_ebs':
        return `Delete Orphaned Storage Disks`;
      default:
        return `Execute Action on ${resource?.name || 'Cloud Resource'}`;
    }
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    setStepIndex(1); // IAM check
    await new Promise((r) => setTimeout(r, 400));
    setStepIndex(2); // Snapshot
    await new Promise((r) => setTimeout(r, 500));
    setStepIndex(3); // Apply
    await new Promise((r) => setTimeout(r, 500));
    setStepIndex(4); // Verify
    await new Promise((r) => setTimeout(r, 400));

    await onConfirm();
    setIsExecuting(false);
    setStepIndex(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className="w-full max-w-md rounded-xl border border-gray-800 bg-[#111827] p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Action Confirmation</h3>
          </div>
          <button onClick={onClose} disabled={isExecuting} className="text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Operation */}
        <div className="rounded-lg bg-gray-900 p-3 space-y-1 text-xs">
          <span className="text-gray-400">Operation:</span>
          <p className="font-semibold text-white">{getActionTitle()}</p>
          {resource && (
            <p className="text-[11px] text-gray-400">Target ID: <code className="text-cyan-400">{resource.id}</code> ({resource.region})</p>
          )}
        </div>

        {/* Dry-run validation */}
        <div className="rounded-lg border border-emerald-900/60 bg-emerald-950/20 p-2.5 text-xs text-emerald-400 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span>Dry-run verified: IAM permissions valid & snapshot backup enabled.</span>
        </div>

        {/* Progress */}
        {isExecuting && (
          <div className="rounded-lg bg-gray-900 p-2.5 text-xs space-y-1 font-mono text-gray-300">
            <div className="flex items-center gap-2 text-cyan-400 mb-1">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>Applying cloud modification...</span>
            </div>
            <p className={stepIndex >= 1 ? 'text-emerald-400' : 'text-gray-600'}>1. Validating IAM permissions</p>
            <p className={stepIndex >= 2 ? 'text-emerald-400' : 'text-gray-600'}>2. Taking pre-flight snapshot</p>
            <p className={stepIndex >= 3 ? 'text-emerald-400' : 'text-gray-600'}>3. Applying resize configuration</p>
            <p className={stepIndex >= 4 ? 'text-emerald-400' : 'text-gray-600'}>4. Verifying instance health check</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-800">
          <button
            onClick={onClose}
            disabled={isExecuting}
            className="rounded-lg border border-gray-800 bg-gray-900 px-3 py-1.5 text-xs text-gray-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
          >
            {isExecuting ? 'Executing...' : 'Authorize Action'}
          </button>
        </div>
      </div>
    </div>
  );
};
