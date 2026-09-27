'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Shield,
  KeyRound,
  FileCheck
} from 'lucide-react';
import { CloudResource, SecurityFinding, SecurityPostureScore } from '@/lib/types';
import { globalSecurityScanner } from '@/lib/securityScanner';

interface SecurityScannerModuleProps {
  resources: CloudResource[];
  onOpenCopilotWithPrompt: (prompt: string) => void;
}

export const SecurityScannerModule: React.FC<SecurityScannerModuleProps> = ({
  resources,
  onOpenCopilotWithPrompt,
}) => {
  const [findings, setFindings] = useState<SecurityFinding[]>([]);
  const [score, setScore] = useState<SecurityPostureScore>({
    overallScore: 92,
    grade: 'A',
    cisCompliancePct: 94,
    soc2CompliancePct: 88,
    criticalCount: 1,
    highCount: 1,
    mediumCount: 1,
    openCount: 3,
  });
  const [isScanning, setIsScanning] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    const res = globalSecurityScanner.scanFleet(resources);
    setFindings(res.findings);
    setScore(res.score);
  }, [resources]);

  const handleRescan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const res = globalSecurityScanner.scanFleet(resources);
      setFindings(res.findings);
      setScore(res.score);
      setIsScanning(false);
    }, 600);
  };

  const handleRemediate = (id: string) => {
    globalSecurityScanner.remediateFinding(id);
    const updated = globalSecurityScanner.getFindings();
    setFindings([...updated]);
    setScore(globalSecurityScanner.calculateScore(updated));
  };

  const filteredFindings = findings.filter((f) =>
    filterCategory === 'all' ? true : f.category === filterCategory
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            Cloud Security Posture & Compliance (CSPM)
          </h2>
          <p className="text-xs text-gray-400">
            CIS Cloud Benchmarks, public exposure audit, IAM MFA verification & 1-click remediation
          </p>
        </div>

        <button
          onClick={handleRescan}
          disabled={isScanning}
          className="flex items-center gap-1.5 rounded-lg border border-gray-800 bg-gray-900 px-3 py-1.5 text-xs text-gray-300 hover:border-gray-700 hover:text-white transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-cyan-400 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Auditing Fleet...' : 'Run Security Audit'}</span>
        </button>
      </div>

      {/* KPI Security Scorecards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-gray-800 bg-[#111827] p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-medium">Security Posture</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-white">{score.overallScore}</span>
              <span className="text-xs text-gray-400">/ 100</span>
            </div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/30 text-base">
            {score.grade}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-[#111827] p-4">
          <span className="text-xs text-gray-400 font-medium">CIS Benchmarks</span>
          <p className="mt-1 text-2xl font-bold text-emerald-400">{score.cisCompliancePct}%</p>
          <span className="text-[11px] text-gray-500">v3.0 Multi-Cloud Spec</span>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-[#111827] p-4">
          <span className="text-xs text-gray-400 font-medium">SOC 2 Type II</span>
          <p className="mt-1 text-2xl font-bold text-cyan-400">{score.soc2CompliancePct}%</p>
          <span className="text-[11px] text-gray-500">Trust Services Criteria</span>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-[#111827] p-4">
          <span className="text-xs text-gray-400 font-medium">Open Vulnerabilities</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold text-rose-400">{score.openCount}</span>
            {score.criticalCount > 0 && (
              <span className="rounded bg-rose-950 px-1.5 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-800">
                {score.criticalCount} Critical
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-800 pb-2 text-xs">
        {[
          { id: 'all', label: 'All Findings' },
          { id: 'network_ingress', label: 'Network & Ports' },
          { id: 'storage_exposure', label: 'Storage Exposure' },
          { id: 'disk_encryption', label: 'Disk Encryption' },
          { id: 'iam_auth', label: 'IAM & MFA' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterCategory(tab.id)}
            className={`rounded-lg px-3 py-1 font-semibold transition-colors ${
              filterCategory === tab.id ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/40' : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Findings List */}
      <div className="space-y-3">
        {filteredFindings.map((finding) => {
          const isRemediated = finding.status === 'remediated';
          const isCritical = finding.severity === 'critical';

          return (
            <div
              key={finding.id}
              className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                isRemediated
                  ? 'border-gray-800 bg-gray-900/30 opacity-60'
                  : isCritical
                  ? 'border-rose-900/60 bg-rose-950/20'
                  : 'border-amber-900/50 bg-amber-950/15'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    {isRemediated ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className={`h-4 w-4 ${isCritical ? 'text-rose-400' : 'text-amber-400'}`} />
                    )}
                    <h3 className={`text-sm font-bold ${isRemediated ? 'text-gray-400 line-through' : 'text-white'}`}>
                      {finding.title}
                    </h3>
                    <span
                      className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                        isCritical
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {finding.severity}
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 max-w-3xl leading-relaxed">{finding.description}</p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400 pt-1 font-mono">
                    <span className="text-cyan-400">{finding.cisBenchmark}</span>
                    <span>•</span>
                    <span>Resource: {finding.resourceName}</span>
                    <span>•</span>
                    <span className="uppercase">{finding.provider}</span>
                  </div>

                  <div className="rounded-xl border border-gray-800/80 bg-gray-950/60 p-2.5 text-xs text-gray-300 mt-2">
                    <span className="font-bold text-cyan-300 block mb-0.5">Remediation Steps:</span>
                    {finding.remediationAdvice}
                  </div>
                </div>

                <div className="flex sm:flex-col items-end gap-2 shrink-0">
                  {!isRemediated ? (
                    <button
                      onClick={() => handleRemediate(finding.id)}
                      className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors shadow-sm"
                    >
                      Apply 1-Click Fix
                    </button>
                  ) : (
                    <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-bold text-emerald-400">
                      Remediated
                    </span>
                  )}

                  <button
                    onClick={() => onOpenCopilotWithPrompt(`How do I remediate ${finding.title}?`)}
                    className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-gray-300 hover:text-white"
                  >
                    Ask Copilot
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
