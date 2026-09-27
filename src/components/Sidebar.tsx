'use client';

import React from 'react';
import {
  LayoutDashboard,
  Server,
  Sparkles,
  Activity,
  DollarSign,
  PlayCircle,
  Bell,
  FileText,
  BookOpen,
  History,
  Layers,
  ShieldCheck,
  Zap,
  Boxes,
  GitCommit,
  Code2,
  Globe2,
  Send,
} from 'lucide-react';

export type ModuleTab =
  | 'dashboard'
  | 'topology'
  | 'resources'
  | 'copilot'
  | 'anomalies'
  | 'costs'
  | 'actions'
  | 'alerts'
  | 'self_healing'
  | 'k8s'
  | 'deployments'
  | 'security'
  | 'iac'
  | 'disaster_recovery'
  | 'integrations'
  | 'reports'
  | 'rag'
  | 'audit';

interface SidebarProps {
  activeTab: ModuleTab;
  setActiveTab: (tab: ModuleTab) => void;
  activeAnomaliesCount: number;
  activeAlertsCount: number;
  pendingActionsCount: number;
  totalMonthlySavings: number;
  resourceCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  activeAnomaliesCount,
  activeAlertsCount,
  pendingActionsCount,
  totalMonthlySavings,
  resourceCount = 0,
}) => {
  const sections = [
    {
      title: 'Cloud Core',
      items: [
        { id: 'dashboard' as ModuleTab, label: 'Dashboard', icon: LayoutDashboard, badge: null },
        { id: 'topology' as ModuleTab, label: 'Topology Map', icon: Layers, badge: 'New', badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' },
        { id: 'resources' as ModuleTab, label: 'Resources', icon: Server, badge: resourceCount > 0 ? `${resourceCount}` : null },
        { id: 'copilot' as ModuleTab, label: 'AI Copilot', icon: Sparkles, badge: null },
        {
          id: 'anomalies' as ModuleTab,
          label: 'Anomaly Detector',
          icon: Activity,
          badge: activeAnomaliesCount > 0 ? `${activeAnomaliesCount}` : null,
          badgeColor: 'bg-rose-950/60 text-rose-400 border border-rose-800',
        },
        {
          id: 'costs' as ModuleTab,
          label: 'FinOps Optimizer',
          icon: DollarSign,
          badge: totalMonthlySavings > 0 ? `$${totalMonthlySavings.toFixed(0)}/mo` : null,
          badgeColor: 'bg-emerald-950/60 text-emerald-400 border border-emerald-800',
        },
        {
          id: 'actions' as ModuleTab,
          label: 'Automated Actions',
          icon: PlayCircle,
          badge: pendingActionsCount > 0 ? `${pendingActionsCount}` : null,
          badgeColor: 'bg-amber-950/60 text-amber-400 border border-amber-800',
        },
        {
          id: 'alerts' as ModuleTab,
          label: 'Alerts',
          icon: Bell,
          badge: activeAlertsCount > 0 ? `${activeAlertsCount}` : null,
          badgeColor: 'bg-rose-950/60 text-rose-400 border border-rose-800',
        },
      ],
    },
    {
      title: 'SRE & Automation',
      items: [
        { id: 'self_healing' as ModuleTab, label: 'Self-Healing Engine', icon: Zap, badge: 'Active', badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' },
        { id: 'k8s' as ModuleTab, label: 'Kubernetes Cluster', icon: Boxes, badge: null },
        { id: 'deployments' as ModuleTab, label: 'CI/CD Deployments', icon: GitCommit, badge: null },
        { id: 'disaster_recovery' as ModuleTab, label: 'DR & Failover', icon: Globe2, badge: null },
      ],
    },
    {
      title: 'Security & Tools',
      items: [
        { id: 'security' as ModuleTab, label: 'Security & CSPM', icon: ShieldCheck, badge: 'CIS 94%', badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' },
        { id: 'iac' as ModuleTab, label: 'Terraform & IaC', icon: Code2, badge: null },
        { id: 'integrations' as ModuleTab, label: 'Webhooks & Slack', icon: Send, badge: null },
        { id: 'reports' as ModuleTab, label: 'Reports', icon: FileText, badge: null },
        { id: 'rag' as ModuleTab, label: 'Runbooks (RAG)', icon: BookOpen, badge: null },
        { id: 'audit' as ModuleTab, label: 'Audit Logs', icon: History, badge: null },
      ],
    },
  ];

  return (
    <aside className="w-56 shrink-0 border-r border-gray-800 bg-[#0e1424] p-3 flex flex-col justify-between hidden lg:flex overflow-y-auto">
      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
              {section.title}
            </div>
            <nav className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-gray-800 text-white font-semibold shadow-sm'
                        : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          isActive ? 'text-cyan-400' : 'text-gray-400'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`shrink-0 rounded-full px-1.5 py-0.2 text-[9px] font-semibold ${
                          item.badgeColor || 'bg-gray-800 text-gray-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Clean Footer Widget */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-2.5 text-xs space-y-1 mt-4">
        <div className="flex justify-between text-gray-400 text-[11px]">
          <span>Fleet Health</span>
          <span className="font-mono text-emerald-400 font-semibold">98.2%</span>
        </div>
        <div className="flex justify-between text-gray-400 text-[11px]">
          <span>Autonomous Guard</span>
          <span className="font-mono text-cyan-400 font-semibold">ENABLED</span>
        </div>
      </div>
    </aside>
  );
};
