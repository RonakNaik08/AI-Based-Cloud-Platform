'use client';

import React, { useState } from 'react';
import {
  DollarSign,
  TrendingDown,
  Sparkles,
} from 'lucide-react';
import { CostInsight, CloudResource } from '@/lib/types';

interface CostOptimizationModuleProps {
  insights: CostInsight[];
  resources: CloudResource[];
  totalMonthlySavings: number;
  onApplyOptimization: (insight: CostInsight) => void;
  onOpenCopilotWithPrompt: (prompt: string) => void;
}

export const CostOptimizationModule: React.FC<CostOptimizationModuleProps> = ({
  insights,
  resources,
  totalMonthlySavings,
  onApplyOptimization,
  onOpenCopilotWithPrompt,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const totalSpend = resources.reduce((sum, r) => sum + r.monthlyCost, 0);
  const filteredInsights = insights.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-400" />
            Cost Optimization & Waste Reduction
          </h2>
          <p className="text-xs text-gray-400">
            Automated discovery of idle compute, unattached EBS storage, and rightsizing opportunities
          </p>
        </div>

        <button
          onClick={() =>
            onOpenCopilotWithPrompt(
              'Generate a FinOps cloud spend reduction summary'
            )
          }
          className="flex items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:text-white transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Ask FinOps Copilot</span>
        </button>
      </div>

      {/* Summary Banner */}
      <div className="rounded-xl border border-gray-800 bg-[#111827] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-gray-400 font-medium">Potential Monthly Savings</span>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">
            ${totalMonthlySavings.toFixed(2)}/mo
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Current Spend: ${totalSpend.toFixed(0)} &bull; Projected Spend: ${(totalSpend - totalMonthlySavings).toFixed(0)}
          </p>
        </div>

        <button
          onClick={() => onApplyOptimization(insights[0])}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
        >
          Apply Top Savings Plan (${insights[0]?.monthlySavings.toFixed(2)}/mo)
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-gray-800 pb-2">
        {[
          { id: 'all', label: 'All Opportunities', count: insights.length },
          { id: 'idle_compute', label: 'Idle Compute', count: insights.filter((i) => i.category === 'idle_compute').length },
          { id: 'rightsizing', label: 'Rightsizing', count: insights.filter((i) => i.category === 'rightsizing').length },
          { id: 'unattached_storage', label: 'Unattached EBS', count: insights.filter((i) => i.category === 'unattached_storage').length },
          { id: 's3_tiering', label: 'S3 Tiering', count: insights.filter((i) => i.category === 's3_tiering').length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id)}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
              selectedCategory === tab.id
                ? 'bg-gray-800 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Insights Cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {filteredInsights.map((insight) => (
          <div
            key={insight.id}
            className="rounded-xl border border-gray-800 bg-[#111827] p-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded bg-emerald-950 px-2 py-0.5 text-[11px] font-bold text-emerald-400">
                  Save ${insight.monthlySavings.toFixed(2)}/mo
                </span>
                <span className="text-[11px] text-gray-500">{insight.impact.toUpperCase()} IMPACT</span>
              </div>

              <h3 className="mt-2 text-xs font-bold text-white">{insight.title}</h3>
              <p className="mt-1 text-xs text-gray-300">{insight.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between">
              <span className="text-xs text-gray-400">Target: <strong className="text-white">{insight.resourceName}</strong></span>
              <button
                onClick={() => onApplyOptimization(insight)}
                className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
              >
                Execute
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
