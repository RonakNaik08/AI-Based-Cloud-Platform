'use client';

import React, { useState } from 'react';
import {
  History,
  Download,
  Search,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { AuditLogEntry } from '@/lib/types';

interface AuditLogsModuleProps {
  logs: AuditLogEntry[];
}

export const AuditLogsModule: React.FC<AuditLogsModuleProps> = ({ logs }) => {
  const [actorFilter, setActorFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = logs.filter((log) => {
    if (actorFilter !== 'all' && log.actorType !== actorFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.actor.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.targetResource.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Actor', 'Action', 'TargetResource', 'Status', 'Details'];
    const rows = filteredLogs.map((l) => [
      l.timestamp,
      `"${l.actor}"`,
      l.action,
      `"${l.targetResource}"`,
      l.status,
      `"${l.details.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <History className="h-4 w-4 text-cyan-400" />
            Audit Logs ({logs.length})
          </h2>
          <p className="text-xs text-gray-400">
            Immutable log of operations executed by users, AI Copilot, and automated scaling
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 rounded-xl border border-gray-800 bg-[#111827] p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-800 bg-gray-900 pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <div>
          <select
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            className="w-full rounded-lg border border-gray-800 bg-gray-900 px-2.5 py-1.5 text-xs text-gray-300 focus:border-cyan-500 focus:outline-none"
          >
            <option value="all">All Actors</option>
            <option value="user">Human Operators</option>
            <option value="ai_copilot">AI Copilot</option>
            <option value="auto_scaler">AutoScaler</option>
            <option value="system">System</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-800 bg-[#111827]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-800 bg-gray-900 text-gray-400 font-semibold">
              <tr>
                <th className="px-4 py-2.5">Time</th>
                <th className="px-4 py-2.5">Actor</th>
                <th className="px-4 py-2.5">Action</th>
                <th className="px-4 py-2.5">Target</th>
                <th className="px-4 py-2.5">Details</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-900/60 transition-colors">
                  <td className="px-4 py-2.5 text-gray-400 font-mono text-[11px] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-2.5 font-medium text-white">{log.actor}</td>
                  <td className="px-4 py-2.5 font-mono text-cyan-400 font-semibold">{log.action}</td>
                  <td className="px-4 py-2.5 text-gray-300">{log.targetResource}</td>
                  <td className="px-4 py-2.5 text-gray-400 max-w-xs truncate">{log.details}</td>
                  <td className="px-4 py-2.5">
                    {log.status === 'success' ? (
                      <span className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> OK
                      </span>
                    ) : (
                      <span className="text-rose-400 font-semibold text-[11px] flex items-center gap-1">
                        <XCircle className="h-3 w-3" /> {log.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
