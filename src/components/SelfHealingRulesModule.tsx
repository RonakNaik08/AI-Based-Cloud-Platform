'use client';

import React, { useState } from 'react';
import {
  Zap,
  CheckCircle2,
  Play,
  Pause,
  Plus,
  Shield,
  Clock,
  Activity,
  Sparkles,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { SelfHealingRule } from '@/lib/types';
import { globalSelfHealingEngine } from '@/lib/selfHealingEngine';

interface SelfHealingRulesModuleProps {
  onOpenCopilotWithPrompt: (prompt: string) => void;
}

export const SelfHealingRulesModule: React.FC<SelfHealingRulesModuleProps> = ({
  onOpenCopilotWithPrompt,
}) => {
  const [rules, setRules] = useState<SelfHealingRule[]>(globalSelfHealingEngine.getRules());
  const [executionMessage, setExecutionMessage] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    globalSelfHealingEngine.toggleRule(id);
    setRules([...globalSelfHealingEngine.getRules()]);
  };

  const handleRunNow = (id: string) => {
    const res = globalSelfHealingEngine.executeRule(id);
    setRules([...globalSelfHealingEngine.getRules()]);
    setExecutionMessage(res.message);
    setTimeout(() => setExecutionMessage(null), 3000);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Zap className="h-4 w-4 text-cyan-400" />
            Autonomous Cloud Self-Healing Engine
          </h2>
          <p className="text-xs text-gray-400">
            Event-driven auto-remediation triggers, compute auto-scaling & FinOps idle guards
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Autonomous Engine: Active</span>
          </span>
        </div>
      </div>

      {executionMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          <span>{executionMessage}</span>
        </div>
      )}

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((rule) => {
          const isActive = rule.status === 'active';

          return (
            <div
              key={rule.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between space-y-4 transition-all ${
                isActive
                  ? 'border-gray-800 bg-[#111827] hover:border-cyan-500/40'
                  : 'border-gray-800/60 bg-gray-950/40 opacity-60'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="rounded bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-bold text-cyan-400 uppercase">
                    {rule.triggerMetric.toUpperCase()} TRIGGER
                  </span>
                  <button
                    onClick={() => handleToggle(rule.id)}
                    className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-colors ${
                      isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {isActive ? <Play className="h-2.5 w-2.5" /> : <Pause className="h-2.5 w-2.5" />}
                    <span>{isActive ? 'ACTIVE' : 'PAUSED'}</span>
                  </button>
                </div>

                <h3 className="text-sm font-bold text-white">{rule.name}</h3>
                <p className="text-xs text-gray-300 leading-relaxed">{rule.description}</p>
              </div>

              <div className="rounded-xl border border-gray-800/80 bg-gray-950/60 p-3 text-xs space-y-1 font-mono text-gray-400">
                <div className="flex justify-between text-[11px]">
                  <span>Condition</span>
                  <span className="text-cyan-400 font-bold">
                    {rule.triggerMetric} {rule.operator} {rule.threshold} (for {rule.durationMinutes}m)
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Action Execution</span>
                  <span className="text-emerald-400 font-bold">
                    {rule.autoExecute ? 'Autonomous (Zero Touch)' : 'Human Approval Required'}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] pt-1 border-t border-gray-800">
                  <span>Executions Count</span>
                  <span className="text-white font-bold">{rule.executionCount} times</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] text-gray-500">
                  Last ran: {rule.lastExecutedAt || 'Never'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRunNow(rule.id)}
                    className="rounded-lg bg-cyan-600 px-3 py-1 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors"
                  >
                    Execute Now
                  </button>
                  <button
                    onClick={() => onOpenCopilotWithPrompt(`Explain how rule "${rule.name}" prevents outages`)}
                    className="rounded-lg border border-gray-700 bg-gray-800 px-2.5 py-1 text-xs text-gray-300 hover:text-white"
                  >
                    Details
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
