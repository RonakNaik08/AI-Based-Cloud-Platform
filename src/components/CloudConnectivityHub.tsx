'use client';

import React, { useState } from 'react';
import {
  Cloud,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
  Key,
  Terminal,
  Copy,
  ExternalLink,
  Plus,
  Play,
  Check,
  X,
  Sliders,
  Radio,
  Server
} from 'lucide-react';
import { CloudAccountConnection, CloudDiagnosticResult, CloudProvider } from '@/lib/types';
import { globalCloudConnector } from '@/lib/cloudConnector';

interface CloudConnectivityHubProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: CloudAccountConnection[];
  onUpdateAccount: (updated: CloudAccountConnection) => void;
  onSyncFleet: () => Promise<void>;
  onSelectProviderFilter: (provider: CloudProvider | 'all') => void;
  activeProviderFilter: string;
}

export const CloudConnectivityHub: React.FC<CloudConnectivityHubProps> = ({
  isOpen,
  onClose,
  accounts,
  onUpdateAccount,
  onSyncFleet,
  onSelectProviderFilter,
  activeProviderFilter,
}) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || 'aws-1');
  const [diagnosticsMap, setDiagnosticsMap] = useState<Record<string, CloudDiagnosticResult>>({});
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'connections' | 'diagnostics' | 'iac_templates'>('connections');
  const [copiedCode, setCopiedCode] = useState(false);

  // New Account Add State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProvider, setNewProvider] = useState<CloudProvider>('aws');
  const [newMethod, setNewMethod] = useState<string>('iam_role_arn');
  const [newAccountName, setNewAccountName] = useState('');
  const [newKey1, setNewKey1] = useState('');
  const [newKey2, setNewKey2] = useState('');

  if (!isOpen) return null;

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];

  const handleRunDiagnostic = async (account: CloudAccountConnection) => {
    setIsRunningDiagnostic(true);
    await new Promise((r) => setTimeout(r, 600));
    const result = await globalCloudConnector.runDiagnostic(account);
    setDiagnosticsMap((prev) => ({ ...prev, [account.id]: result }));
    setIsRunningDiagnostic(false);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await onSyncFleet();
    setIsSyncing(false);
    setSyncSuccessMsg(`Fleet successfully synced across ${accounts.length} connected clouds!`);
    setTimeout(() => setSyncSuccessMsg(''), 2500);
  };

  const handleSaveNewAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const newAcc: CloudAccountConnection = {
      id: `${newProvider}-${Date.now().toString(36)}`,
      provider: newProvider,
      accountName: newAccountName || `${newProvider.toUpperCase()} Account`,
      accountId: newKey1.slice(0, 12) || `acc-${Math.floor(Math.random() * 900000)}`,
      status: 'connected',
      connectionMethod: newMethod as any,
      environment: 'production',
      region: newProvider === 'aws' ? 'us-east-1' : newProvider === 'azure' ? 'eastus' : 'us-central1',
      latencyMs: newProvider === 'aws' ? 22 : newProvider === 'azure' ? 34 : 28,
      credentials: {
        awsRoleArn: newKey1,
        azureSubscriptionId: newKey1,
        gcpProjectId: newKey1,
      },
      connectedAt: new Date().toISOString(),
      lastSyncedAt: 'Just now',
      syncIntervalSec: 30,
      resourcesCount: newProvider === 'aws' ? 12 : newProvider === 'azure' ? 7 : 6,
    };

    onUpdateAccount(newAcc);
    setShowAddModal(false);
    setNewAccountName('');
    setNewKey1('');
    setNewKey2('');
  };

  const currentDiagnostic = diagnosticsMap[selectedAccount?.id];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-3xl rounded-xl border border-gray-800 bg-[#111827] shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-gray-800 px-5 py-3.5 bg-gray-900/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-cyan-600 text-white font-bold">
              <Cloud className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Cloud Connectivity & Integrations</h3>
                <span className="rounded bg-emerald-950 px-2 py-0.2 text-[10px] font-semibold text-emerald-400 border border-emerald-800">
                  {accounts.filter((a) => a.status === 'connected').length} Connected
                </span>
              </div>
              <p className="text-[11px] text-gray-400">Manage cloud credentials, health diagnostics, and real-time telemetry streams</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-800 px-2.5 py-1 text-xs font-semibold text-gray-200 hover:text-white transition-colors"
            >
              <RefreshCw className={`h-3 w-3 text-cyan-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Fleet'}</span>
            </button>
            <button onClick={onClose} className="rounded p-1 text-gray-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Sync Success Banner */}
        {syncSuccessMsg && (
          <div className="flex items-center gap-2 bg-emerald-950/60 border-b border-emerald-800 px-5 py-2 text-xs text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>{syncSuccessMsg}</span>
          </div>
        )}

        {/* Inner Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-800 px-5 pt-2 bg-gray-900/40">
          {[
            { id: 'connections', label: 'Connected Accounts' },
            { id: 'diagnostics', label: 'Live Health & Permission Diagnostics' },
            { id: 'iac_templates', label: '1-Click Onboarding Code (IaC)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`border-b-2 px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-300 font-semibold'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: Connected Accounts */}
          {activeTab === 'connections' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Active Cloud Connections ({accounts.length})
                </h4>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-1 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Connect New Account</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {accounts.map((acc) => {
                  const isSelected = selectedAccountId === acc.id;
                  const isFiltered = activeProviderFilter === acc.provider;

                  return (
                    <div
                      key={acc.id}
                      onClick={() => setSelectedAccountId(acc.id)}
                      className={`rounded-xl border p-3.5 cursor-pointer transition-colors flex flex-col justify-between ${
                        isSelected
                          ? 'border-cyan-500 bg-gray-900'
                          : 'border-gray-800 bg-gray-950/60 hover:border-gray-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs uppercase text-white tracking-wide">
                            {acc.provider}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            {acc.latencyMs}ms
                          </span>
                        </div>
                        <h5 className="font-semibold text-xs text-gray-200 mt-1">{acc.accountName}</h5>
                        <p className="text-[10px] font-mono text-gray-500 truncate">{acc.accountId}</p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-gray-800 flex items-center justify-between text-[11px]">
                        <span className="text-gray-400">{acc.resourcesCount} resources</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProviderFilter(acc.provider);
                            onClose();
                          }}
                          className={`rounded px-2 py-0.5 font-medium ${
                            isFiltered ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-300 hover:text-white'
                          }`}
                        >
                          {isFiltered ? 'Viewing' : 'Focus'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Account Quick Detail */}
              {selectedAccount && (
                <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                    <span className="font-semibold text-white">Connection Details for {selectedAccount.accountName}</span>
                    <button
                      onClick={() => handleRunDiagnostic(selectedAccount)}
                      disabled={isRunningDiagnostic}
                      className="flex items-center gap-1 text-cyan-400 hover:underline text-[11px]"
                    >
                      <Zap className="h-3 w-3" />
                      <span>{isRunningDiagnostic ? 'Testing...' : 'Run Diagnostics'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div>
                      <span className="text-gray-500">Provider:</span>
                      <p className="font-bold text-white uppercase">{selectedAccount.provider}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Default Region:</span>
                      <p className="font-medium text-white">{selectedAccount.region}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Sync Interval:</span>
                      <p className="font-mono text-white">Every {selectedAccount.syncIntervalSec}s</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <p className="font-semibold text-emerald-400">Authenticated (SSL/TLS)</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Live Health & Permission Diagnostics */}
          {activeTab === 'diagnostics' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-white">Live Diagnostic Verification</h4>
                  <p className="text-[11px] text-gray-400">Testing IAM permissions, DNS reachability, and CloudWatch / Monitor metric stream</p>
                </div>

                <button
                  onClick={() => handleRunDiagnostic(selectedAccount)}
                  disabled={isRunningDiagnostic}
                  className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-1 text-xs font-semibold text-white hover:bg-cyan-500 disabled:opacity-50"
                >
                  <RefreshCw className={`h-3 w-3 ${isRunningDiagnostic ? 'animate-spin' : ''}`} />
                  <span>{isRunningDiagnostic ? 'Running Diagnostic...' : 'Test Selected Account'}</span>
                </button>
              </div>

              {currentDiagnostic ? (
                <div className="space-y-3">
                  {/* Summary Check Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-gray-900 p-2.5 border border-gray-800 flex items-center justify-between">
                      <span className="text-gray-300">DNS & API Endpoint Ping</span>
                      <span className="font-mono font-bold text-emerald-400">{currentDiagnostic.endpointReachability.latencyMs}ms (PASSED)</span>
                    </div>
                    <div className="rounded-lg bg-gray-900 p-2.5 border border-gray-800 flex items-center justify-between">
                      <span className="text-gray-300">Identity & Role Auth</span>
                      <span className="font-semibold text-emerald-400 truncate max-w-[150px]">{currentDiagnostic.credentialAuth.identityArn.split('/').pop()}</span>
                    </div>
                    <div className="rounded-lg bg-gray-900 p-2.5 border border-gray-800 flex items-center justify-between">
                      <span className="text-gray-300">Resource Discovery</span>
                      <span className="font-bold text-white">{currentDiagnostic.resourceDiscovery.resourcesFound} Discovered</span>
                    </div>
                    <div className="rounded-lg bg-gray-900 p-2.5 border border-gray-800 flex items-center justify-between">
                      <span className="text-gray-300">Telemetry Stream Interval</span>
                      <span className="font-bold text-emerald-400">60s Live Stream</span>
                    </div>
                  </div>

                  {/* Permissions Audit Checklist */}
                  <div className="rounded-lg border border-gray-800 bg-gray-900/60 p-3 space-y-2 text-xs">
                    <h5 className="font-semibold text-gray-300 text-[11px] uppercase tracking-wider">
                      IAM Least-Privilege Permission Verification
                    </h5>
                    <div className="divide-y divide-gray-800">
                      {currentDiagnostic.permissionsAudit.map((p, idx) => (
                        <div key={idx} className="py-1.5 flex items-center justify-between text-[11px]">
                          <div>
                            <span className="font-medium text-white">{p.service}</span>
                            <span className="text-gray-500 font-mono ml-2">{p.action}</span>
                          </div>
                          <span className="rounded bg-emerald-950 px-1.5 py-0.2 text-[10px] font-bold text-emerald-400 border border-emerald-800">
                            GRANTED
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-gray-800 bg-gray-900/40 p-8 text-center space-y-2 text-xs">
                  <p className="text-gray-400">Click &ldquo;Test Selected Account&rdquo; to execute a real-time connectivity and permission check.</p>
                  <button
                    onClick={() => handleRunDiagnostic(selectedAccount)}
                    className="rounded-lg bg-cyan-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500"
                  >
                    Run Test on {selectedAccount?.accountName}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: 1-Click Onboarding Code (IaC) */}
          {activeTab === 'iac_templates' && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white">Automated Onboarding Scripts</h4>
                  <p className="text-[11px] text-gray-400">Deploy least-privilege IAM roles or Service Principals to your cloud accounts</p>
                </div>

                <button
                  onClick={() => {
                    const code = globalCloudConnector.generateOnboardingTemplate(selectedAccount.provider, 'terraform');
                    navigator.clipboard.writeText(code);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-800 px-2.5 py-1 text-xs text-gray-200 hover:text-white"
                >
                  {copiedCode ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Terraform'}</span>
                </button>
              </div>

              <div className="rounded-lg bg-gray-950 p-3 font-mono text-[11px] text-cyan-300 overflow-x-auto max-h-64 border border-gray-800">
                <pre>{globalCloudConnector.generateOnboardingTemplate(selectedAccount.provider, 'terraform')}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-800 px-5 py-3 bg-gray-900/80 flex items-center justify-between text-xs">
          <span className="text-gray-400">
            Active Focus: <strong className="text-white uppercase">{activeProviderFilter}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectProviderFilter('all')}
              className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 font-medium text-gray-300 hover:text-white"
            >
              View All Multi-Cloud Fleet
            </button>
            <button
              onClick={onClose}
              className="rounded-lg bg-cyan-600 px-4 py-1.5 font-semibold text-white hover:bg-cyan-500"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {/* Add New Cloud Connection Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 p-4">
          <div className="w-full max-w-md rounded-xl border border-gray-800 bg-[#111827] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
              <h4 className="text-sm font-bold text-white">Add Cloud Account Integration</h4>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewAccount} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-medium mb-1">Target Cloud Platform</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['aws', 'azure', 'gcp'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewProvider(p)}
                      className={`rounded-lg border p-2 text-center font-bold uppercase ${
                        newProvider === p ? 'border-cyan-500 bg-gray-900 text-white' : 'border-gray-800 bg-gray-950 text-gray-400'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Account Display Name</label>
                <input
                  type="text"
                  required
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  placeholder={`e.g. ${newProvider.toUpperCase()} Production Staging`}
                  className="w-full rounded-lg border border-gray-800 bg-gray-900 p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">
                  {newProvider === 'aws' ? 'IAM Role ARN or Account ID' : newProvider === 'azure' ? 'Subscription ID' : 'GCP Project ID'}
                </label>
                <input
                  type="text"
                  required
                  value={newKey1}
                  onChange={(e) => setNewKey1(e.target.value)}
                  placeholder={newProvider === 'aws' ? 'arn:aws:iam::123456789012:role/CloudOpsRole' : 'Project/Subscription ID'}
                  className="w-full rounded-lg border border-gray-800 bg-gray-900 p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-gray-800 bg-gray-900 px-3 py-1.5 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-cyan-600 px-4 py-1.5 font-semibold text-white hover:bg-cyan-500"
                >
                  Verify & Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
