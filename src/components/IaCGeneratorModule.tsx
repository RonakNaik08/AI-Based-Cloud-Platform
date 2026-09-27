'use client';

import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Download,
  CheckCircle2,
  Sparkles,
  Terminal,
  FileCode,
  Layers,
  FileCheck
} from 'lucide-react';
import { CloudResource } from '@/lib/types';
import { globalIaCGenerator } from '@/lib/iacGenerator';

interface IaCGeneratorModuleProps {
  resources: CloudResource[];
}

export const IaCGeneratorModule: React.FC<IaCGeneratorModuleProps> = ({ resources }) => {
  const [format, setFormat] = useState<'terraform' | 'cloudformation' | 'pulumi'>('terraform');
  const [copied, setCopied] = useState(false);

  const getCode = () => {
    if (format === 'terraform') return globalIaCGenerator.generateTerraform(resources);
    if (format === 'cloudformation') return globalIaCGenerator.generateCloudFormation(resources);
    return globalIaCGenerator.generatePulumi(resources);
  };

  const code = getCode();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = format === 'terraform' ? 'tf' : format === 'cloudformation' ? 'yaml' : 'ts';
    const filename = format === 'terraform' ? 'main.tf' : format === 'cloudformation' ? 'template.yaml' : 'index.ts';
    const dataStr = 'data:text/plain;charset=utf-8,' + encodeURIComponent(code);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Code2 className="h-4 w-4 text-cyan-400" />
            Infrastructure as Code (IaC) Generator
          </h2>
          <p className="text-xs text-gray-400">
            Convert active multi-cloud fleet into Terraform, AWS CloudFormation, or Pulumi
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Format Tabs */}
          <div className="flex items-center rounded-lg border border-gray-800 bg-gray-900 p-0.5 text-xs font-semibold">
            {[
              { id: 'terraform', label: 'Terraform (HCL)' },
              { id: 'cloudformation', label: 'CloudFormation (YAML)' },
              { id: 'pulumi', label: 'Pulumi (TS)' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFormat(f.id as any)}
                className={`rounded-md px-2.5 py-1 transition-colors ${
                  format === f.id ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-gray-800 bg-gray-900 px-3 py-1.5 text-xs text-gray-300 hover:border-gray-700 hover:text-white transition-colors"
          >
            {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Code'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Code Viewer */}
      <div className="rounded-2xl border border-gray-800 bg-gray-950 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-800 bg-[#0d121f] px-4 py-2.5 text-xs text-gray-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80 inline-block" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80 inline-block" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-500/80 inline-block" />
            <span className="ml-2 font-bold text-gray-300">
              {format === 'terraform' ? 'main.tf' : format === 'cloudformation' ? 'cloudformation-stack.yaml' : 'index.ts'}
            </span>
          </div>
          <span className="text-[11px] text-cyan-400">
            Exported from {resources.length} user cloud resources
          </span>
        </div>

        <pre className="p-4 sm:p-5 font-mono text-xs text-cyan-300/90 leading-relaxed overflow-x-auto max-h-[550px] overflow-y-auto">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};
