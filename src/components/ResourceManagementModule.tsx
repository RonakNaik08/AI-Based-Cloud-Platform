'use client';

import React, { useState } from 'react';
import {
  Server,
  Search,
  Play,
  Square,
  ExternalLink,
  Plus,
  Radio,
  RefreshCw,
  X,
  CheckCircle2,
  Trash2,
  Edit2,
  Upload,
  Download,
  Database,
  Layers,
  Sparkles,
} from 'lucide-react';
import { CloudResource, ResourceStatus, DataSourceMode, CloudProvider, ResourceType } from '@/lib/types';

interface ResourceManagementModuleProps {
  resources: CloudResource[];
  dataSourceMode?: DataSourceMode;
  onSelectResource: (resource: CloudResource) => void;
  onRequestAction: (actionType: string, resource: CloudResource, params?: any) => void;
  onAddCustomResource?: (resource: CloudResource) => void;
  onUpdateResource?: (id: string, updates: Partial<CloudResource>) => void;
  onDeleteResource?: (id: string) => void;
  onOpenImportExport?: () => void;
  onOpenCloudLogin?: () => void;
  onLoadSampleFleet?: () => void;
}

export const ResourceManagementModule: React.FC<ResourceManagementModuleProps> = ({
  resources,
  dataSourceMode = 'live',
  onSelectResource,
  onRequestAction,
  onAddCustomResource,
  onUpdateResource,
  onDeleteResource,
  onOpenImportExport,
  onOpenCloudLogin,
  onLoadSampleFleet,
}) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<CloudResource | null>(null);

  // New Resource Form State
  const [newResName, setNewResName] = useState('');
  const [newResProvider, setNewResProvider] = useState<CloudProvider>('aws');
  const [newResType, setNewResType] = useState<ResourceType>('ec2');
  const [newResRegion, setNewResRegion] = useState('us-east-1');
  const [newResInstanceType, setNewResInstanceType] = useState('t3.medium');
  const [newResCpu, setNewResCpu] = useState('42.0');
  const [newResMemory, setNewResMemory] = useState('55.0');
  const [newResCost, setNewResCost] = useState('35.00');

  const filteredResources = resources.filter((res) => {
    if (selectedType !== 'all' && res.type !== selectedType) return false;
    if (statusFilter !== 'all' && res.status !== statusFilter) return false;
    if (regionFilter !== 'all' && res.region !== regionFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        res.name.toLowerCase().includes(q) ||
        res.id.toLowerCase().includes(q) ||
        res.type.toLowerCase().includes(q) ||
        (res.instanceType && res.instanceType.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getStatusBadge = (status: ResourceStatus, cpu: number) => {
    if (status === 'running') {
      if (cpu > 80) {
        return (
          <span className="inline-flex items-center gap-1 rounded bg-rose-950/80 text-rose-400 px-2 py-0.5 text-[11px] font-semibold border border-rose-800">
            High CPU ({cpu}%)
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 rounded bg-emerald-950/80 text-emerald-400 px-2 py-0.5 text-[11px] font-semibold border border-emerald-800">
          Running
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded bg-gray-800 text-gray-400 px-2 py-0.5 text-[11px] font-semibold">
        Stopped / Idle
      </span>
    );
  };

  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResName) return;

    const created: CloudResource = {
      id: `${newResProvider === 'aws' ? 'i-' : newResProvider === 'azure' ? 'vm-' : 'gce-'}${Math.random().toString(36).substring(2, 10)}`,
      name: newResName,
      type: newResType,
      provider: newResProvider,
      region: newResRegion as any,
      status: 'running',
      instanceType: newResInstanceType,
      ipAddress: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      cpuUtilization: Number(newResCpu) || 35.0,
      memoryUtilization: Number(newResMemory) || 50.0,
      costPerHour: Number(newResCost) / 720,
      monthlyCost: Number(newResCost),
      launchTime: new Date().toISOString(),
      tags: { Environment: 'production', ManagedBy: 'AI-CloudOps', EnteredBy: 'User' },
      isLiveData: true,
      details: {
        stateReason: 'User registered asset',
        storageGb: 80,
      },
    };

    if (onAddCustomResource) {
      onAddCustomResource(created);
    }
    setIsAddModalOpen(false);
    setNewResName('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResource || !onUpdateResource) return;

    onUpdateResource(editingResource.id, {
      name: editingResource.name,
      instanceType: editingResource.instanceType,
      region: editingResource.region,
      cpuUtilization: editingResource.cpuUtilization,
      memoryUtilization: editingResource.memoryUtilization,
      monthlyCost: editingResource.monthlyCost,
      costPerHour: editingResource.monthlyCost / 720,
    });
    setEditingResource(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Server className="h-4 w-4 text-cyan-400" />
            User Cloud Resources ({resources.length})
            {dataSourceMode === 'live' && (
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                LIVE STREAM ACTIVE
              </span>
            )}
          </h2>
          <p className="text-xs text-gray-400">
            Manage your compute, databases, storage, and serverless resources
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenImportExport}
            className="flex items-center gap-1.5 rounded-lg border border-gray-800 bg-gray-900 px-3 py-1.5 text-xs text-gray-300 hover:border-gray-700 hover:text-white transition-colors"
            title="Import or Export Resource JSON"
          >
            <Upload className="h-3.5 w-3.5 text-cyan-400" />
            <span>Import / Export</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Resource</span>
          </button>
        </div>
      </div>

      {/* If 0 resources, display clean interactive onboarding state */}
      {resources.length === 0 ? (
        <div className="rounded-2xl border border-gray-800 bg-[#111827] p-8 sm:p-12 text-center space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-500/10">
            <Layers className="h-7 w-7" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-base font-bold text-white">No Cloud Resources Registered Yet</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              AI CloudOps is set up to work strictly on your data. Add your cloud assets, connect your cloud credentials (AWS / Azure / GCP), or import your JSON inventory.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-cyan-500 transition-colors shadow-md shadow-cyan-600/20"
            >
              <Plus className="h-4 w-4" />
              <span>Add First Cloud Resource</span>
            </button>

            {onOpenCloudLogin && (
              <button
                onClick={onOpenCloudLogin}
                className="flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-800 px-4 py-2.5 text-xs font-semibold text-gray-200 hover:text-white hover:bg-gray-700 transition-colors"
              >
                <span>Connect Cloud (AWS / Azure / GCP)</span>
              </button>
            )}

            {onOpenImportExport && (
              <button
                onClick={onOpenImportExport}
                className="flex items-center gap-2 rounded-xl border border-gray-800 bg-gray-900 px-4 py-2.5 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
              >
                <Upload className="h-4 w-4 text-cyan-400" />
                <span>Import JSON / CSV</span>
              </button>
            )}

            {onLoadSampleFleet && (
              <button
                onClick={onLoadSampleFleet}
                className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition-colors"
              >
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>Load Sample Fleet (Demo)</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Filter Tabs */}
          <div className="rounded-xl border border-gray-800 bg-[#111827] p-3 space-y-3">
            {/* Type Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 border-b border-gray-800 pb-2.5">
              {[
                { id: 'all', label: 'All', count: resources.length },
                { id: 'ec2', label: 'EC2', count: resources.filter((r) => r.type === 'ec2').length },
                { id: 'azure_vm', label: 'Azure VM', count: resources.filter((r) => r.type === 'azure_vm').length },
                { id: 'gcp_vm', label: 'GCP Compute', count: resources.filter((r) => r.type === 'gcp_vm').length },
                { id: 'rds', label: 'RDS/Database', count: resources.filter((r) => r.type === 'rds' || r.type === 'azure_sql' || r.type === 'gcp_sql').length },
                { id: 's3', label: 'S3/Storage', count: resources.filter((r) => r.type === 's3' || r.type === 'azure_blob' || r.type === 'gcp_storage').length },
                { id: 'ebs', label: 'EBS Disks', count: resources.filter((r) => r.type === 'ebs').length },
                { id: 'lambda', label: 'Serverless', count: resources.filter((r) => r.type === 'lambda' || r.type === 'azure_func').length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedType(tab.id)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                    selectedType === tab.id
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {/* Search & Region */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              <div className="relative sm:col-span-2">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search resource name, ID, or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-800 bg-gray-900 pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-800 bg-gray-900 px-2.5 py-1.5 text-xs text-gray-300 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="all">All Regions</option>
                  <option value="us-east-1">us-east-1</option>
                  <option value="us-west-2">us-west-2</option>
                  <option value="eastus">eastus</option>
                  <option value="us-central1">us-central1</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-gray-800 bg-[#111827]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-gray-800 bg-gray-900 text-gray-400 font-semibold">
                  <tr>
                    <th className="px-4 py-2.5">Name / ID</th>
                    <th className="px-4 py-2.5">Provider</th>
                    <th className="px-4 py-2.5">Type & Spec</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Region</th>
                    <th className="px-4 py-2.5">CPU Load</th>
                    <th className="px-4 py-2.5">Cost/mo</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredResources.map((res) => (
                    <tr
                      key={res.id}
                      className="hover:bg-gray-900/60 transition-colors cursor-pointer"
                      onClick={() => onSelectResource(res)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-white">{res.name}</p>
                          {dataSourceMode === 'live' && (
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" title="Live Telemetry Stream Active" />
                          )}
                        </div>
                        <p className="text-[10px] font-mono text-gray-500">{res.id}</p>
                      </td>

                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          res.provider === 'aws' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                          res.provider === 'azure' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' :
                          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {res.provider}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-gray-300 font-mono">
                        {res.instanceType || res.details.engine || res.type.toUpperCase()}
                      </td>

                      <td className="px-4 py-3">{getStatusBadge(res.status, res.cpuUtilization)}</td>

                      <td className="px-4 py-3 text-gray-400">{res.region}</td>

                      <td className="px-4 py-3">
                        {res.type === 'ec2' || res.type === 'azure_vm' || res.type === 'gcp_vm' || res.type === 'k8s_pod' ? (
                          <div className="flex items-center gap-2">
                            <span className={`font-mono ${res.cpuUtilization > 80 ? 'text-rose-400 font-bold' : 'text-gray-300'}`}>
                              {res.cpuUtilization}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>

                      <td className="px-4 py-3 font-mono font-medium text-gray-200">
                        ${res.monthlyCost.toFixed(2)}
                      </td>

                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Resource */}
                          <button
                            onClick={() => setEditingResource(res)}
                            className="rounded border border-gray-700 bg-gray-800 p-1 text-gray-400 hover:text-cyan-400"
                            title="Edit Resource"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          {/* Delete Resource */}
                          {onDeleteResource && (
                            <button
                              onClick={() => onDeleteResource(res.id)}
                              className="rounded border border-gray-700 bg-gray-800 p-1 text-gray-400 hover:text-rose-400"
                              title="Delete Resource"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {res.status === 'running' ? (
                            <button
                              onClick={() => onRequestAction('stop_instance', res)}
                              className="rounded border border-gray-700 bg-gray-800 p-1 text-gray-400 hover:text-rose-400"
                              title="Stop"
                            >
                              <Square className="h-3.5 w-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => onRequestAction('start_instance', res)}
                              className="rounded border border-gray-700 bg-gray-800 p-1 text-gray-400 hover:text-emerald-400"
                              title="Start"
                            >
                              <Play className="h-3.5 w-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => onSelectResource(res)}
                            className="rounded border border-gray-700 bg-gray-800 p-1 text-gray-400 hover:text-white"
                            title="Details"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal: Add Custom User Resource */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-[#111827] p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Add Cloud Resource</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateResource} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-medium mb-1">Resource Name</label>
                <input
                  type="text"
                  required
                  value={newResName}
                  onChange={(e) => setNewResName(e.target.value)}
                  placeholder="e.g. prod-api-server-01"
                  className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-1.5 text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Provider</label>
                  <select
                    value={newResProvider}
                    onChange={(e) => setNewResProvider(e.target.value as CloudProvider)}
                    className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-1.5 text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="aws">AWS</option>
                    <option value="azure">Azure</option>
                    <option value="gcp">GCP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Resource Type</label>
                  <select
                    value={newResType}
                    onChange={(e) => setNewResType(e.target.value as ResourceType)}
                    className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-1.5 text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="ec2">Compute (EC2 / VM)</option>
                    <option value="rds">Database (RDS / SQL)</option>
                    <option value="s3">Object Storage (S3 / Blob)</option>
                    <option value="ebs">Block Storage Disk</option>
                    <option value="lambda">Serverless Function</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Instance Spec</label>
                  <input
                    type="text"
                    value={newResInstanceType}
                    onChange={(e) => setNewResInstanceType(e.target.value)}
                    placeholder="t3.medium / Standard_D2s"
                    className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-1.5 text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Region</label>
                  <select
                    value={newResRegion}
                    onChange={(e) => setNewResRegion(e.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-1.5 text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="us-east-1">us-east-1</option>
                    <option value="us-west-2">us-west-2</option>
                    <option value="eastus">eastus</option>
                    <option value="us-central1">us-central1</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">CPU Load (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newResCpu}
                    onChange={(e) => setNewResCpu(e.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-1.5 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Memory (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newResMemory}
                    onChange={(e) => setNewResMemory(e.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-1.5 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Monthly Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newResCost}
                    onChange={(e) => setNewResCost(e.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-1.5 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-cyan-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500"
                >
                  Save Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Existing Resource */}
      {editingResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-[#111827] p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Edit Resource: {editingResource.name}</h3>
              </div>
              <button onClick={() => setEditingResource(null)} className="text-gray-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-medium mb-1">Resource Name</label>
                <input
                  type="text"
                  required
                  value={editingResource.name}
                  onChange={(e) => setEditingResource({ ...editingResource, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-1.5 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Instance Spec</label>
                  <input
                    type="text"
                    value={editingResource.instanceType || ''}
                    onChange={(e) => setEditingResource({ ...editingResource, instanceType: e.target.value })}
                    className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-1.5 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Region</label>
                  <input
                    type="text"
                    value={editingResource.region}
                    onChange={(e) => setEditingResource({ ...editingResource, region: e.target.value as any })}
                    className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-1.5 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">CPU Load (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingResource.cpuUtilization}
                    onChange={(e) => setEditingResource({ ...editingResource, cpuUtilization: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-1.5 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Memory (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingResource.memoryUtilization}
                    onChange={(e) => setEditingResource({ ...editingResource, memoryUtilization: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-1.5 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Monthly Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingResource.monthlyCost}
                    onChange={(e) => setEditingResource({ ...editingResource, monthlyCost: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-1.5 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingResource(null)}
                  className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-cyan-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
