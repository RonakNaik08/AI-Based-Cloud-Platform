'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  X,
  RefreshCw,
  BookOpen,
} from 'lucide-react';
import { CopilotMessage, CloudResource, MetricDataPoint } from '@/lib/types';

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  resources: CloudResource[];
  metrics: MetricDataPoint[];
  initialPrompt?: string;
  onTriggerAction: (actionType: string, payload: any) => void;
  onNavigateTab: (tab: any) => void;
}

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({
  isOpen,
  onClose,
  resources,
  metrics,
  initialPrompt,
  onTriggerAction,
}) => {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      timestamp: '16:50',
      content: `Hello! I am your **AI CloudOps Copilot**.

I have real-time access to your fleet (${resources.length} resources), CloudWatch metrics, anomalies, and runbooks.

**Try asking me:**
- *"Why is the production server slow?"*
- *"Which servers have high CPU?"*
- *"Why is my AWS bill increasing?"*
- *"Find all unattached EBS volumes"*`,
      structuredData: {
        analysisType: 'performance_deep_dive',
        actionButtons: [
          {
            label: 'Investigate prod-server-01 High Load',
            actionType: 'scale_instance',
            payload: { resourceId: 'i-08a9f3b817c01a91', resourceName: 'prod-server-01', targetType: 'c5.xlarge' },
            variant: 'primary',
          },
          {
            label: 'Run FinOps Cost Audit',
            actionType: 'apply_cost_fix',
            payload: {},
            variant: 'secondary',
          },
        ],
      },
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPrompt) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (promptText?: string) => {
    const query = (promptText || inputPrompt).trim();
    if (!query || isLoading) return;

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          resources,
        }),
      });

      if (!res.ok) throw new Error('Copilot API request failed');
      const data = await res.json();
      if (data.response) {
        setMessages((prev) => [...prev, data.response]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: 'Failed to query CloudOps AI model. Please verify your connection.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full sm:w-[460px] flex-col border-l border-gray-800 bg-[#0e1424] shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3 bg-gray-900">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-cyan-600 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">AI CloudOps Copilot</h2>
            <p className="text-[11px] text-gray-400">Context: {resources.length} resources &bull; RAG Runbooks</p>
          </div>
        </div>

        <button onClick={onClose} className="rounded p-1 text-gray-400 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1.5 mb-1 text-[10px] text-gray-500">
              {msg.sender === 'user' ? 'You' : 'AI Copilot'} &bull; {msg.timestamp}
            </div>

            <div
              className={`rounded-xl px-3.5 py-2.5 leading-relaxed max-w-[95%] ${
                msg.sender === 'user'
                  ? 'bg-cyan-600 text-white'
                  : 'border border-gray-800 bg-gray-900 text-gray-200'
              }`}
            >
              <div className="prose prose-invert prose-xs whitespace-pre-wrap">
                {msg.content}
              </div>

              {/* RAG Citations */}
              {msg.structuredData?.runbookCitations && msg.structuredData.runbookCitations.length > 0 && (
                <div className="mt-2.5 rounded-lg border border-gray-800 bg-gray-950 p-2 text-[11px] space-y-1">
                  <div className="flex items-center gap-1 font-semibold text-cyan-400">
                    <BookOpen className="h-3 w-3" /> Runbook Reference (RAG)
                  </div>
                  {msg.structuredData.runbookCitations.map((cite, idx) => (
                    <div key={idx} className="text-gray-300">
                      <p className="font-medium text-white">&bull; {cite.title}</p>
                      <p className="text-[10px] text-gray-400 italic">{cite.excerpt}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              {msg.structuredData?.actionButtons && msg.structuredData.actionButtons.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-gray-800 flex flex-wrap gap-1.5">
                  {msg.structuredData.actionButtons.map((btn, idx) => (
                    <button
                      key={idx}
                      onClick={() => onTriggerAction(btn.actionType, btn.payload)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                        btn.variant === 'primary'
                          ? 'bg-cyan-600 text-white hover:bg-cyan-500'
                          : btn.variant === 'danger'
                          ? 'bg-rose-600 text-white hover:bg-rose-500'
                          : 'border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-900 border border-gray-800 rounded-lg p-2.5">
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-cyan-400" />
            <span>Analyzing cloud metrics...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="border-t border-gray-800 px-3 py-2 bg-gray-900/60">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          {[
            'Why is the production server slow?',
            'Which servers have high CPU?',
            'Why is my AWS bill increasing?',
            'Find unattached EBS volumes',
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="shrink-0 rounded border border-gray-800 bg-gray-900 px-2 py-1 text-[11px] text-gray-400 hover:text-white"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 p-3 bg-gray-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask AI Copilot..."
            className="flex-1 rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputPrompt.trim()}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
