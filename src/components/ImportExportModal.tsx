'use client';

import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  Copy,
  Layers,
} from 'lucide-react';
import { CloudResource } from '@/lib/types';
import { starterSampleResources } from '@/lib/cloudData';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  resources: CloudResource[];
  onImportResources: (imported: CloudResource[]) => void;
  onClearAllResources: () => void;
  onLoadSampleFleet: () => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  resources,
  onImportResources,
  onClearAllResources,
  onLoadSampleFleet,
}) => {
  const [jsonText, setJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'import' | 'export' | 'manage'>('import');

  if (!isOpen) return null;

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const items: any[] = Array.isArray(parsed) ? parsed : [parsed];

      const validResources: CloudResource[] = items.map((item, idx) => ({
        id: item.id || `res-${Date.now().toString(36)}-${idx}`,
        name: item.name || `custom-resource-${idx + 1}`,
        type: item.type || 'ec2',
        provider: item.provider || 'aws',
        region: item.region || 'us-east-1',
        status: item.status || 'running',
        instanceType: item.instanceType || 't3.medium',
        ipAddress: item.ipAddress || `10.0.1.${idx + 10}`,
        cpuUtilization: Number(item.cpuUtilization) || 35.0,
        memoryUtilization: Number(item.memoryUtilization) || 45.0,
        diskUtilization: Number(item.diskUtilization) || 40.0,
        costPerHour: Number(item.costPerHour) || 0.05,
        monthlyCost: Number(item.monthlyCost) || 36.00,
        launchTime: item.launchTime || new Date().toISOString(),
        tags: item.tags || { Source: 'User-Imported', ManagedBy: 'AI-CloudOps' },
        isLiveData: true,
        details: item.details || { stateReason: 'Imported by user' },
      }));

      onImportResources(validResources);
      setImportStatus({
        success: true,
        message: `Successfully imported ${validResources.length} cloud resource(s)!`,
      });
      setJsonText('');
      setTimeout(() => {
        onClose();
        setImportStatus(null);
      }, 1200);
    } catch (e: any) {
      setImportStatus({
        success: false,
        message: `Invalid JSON format: ${e.message}`,
      });
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(resources, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cloudops-resources-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonText(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-gray-800 bg-[#111827] p-5 space-y-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4.5 w-4.5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Manage User Cloud Data</h3>
              <p className="text-xs text-gray-400">Import inventory, export backups, or manage dataset</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-800 pb-2">
          <button
            onClick={() => setActiveTab('import')}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
              activeTab === 'import' ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/40' : 'text-gray-400 hover:text-white'
            }`}
          >
            Import JSON / CSV
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
              activeTab === 'export' ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/40' : 'text-gray-400 hover:text-white'
            }`}
          >
            Export Backup ({resources.length})
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
              activeTab === 'manage' ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/40' : 'text-gray-400 hover:text-white'
            }`}
          >
            Presets & Clear
          </button>
        </div>

        {/* Tab 1: Import */}
        {activeTab === 'import' && (
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <label className="text-gray-300 font-medium">Paste JSON or Upload File</label>
              <label className="cursor-pointer text-cyan-400 hover:underline flex items-center gap-1 font-semibold text-[11px]">
                <Upload className="h-3 w-3" />
                <span>Upload .json file</span>
                <input type="file" accept=".json,.txt" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            <textarea
              rows={6}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder={`[\n  {\n    "name": "my-custom-ec2",\n    "type": "ec2",\n    "provider": "aws",\n    "region": "us-east-1",\n    "cpuUtilization": 45.2,\n    "monthlyCost": 35.00\n  }\n]`}
              className="w-full rounded-xl border border-gray-800 bg-gray-950 p-3 font-mono text-[11px] text-gray-200 placeholder-gray-600 focus:border-cyan-500 focus:outline-none"
            />

            {importStatus && (
              <div
                className={`flex items-center gap-2 rounded-lg p-2.5 text-xs ${
                  importStatus.success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                }`}
              >
                {importStatus.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <span>{importStatus.message}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleImportJson}
                disabled={!jsonText.trim()}
                className="rounded-lg bg-cyan-600 px-4 py-2 font-semibold text-white hover:bg-cyan-500 disabled:opacity-50 transition-colors shadow-sm"
              >
                Import to Fleet
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Export */}
        {activeTab === 'export' && (
          <div className="space-y-3 text-xs">
            <p className="text-gray-400">
              Download your current active cloud resources inventory ({resources.length} items) as a standardized JSON format.
            </p>

            <div className="rounded-xl border border-gray-800 bg-gray-950 p-3 font-mono text-[11px] text-gray-300 max-h-48 overflow-y-auto">
              <pre>{JSON.stringify(resources.slice(0, 3), null, 2)}</pre>
              {resources.length > 3 && <div className="text-gray-500 pt-1">... and {resources.length - 3} more resources</div>}
            </div>

            <button
              type="button"
              onClick={handleExportJson}
              disabled={resources.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-600 py-2.5 font-semibold text-white hover:bg-cyan-500 disabled:opacity-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download JSON Inventory ({resources.length} items)</span>
            </button>
          </div>
        )}

        {/* Tab 3: Presets & Clear */}
        {activeTab === 'manage' && (
          <div className="space-y-3 text-xs">
            <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-3.5 space-y-2">
              <div className="flex items-center gap-2 text-white font-bold">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <span>Load Sample Fleet (Demo Preset)</span>
              </div>
              <p className="text-gray-400 text-[11px]">
                Pre-load 18 sample multi-cloud resources across AWS, Azure, and GCP for instant testing.
              </p>
              <button
                type="button"
                onClick={() => {
                  onLoadSampleFleet();
                  onClose();
                }}
                className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 font-medium text-cyan-400 hover:text-white hover:bg-gray-700 transition-colors"
              >
                Load Sample Multi-Cloud Fleet
              </button>
            </div>

            <div className="rounded-xl border border-rose-900/40 bg-rose-950/20 p-3.5 space-y-2">
              <div className="flex items-center gap-2 text-rose-300 font-bold">
                <Trash2 className="h-4 w-4 text-rose-400" />
                <span>Clear All Cloud Resources (Blank State)</span>
              </div>
              <p className="text-rose-400/80 text-[11px]">
                Wipes all active resources so you can enter and manage purely your own live infrastructure from scratch.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClearAllResources();
                  onClose();
                }}
                className="rounded-lg bg-rose-600 px-3 py-1.5 font-medium text-white hover:bg-rose-500 transition-colors"
              >
                Clear All Resources (Start Fresh)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
