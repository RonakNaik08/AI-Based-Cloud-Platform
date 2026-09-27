'use client';

import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Sparkles,
} from 'lucide-react';
import { InfrastructureReport } from '@/lib/types';

interface ReportsModuleProps {
  reports: InfrastructureReport[];
  onGenerateReport: (type: string) => void;
  onOpenCopilotWithPrompt: (prompt: string) => void;
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({
  reports,
  onGenerateReport,
}) => {
  const [selectedReport, setSelectedReport] = useState<InfrastructureReport>(reports[0]);

  const handleExportMarkdown = () => {
    if (!selectedReport) return;
    const content = `# ${selectedReport.title}
Generated: ${selectedReport.generatedAt}
Author: ${selectedReport.author}

## Executive Summary
${selectedReport.executiveSummary}

## Health & Reliability
- Health Score: ${selectedReport.healthScore}/100
- SLA Uptime: ${selectedReport.uptimePercentage}%
- 24h Spend: $${selectedReport.totalSpend.toFixed(2)}
- Potential Savings: $${selectedReport.potentialSavings.toFixed(2)}/mo

## Recommendations
${selectedReport.keyRecommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}
`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedReport.id}.md`;
    a.click();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="h-4 w-4 text-cyan-400" />
            Infrastructure Reports
          </h2>
          <p className="text-xs text-gray-400">
            Automated daily reliability digests and FinOps audits
          </p>
        </div>

        <button
          onClick={() => onGenerateReport('daily_digest')}
          className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Generate Report</span>
        </button>
      </div>

      {/* 2-Column Viewer */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Reports List */}
        <div className="space-y-2">
          {reports.map((rep) => {
            const isSelected = selectedReport?.id === rep.id;
            return (
              <div
                key={rep.id}
                onClick={() => setSelectedReport(rep)}
                className={`rounded-xl border p-3 cursor-pointer transition-colors ${
                  isSelected
                    ? 'border-cyan-500 bg-gray-900'
                    : 'border-gray-800 bg-[#111827] hover:bg-gray-900'
                }`}
              >
                <div className="flex justify-between text-[11px] text-gray-400">
                  <span className="font-semibold text-cyan-400 uppercase">{rep.type.replace('_', ' ')}</span>
                  <span>{new Date(rep.generatedAt).toLocaleDateString()}</span>
                </div>
                <h4 className="mt-1 text-xs font-semibold text-white">{rep.title}</h4>
                <p className="text-[11px] text-gray-400 line-clamp-2 mt-0.5">{rep.executiveSummary}</p>
              </div>
            );
          })}
        </div>

        {/* Document Viewer */}
        {selectedReport && (
          <div className="rounded-xl border border-gray-800 bg-[#111827] p-5 lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">{selectedReport.title}</h3>
                <p className="text-[11px] text-gray-400">Generated {new Date(selectedReport.generatedAt).toLocaleDateString()} by {selectedReport.author}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportMarkdown}
                  className="flex items-center gap-1 rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-300 hover:text-white"
                >
                  <Download className="h-3 w-3" />
                  Markdown
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1 rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-300 hover:text-white"
                >
                  <Printer className="h-3 w-3" />
                  Print
                </button>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-xs">
              <div className="rounded-lg bg-gray-900 p-2.5">
                <span className="text-gray-400">Health Score</span>
                <p className="text-lg font-bold text-white">{selectedReport.healthScore}%</p>
              </div>
              <div className="rounded-lg bg-gray-900 p-2.5">
                <span className="text-gray-400">SLA Uptime</span>
                <p className="text-lg font-bold text-emerald-400">{selectedReport.uptimePercentage}%</p>
              </div>
              <div className="rounded-lg bg-gray-900 p-2.5">
                <span className="text-gray-400">Savings</span>
                <p className="text-lg font-bold text-emerald-400 font-mono">${selectedReport.potentialSavings.toFixed(0)}/mo</p>
              </div>
              <div className="rounded-lg bg-gray-900 p-2.5">
                <span className="text-gray-400">Incidents</span>
                <p className="text-lg font-bold text-rose-400">{selectedReport.totalIncidents}</p>
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-lg bg-gray-900 p-3 text-xs space-y-1">
              <h4 className="font-semibold text-cyan-400">Executive Summary</h4>
              <p className="text-gray-300 leading-relaxed">{selectedReport.executiveSummary}</p>
            </div>

            {/* Recommendations */}
            <div className="space-y-1.5 text-xs">
              <h4 className="font-semibold text-gray-300">Recommendations</h4>
              {selectedReport.keyRecommendations.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-gray-300">
                  <span className="text-cyan-400 font-bold">{i + 1}.</span>
                  <p>{r}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
