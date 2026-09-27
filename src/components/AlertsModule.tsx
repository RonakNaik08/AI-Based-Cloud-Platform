'use client';

import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import { CloudAlert, AlertSeverity } from '@/lib/types';

interface AlertsModuleProps {
  alerts: CloudAlert[];
  onAcknowledgeAlert: (id: string) => void;
  onResolveAlert: (id: string) => void;
  onOpenCopilotWithPrompt: (prompt: string) => void;
}

export const AlertsModule: React.FC<AlertsModuleProps> = ({
  alerts,
  onResolveAlert,
  onOpenCopilotWithPrompt,
}) => {
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter === 'all') return true;
    return a.severity === severityFilter;
  });

  const activeAlertsCount = alerts.filter((a) => a.status === 'active').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Bell className="h-4 w-4 text-rose-400" />
            Active Alerts ({activeAlertsCount})
          </h2>
          <p className="text-xs text-gray-400">
            Real-time threshold triggers and CloudWatch alarm states
          </p>
        </div>

        <button
          onClick={() => onOpenCopilotWithPrompt('Triage all active alerts and provide an incident summary')}
          className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 transition-colors"
        >
          AI Incident Triage
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-800 pb-2">
        {(['all', 'critical', 'high', 'medium', 'low'] as const).map((sev) => (
          <button
            key={sev}
            onClick={() => setSeverityFilter(sev)}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium uppercase transition-colors ${
              severityFilter === sev
                ? 'bg-gray-800 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {sev} ({sev === 'all' ? alerts.length : alerts.filter((a) => a.severity === sev).length})
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const isResolved = alert.status === 'resolved';

          return (
            <div
              key={alert.id}
              className={`rounded-xl border border-gray-800 bg-[#111827] p-4 flex flex-col lg:flex-row lg:items-start justify-between gap-3 ${
                isResolved ? 'opacity-60' : ''
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded px-1.5 py-0.2 text-[10px] font-bold uppercase ${
                      alert.severity === 'critical' ? 'bg-rose-950 text-rose-400' : 'bg-amber-950 text-amber-400'
                    }`}
                  >
                    {alert.severity}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    Resource: <strong className="text-white">{alert.resourceName}</strong>
                  </span>
                  <span className="text-[11px] text-gray-500">
                    {alert.triggeredMetric} is {alert.currentValue}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-white">{alert.title}</h3>
                <p className="text-xs text-gray-300">{alert.description}</p>
                {alert.aiRootCause && (
                  <p className="text-[11px] text-cyan-300">
                    AI Analysis: {alert.aiRootCause}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!isResolved ? (
                  <>
                    <button
                      onClick={() =>
                        onOpenCopilotWithPrompt(
                          `How do I resolve alert ${alert.id} (${alert.title}) on ${alert.resourceName}?`
                        )
                      }
                      className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500"
                    >
                      Investigate
                    </button>
                    <button
                      onClick={() => onResolveAlert(alert.id)}
                      className="rounded-lg border border-gray-700 bg-gray-800 px-2.5 py-1.5 text-xs text-gray-300 hover:text-white"
                    >
                      Resolve
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Resolved
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
