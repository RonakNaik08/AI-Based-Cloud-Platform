'use client';

import React, { useState } from 'react';
import {
  Settings,
  X,
  CheckCircle2,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  provider: 'builtin' | 'gemini' | 'openai';
  setProvider: (p: 'builtin' | 'gemini' | 'openai') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  setApiKey,
  provider,
  setProvider,
}) => {
  const [localKey, setLocalKey] = useState(apiKey);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setApiKey(localKey);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className="w-full max-w-sm rounded-xl border border-gray-800 bg-[#111827] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Settings</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-gray-300 font-semibold mb-1">AI Reasoning Engine</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'builtin', label: 'Built-in' },
                { id: 'gemini', label: 'Gemini' },
                { id: 'openai', label: 'OpenAI' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProvider(p.id as any)}
                  className={`rounded-lg border p-2 text-center transition-colors ${
                    provider === p.id
                      ? 'border-cyan-500 bg-gray-900 text-white font-semibold'
                      : 'border-gray-800 bg-gray-950 text-gray-400 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {provider !== 'builtin' && (
            <div>
              <label className="block text-gray-300 mb-1">API Key</label>
              <input
                type="password"
                value={localKey}
                onChange={(e) => setLocalKey(e.target.value)}
                placeholder="Key..."
                className="w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-1.5 text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          )}
        </div>

        {saved && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>Saved!</span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-800">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-800 bg-gray-900 px-3 py-1.5 text-xs text-gray-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-lg bg-cyan-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
