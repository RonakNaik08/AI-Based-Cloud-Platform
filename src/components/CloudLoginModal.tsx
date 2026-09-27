'use client';

import React, { useState } from 'react';
import {
  Cloud,
  CheckCircle2,
  X,
  Key,
  ShieldCheck,
  RefreshCw,
  Trash2,
  ArrowRight
} from 'lucide-react';
import { CloudAccountConnection, CloudProvider } from '@/lib/types';

interface CloudLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: CloudAccountConnection[];
  onUpdateAccount: (updated: CloudAccountConnection) => void;
  onSelectActiveProvider: (provider: CloudProvider | 'all') => void;
  activeProvider: string;
}

export const CloudLoginModal: React.FC<CloudLoginModalProps> = ({
  isOpen,
  onClose,
  accounts,
  onUpdateAccount,
  onSelectActiveProvider,
  activeProvider,
}) => {
  const [selectedProviderTab, setSelectedProviderTab] = useState<CloudProvider>('aws');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  // AWS Form State
  const [awsKeyId, setAwsKeyId] = useState('');
  const [awsSecretKey, setAwsSecretKey] = useState('');
  const [awsRoleArn, setAwsRoleArn] = useState('');
  const [awsRegion, setAwsRegion] = useState('us-east-1');

  // Azure Form State
  const [azureSubId, setAzureSubId] = useState('');
  const [azureTenantId, setAzureTenantId] = useState('');
  const [azureClientId, setAzureClientId] = useState('');
  const [azureSecret, setAzureSecret] = useState('');

  // GCP Form State
  const [gcpProjectId, setGcpProjectId] = useState('');
  const [gcpServiceEmail, setGcpServiceEmail] = useState('');

  if (!isOpen) return null;

  const currentAccount = accounts.find((a) => a.provider === selectedProviderTab);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    await new Promise((r) => setTimeout(r, 600));

    const updatedAccount: CloudAccountConnection = {
      id: `${selectedProviderTab}-${Date.now()}`,
      provider: selectedProviderTab,
      connectionMethod: 'iam_role_arn',
      environment: 'production',
      region: selectedProviderTab === 'aws' ? 'us-east-1' : selectedProviderTab === 'azure' ? 'eastus' : 'us-central1',
      latencyMs: selectedProviderTab === 'aws' ? 22 : selectedProviderTab === 'azure' ? 34 : 28,
      syncIntervalSec: 30,
      accountName:
        selectedProviderTab === 'aws'
          ? `AWS (${awsRegion || 'us-east-1'})`
          : selectedProviderTab === 'azure'
          ? `Azure (${azureSubId.slice(0, 8) || 'Enterprise'})`
          : `GCP (${gcpProjectId || 'Production'})`,
      accountId:
        selectedProviderTab === 'aws'
          ? '8920-1948-2910'
          : selectedProviderTab === 'azure'
          ? azureSubId || 'sub-49f0a82b-91c2'
          : gcpProjectId || 'gcp-cloudops-prod',
      status: 'connected',
      credentials: {
        awsAccessKeyId: awsKeyId,
        awsSecretAccessKey: awsSecretKey,
        awsRoleArn,
        awsRegion,
        azureSubscriptionId: azureSubId,
        azureTenantId,
        azureClientId,
        azureClientSecret: azureSecret,
        gcpProjectId,
        gcpServiceAccountEmail: gcpServiceEmail,
      },
      connectedAt: new Date().toISOString(),
      lastSyncedAt: 'Just now',
      resourcesCount: selectedProviderTab === 'aws' ? 12 : selectedProviderTab === 'azure' ? 7 : 6,
    };

    onUpdateAccount(updatedAccount);
    setIsAuthenticating(false);
    setAuthSuccess(true);
    setTimeout(() => {
      setAuthSuccess(false);
    }, 1500);
  };

  const handle1ClickDemoConnect = (provider: CloudProvider) => {
    setIsAuthenticating(true);
    setTimeout(() => {
      const demoAccount: CloudAccountConnection = {
        id: `${provider}-demo-${Date.now()}`,
        provider,
        connectionMethod: provider === 'aws' ? 'iam_role_arn' : provider === 'azure' ? 'azure_service_principal' : 'gcp_service_account',
        environment: 'production',
        region: provider === 'aws' ? 'us-east-1' : provider === 'azure' ? 'eastus' : 'us-central1',
        latencyMs: provider === 'aws' ? 22 : provider === 'azure' ? 34 : 28,
        syncIntervalSec: 30,
        accountName:
          provider === 'aws'
            ? 'AWS Production (Primary)'
            : provider === 'azure'
            ? 'Azure Enterprise Cloud'
            : 'GCP Core Production',
        accountId:
          provider === 'aws'
            ? '8920-1948-2910'
            : provider === 'azure'
            ? 'sub-49f0a82b-91c2-48df'
            : 'gcp-cloudops-prod-982',
        status: 'connected',
        credentials: {},
        connectedAt: new Date().toISOString(),
        lastSyncedAt: 'Just now',
        resourcesCount: provider === 'aws' ? 12 : provider === 'azure' ? 7 : 6,
      };

      onUpdateAccount(demoAccount);
      setIsAuthenticating(false);
      setAuthSuccess(true);
      setTimeout(() => {
        setAuthSuccess(false);
      }, 1000);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-lg rounded-xl border border-gray-800 bg-[#111827] p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-600 text-white">
              <Cloud className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Cloud Platform Accounts</h3>
              <p className="text-xs text-gray-400">Connect AWS, Azure, or GCP to view resources</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Provider Selector Tabs */}
        <div className="grid grid-cols-3 gap-2">
          {(['aws', 'azure', 'gcp'] as const).map((prov) => {
            const acc = accounts.find((a) => a.provider === prov);
            const isConnected = acc?.status === 'connected';
            const isSelected = selectedProviderTab === prov;

            return (
              <button
                key={prov}
                type="button"
                onClick={() => setSelectedProviderTab(prov)}
                className={`rounded-lg border p-2.5 text-left transition-colors ${
                  isSelected
                    ? 'border-cyan-500 bg-gray-900'
                    : 'border-gray-800 bg-gray-950/60 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase text-white">{prov}</span>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isConnected ? 'bg-emerald-500' : 'bg-gray-600'
                    }`}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1 truncate">
                  {isConnected ? `${acc?.resourcesCount} resources` : 'Disconnected'}
                </p>
              </button>
            );
          })}
        </div>

        {/* Connection Form for Selected Provider */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-gray-800">
            <span className="font-semibold text-white uppercase tracking-wider text-[11px]">
              {selectedProviderTab} Credentials & Access
            </span>
            <button
              type="button"
              onClick={() => handle1ClickDemoConnect(selectedProviderTab)}
              className="text-[11px] font-medium text-cyan-400 hover:underline"
            >
              1-Click Demo Connect &rarr;
            </button>
          </div>

          <form onSubmit={handleConnect} className="space-y-2.5">
            {selectedProviderTab === 'aws' && (
              <>
                <div>
                  <label className="block text-gray-300 font-medium mb-1">AWS Access Key ID</label>
                  <input
                    type="text"
                    value={awsKeyId}
                    onChange={(e) => setAwsKeyId(e.target.value)}
                    placeholder="AKIAIOSFODNN7EXAMPLE"
                    className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-1.5 text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-1">AWS Secret Access Key</label>
                  <input
                    type="password"
                    value={awsSecretKey}
                    onChange={(e) => setAwsSecretKey(e.target.value)}
                    placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                    className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-1.5 text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Role ARN (Optional)</label>
                    <input
                      type="text"
                      value={awsRoleArn}
                      onChange={(e) => setAwsRoleArn(e.target.value)}
                      placeholder="arn:aws:iam::..."
                      className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-1.5 text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Default Region</label>
                    <select
                      value={awsRegion}
                      onChange={(e) => setAwsRegion(e.target.value)}
                      className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-1.5 text-white focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="us-east-1">us-east-1</option>
                      <option value="us-west-2">us-west-2</option>
                      <option value="eu-west-1">eu-west-1</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {selectedProviderTab === 'azure' && (
              <>
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Azure Subscription ID</label>
                  <input
                    type="text"
                    value={azureSubId}
                    onChange={(e) => setAzureSubId(e.target.value)}
                    placeholder="49f0a82b-91c2-48df-992a-..."
                    className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-1.5 text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Azure Tenant ID</label>
                  <input
                    type="text"
                    value={azureTenantId}
                    onChange={(e) => setAzureTenantId(e.target.value)}
                    placeholder="72f988bf-86f1-41af-..."
                    className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-1.5 text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Client ID & Secret</label>
                  <input
                    type="password"
                    value={azureSecret}
                    onChange={(e) => setAzureSecret(e.target.value)}
                    placeholder="Client Secret key..."
                    className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-1.5 text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </>
            )}

            {selectedProviderTab === 'gcp' && (
              <>
                <div>
                  <label className="block text-gray-300 font-medium mb-1">GCP Project ID</label>
                  <input
                    type="text"
                    value={gcpProjectId}
                    onChange={(e) => setGcpProjectId(e.target.value)}
                    placeholder="gcp-production-project-01"
                    className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-1.5 text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Service Account Email</label>
                  <input
                    type="text"
                    value={gcpServiceEmail}
                    onChange={(e) => setGcpServiceEmail(e.target.value)}
                    placeholder="cloudops-sa@project.iam.gserviceaccount.com"
                    className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-1.5 text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </>
            )}

            {authSuccess && (
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs pt-1">
                <CheckCircle2 className="h-4 w-4" />
                <span>Account verified & resources synced successfully!</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => {
                  onSelectActiveProvider(selectedProviderTab);
                  onClose();
                }}
                className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-gray-300 hover:text-white"
              >
                Switch View to {selectedProviderTab.toUpperCase()}
              </button>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="rounded-lg bg-cyan-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 disabled:opacity-50"
              >
                {isAuthenticating ? 'Connecting...' : 'Save & Sync Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
