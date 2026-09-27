'use client';

import React, { useState } from 'react';
import {
  PlayCircle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { AutomatedAction } from '@/lib/types';

interface AutomatedActionsModuleProps {
  actions: AutomatedAction[];
  onApproveAction: (actionId: string) => void;
  onRejectAction: (actionId: string) => void;
  onOpenCopilotWithPrompt: (prompt: string) => void;
}

export const AutomatedActionsModule: React.FC<AutomatedActionsModuleProps> = ({
  actions,
  onApproveAction,
  onRejectAction,
}) => {
  const [filter, setFilter] = useState<'pending' | 'completed' | 'all'>('pending');

  const pendingActions = actions.filter((a) => a.status === 'pending_approval');
  const completedActions = actions.filter((a) => a.status === 'completed' || a.status === 'rejected');
  const displayedActions =
    filter === 'pending' ? pendingActions : filter === 'completed' ? completedActions : actions;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <PlayCircle className="h-4 w-4 text-amber-400" />
            Automated Actions ({pendingActions.length} Pending)
          </h2>
          <p className="text-xs text-gray-400">
            Action approval queue with pre-flight dry-run checks and automatic rollback plans
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Admin Authorization Required</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-800 pb-2">
        {(['pending', 'completed', 'all'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
              filter === tab
                ? 'bg-gray-800 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab} (
            {tab === 'pending'
              ? pendingActions.length
              : tab === 'completed'
              ? completedActions.length
              : actions.length}
            )
          </button>
        ))}
      </div>

      {/* Actions List */}
      <div className="space-y-3">
        {displayedActions.map((action) => {
          const isPending = action.status === 'pending_approval';

          return (
            <div
              key={action.id}
              className="rounded-xl border border-gray-800 bg-[#111827] p-4 flex flex-col lg:flex-row lg:items-start justify-between gap-3"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-gray-800 px-1.5 py-0.2 text-[10px] font-bold uppercase text-gray-300">
                    {action.riskLevel} Risk
                  </span>
                  <span className="text-[11px] text-gray-400">
                    Proposed by: <strong className="text-white">{action.proposedBy}</strong>
                  </span>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Dry-Run Passed
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-white">{action.title}</h3>
                <p className="text-xs text-gray-300">{action.description}</p>
                <p className="text-[11px] text-gray-500">Rollback Plan: {action.rollbackPlan}</p>
              </div>

              {isPending ? (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onApproveAction(action.id)}
                    className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => onRejectAction(action.id)}
                    className="rounded-lg border border-gray-700 bg-gray-800 px-2.5 py-1.5 text-xs font-medium text-gray-400 hover:text-white"
                  >
                    Reject
                  </button>
                </div>
              ) : (
                <span className="text-xs font-semibold text-emerald-400">
                  Executed by {action.executedBy || 'Admin'}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
