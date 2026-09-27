'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  Sparkles,
} from 'lucide-react';
import { RunbookDocument } from '@/lib/types';
import { globalRAGEngine } from '@/lib/ragEngine';

interface RAGKnowledgeBaseModuleProps {
  runbooks: RunbookDocument[];
  onAddRunbook: (doc: any) => void;
  onOpenCopilotWithPrompt: (prompt: string) => void;
}

export const RAGKnowledgeBaseModule: React.FC<RAGKnowledgeBaseModuleProps> = ({
  runbooks,
  onAddRunbook,
  onOpenCopilotWithPrompt,
}) => {
  const [selectedRunbook, setSelectedRunbook] = useState<RunbookDocument>(runbooks[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // New runbook form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'troubleshooting' | 'incident_response' | 'cost_optimization' | 'deployment'>('troubleshooting');
  const [newTags, setNewTags] = useState('');
  const [newContent, setNewContent] = useState('');

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    const results = globalRAGEngine.search(q, 3);
    setSearchResults(results);
  };

  const handleSaveRunbook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    onAddRunbook({
      title: newTitle,
      category: newCategory,
      tags: newTags.split(',').map((t) => t.trim()),
      content: newContent,
      author: 'DevOps Lead Engineer',
    });

    setShowAddModal(false);
    setNewTitle('');
    setNewTags('');
    setNewContent('');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-cyan-400" />
            RAG Knowledge Base & Runbooks ({runbooks.length})
          </h2>
          <p className="text-xs text-gray-400">
            Vector-embedded SOP documentation used by AI Copilot for grounded answers
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Runbook</span>
        </button>
      </div>

      {/* Semantic Search Tester */}
      <div className="rounded-xl border border-gray-800 bg-[#111827] p-3.5 space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search runbooks with semantic search (e.g. 'high cpu', 'postgres deadlock')..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-800 bg-gray-900 pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {searchResults.length > 0 && (
          <div className="space-y-1.5 pt-2">
            {searchResults.map((res, idx) => (
              <div key={idx} className="rounded-lg bg-gray-900 p-2 text-xs space-y-0.5">
                <div className="flex justify-between">
                  <span className="font-semibold text-white">{res.chunk.documentTitle}</span>
                  <span className="text-[10px] text-cyan-400 font-mono">{(res.score * 100).toFixed(0)}% match</span>
                </div>
                <p className="text-gray-400 text-[11px] italic">&ldquo;{res.excerpt}&rdquo;</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2-Column Runbooks */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* List */}
        <div className="space-y-2">
          {runbooks.map((doc) => {
            const isSelected = selectedRunbook?.id === doc.id;
            return (
              <div
                key={doc.id}
                onClick={() => setSelectedRunbook(doc)}
                className={`rounded-xl border p-3 cursor-pointer transition-colors ${
                  isSelected
                    ? 'border-cyan-500 bg-gray-900'
                    : 'border-gray-800 bg-[#111827] hover:bg-gray-900'
                }`}
              >
                <span className="text-[10px] font-semibold text-cyan-400 uppercase">{doc.category.replace('_', ' ')}</span>
                <h4 className="mt-0.5 text-xs font-semibold text-white">{doc.title}</h4>
              </div>
            );
          })}
        </div>

        {/* Content */}
        {selectedRunbook && (
          <div className="rounded-xl border border-gray-800 bg-[#111827] p-5 lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
              <div>
                <h3 className="text-sm font-bold text-white">{selectedRunbook.title}</h3>
                <p className="text-[11px] text-gray-400">Author: {selectedRunbook.author} &bull; Updated {selectedRunbook.lastUpdated}</p>
              </div>

              <button
                onClick={() =>
                  onOpenCopilotWithPrompt(
                    `Consult runbook "${selectedRunbook.title}" and guide me through the remediation workflow.`
                  )
                }
                className="rounded-lg bg-cyan-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-cyan-500"
              >
                Ask Copilot
              </button>
            </div>

            <div className="prose prose-invert prose-xs max-w-none text-gray-300 leading-relaxed whitespace-pre-wrap text-xs">
              {selectedRunbook.content}
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-xl border border-gray-800 bg-[#111827] p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">Add New Runbook Document</h3>
            <form onSubmit={handleSaveRunbook} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-lg border border-gray-800 bg-gray-900 p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full rounded-lg border border-gray-800 bg-gray-900 p-2 text-white"
                >
                  <option value="troubleshooting">Troubleshooting</option>
                  <option value="incident_response">Incident Response</option>
                  <option value="cost_optimization">Cost Optimization</option>
                  <option value="deployment">Deployment</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Content (Markdown)</label>
                <textarea
                  rows={5}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full rounded-lg border border-gray-800 bg-gray-900 p-2 text-white font-mono text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-gray-800 bg-gray-900 px-3 py-1.5 text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-cyan-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500"
                >
                  Save & Index
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
