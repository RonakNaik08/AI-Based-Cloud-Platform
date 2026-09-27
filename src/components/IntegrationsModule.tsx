'use client';

import React, { useState } from 'react';
import {
  Bell,
  MessageSquare,
  CheckCircle2,
  ExternalLink,
  Plus,
  Send,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';
import { WebhookIntegration } from '@/lib/types';
import { globalWebhookNotifier } from '@/lib/webhookNotifier';

export const IntegrationsModule: React.FC = () => {
  const [integrations, setIntegrations] = useState<WebhookIntegration[]>(
    globalWebhookNotifier.getIntegrations()
  );
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; payload?: any } | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New Integration Form
  const [newName, setNewName] = useState('');
  const [newChannel, setNewChannel] = useState<'slack' | 'pagerduty' | 'teams' | 'discord'>('slack');
  const [newUrl, setNewUrl] = useState('');

  const handleToggle = (id: string) => {
    globalWebhookNotifier.toggleIntegration(id);
    setIntegrations([...globalWebhookNotifier.getIntegrations()]);
  };

  const handleTest = (id: string) => {
    const res = globalWebhookNotifier.testWebhook(id);
    setIntegrations([...globalWebhookNotifier.getIntegrations()]);
    setTestResult({
      success: res.success,
      message: res.message,
      payload: res.samplePayload,
    });
    setTimeout(() => {
      setTestResult(null);
    }, 6000);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newUrl) return;

    globalWebhookNotifier.addIntegration({
      name: newName,
      channel: newChannel,
      endpointUrl: newUrl,
      events: ['anomaly_detected', 'action_executed'],
      enabled: true,
    });

    setIntegrations([...globalWebhookNotifier.getIntegrations()]);
    setIsAddOpen(false);
    setNewName('');
    setNewUrl('');
  };

  const getChannelColor = (ch: string) => {
    switch (ch) {
      case 'slack':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'pagerduty':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'teams':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      default:
        return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Bell className="h-4 w-4 text-cyan-400" />
            Alert Webhooks & Notification Channels
          </h2>
          <p className="text-xs text-gray-400">
            Dispatch real-time incident notifications, AI triage analyses & daily digests to team tools
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Webhook Channel</span>
        </button>
      </div>

      {testResult && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-4 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-emerald-300 font-bold">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{testResult.message}</span>
          </div>
          {testResult.payload && (
            <div className="rounded-xl border border-gray-800 bg-gray-950 p-3 font-mono text-[11px] text-gray-300 max-h-32 overflow-y-auto">
              <pre>{JSON.stringify(testResult.payload, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((item) => {
          return (
            <div
              key={item.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between space-y-3 transition-all ${
                item.enabled ? 'border-gray-800 bg-[#111827]' : 'border-gray-800/60 bg-gray-950/40 opacity-60'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${getChannelColor(item.channel)}`}>
                    {item.channel}
                  </span>

                  <button
                    onClick={() => handleToggle(item.id)}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    {item.enabled ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" /> Enabled
                      </span>
                    ) : (
                      <span className="text-gray-500 font-semibold">Disabled</span>
                    )}
                  </button>
                </div>

                <h3 className="text-sm font-bold text-white">{item.name}</h3>
                <p className="text-[11px] font-mono text-gray-400 truncate">{item.endpointUrl}</p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {item.events.map((ev) => (
                  <span
                    key={ev}
                    className="rounded bg-gray-900 border border-gray-800 px-2 py-0.5 text-[10px] text-gray-300 font-mono"
                  >
                    {ev.replace('_', ' ')}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                <span className="text-[10px] text-gray-500">
                  Last fired: {item.lastFiredAt || 'Never'}
                </span>

                <button
                  onClick={() => handleTest(item.id)}
                  className="flex items-center gap-1 rounded-lg bg-gray-800 border border-gray-700 px-2.5 py-1 text-xs text-cyan-400 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  <Send className="h-3 w-3" />
                  <span>Send Test Alert</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add Channel */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-[#111827] p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-sm font-bold text-white">Add Webhook Channel</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-medium mb-1">Integration Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. SRE Critical Channel"
                  className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-1.5 text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Platform Type</label>
                <select
                  value={newChannel}
                  onChange={(e) => setNewChannel(e.target.value as any)}
                  className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-1.5 text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="slack">Slack Incoming Webhook</option>
                  <option value="pagerduty">PagerDuty Events API v2</option>
                  <option value="teams">Microsoft Teams Connector</option>
                  <option value="discord">Discord Webhook</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Webhook Endpoint URL</label>
                <input
                  type="url"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://api.example.com/webhooks/..."
                  className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-1.5 text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-gray-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-cyan-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500"
                >
                  Save Integration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
