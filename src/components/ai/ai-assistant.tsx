'use client';

import { useState } from 'react';
import { Sparkles, Wand2, Zap, MessageSquare, Loader2 } from 'lucide-react';
import { useEditorStore } from '@/stores/editor-store';
import { AITone } from '@/types';
import { generateId } from '@/lib/utils';

const rewriteActions = [
  { id: 'improve_hook', label: 'Stronger Hook', icon: Zap },
  { id: 'shorten', label: 'Shorten' },
  { id: 'make_viral', label: 'Make Viral' },
  { id: 'improve_clarity', label: 'Improve Clarity' },
  { id: 'simplify', label: 'Simplify' },
  { id: 'add_cta', label: 'Add CTA' },
  { id: 'stronger_ending', label: 'Stronger Ending' },
];

const tones: AITone[] = ['educational', 'storytelling', 'viral', 'motivational', 'minimalist', 'controversial'];

export function AIAssistant() {
  const { blocks, updateBlock, setBlocks, pushUndo } = useEditorStore();
  const [loading, setLoading] = useState(false);
  const [expandIdea, setExpandIdea] = useState('');
  const [hookTopic, setHookTopic] = useState('');
  const [hooks, setHooks] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'rewrite' | 'expand' | 'hooks'>('rewrite');

  const selectedBlock = blocks[0]; // Apply to first block by default, or could track selection

  async function handleRewrite(action: string) {
    if (!selectedBlock?.content) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ai/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: selectedBlock.content, action }),
      });
      const { result } = await res.json();
      if (result) { pushUndo(); updateBlock(selectedBlock.id, result); }
    } catch {} finally { setLoading(false); }
  }

  async function handleTone(tone: AITone) {
    if (!selectedBlock?.content) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ai/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: selectedBlock.content, tone }),
      });
      const { result } = await res.json();
      if (result) { pushUndo(); updateBlock(selectedBlock.id, result); }
    } catch {} finally { setLoading(false); }
  }

  async function handleExpand() {
    if (!expandIdea.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ai/expand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: expandIdea }),
      });
      const { blocks: newBlocks } = await res.json();
      if (newBlocks) {
        pushUndo();
        setBlocks(newBlocks.map((content: string, i: number) => ({
          id: generateId(), content, order: i, char_count: content.length,
        })));
        setExpandIdea('');
      }
    } catch {} finally { setLoading(false); }
  }

  async function handleGenerateHooks() {
    if (!hookTopic.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ai/hooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: hookTopic }),
      });
      const { hooks: h } = await res.json();
      if (h) setHooks(h);
    } catch {} finally { setLoading(false); }
  }

  function useHook(hook: string) {
    pushUndo();
    updateBlock(blocks[0].id, hook);
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={16} className="text-purple-400" />
        <span className="text-sm font-medium text-[var(--text)]">AI Assistant</span>
        {loading && <Loader2 size={14} className="animate-spin text-[var(--text-secondary)]" />}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-0.5 rounded-lg bg-[var(--bg-secondary)]">
        {(['rewrite', 'expand', 'hooks'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium capitalize ${activeTab === tab ? 'bg-[var(--bg)] text-[var(--text)] shadow-sm' : 'text-[var(--text-secondary)]'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'rewrite' && (
        <div className="space-y-3">
          <p className="text-xs text-[var(--text-secondary)]">Rewrite first block:</p>
          <div className="flex flex-wrap gap-1.5">
            {rewriteActions.map(a => (
              <button
                key={a.id}
                onClick={() => handleRewrite(a.id)}
                disabled={loading}
                className="px-2.5 py-1.5 rounded-md border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] disabled:opacity-50"
              >
                {a.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-3">Tone presets:</p>
          <div className="flex flex-wrap gap-1.5">
            {tones.map(t => (
              <button
                key={t}
                onClick={() => handleTone(t)}
                disabled={loading}
                className="px-2.5 py-1.5 rounded-md border border-purple-500/30 text-xs text-purple-400 hover:bg-purple-500/10 disabled:opacity-50 capitalize"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'expand' && (
        <div className="space-y-3">
          <textarea
            value={expandIdea}
            onChange={(e) => setExpandIdea(e.target.value)}
            placeholder="Enter a short idea to expand into a full thread..."
            className="w-full h-20 p-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-xs text-[var(--text)] resize-none outline-none"
          />
          <button
            onClick={handleExpand}
            disabled={loading || !expandIdea.trim()}
            className="w-full py-2 rounded-lg bg-purple-600 text-white text-xs font-medium hover:bg-purple-700 disabled:opacity-50"
          >
            Expand into Thread
          </button>
        </div>
      )}

      {activeTab === 'hooks' && (
        <div className="space-y-3">
          <input
            value={hookTopic}
            onChange={(e) => setHookTopic(e.target.value)}
            placeholder="Thread topic..."
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-xs text-[var(--text)] outline-none"
          />
          <button
            onClick={handleGenerateHooks}
            disabled={loading || !hookTopic.trim()}
            className="w-full py-2 rounded-lg bg-purple-600 text-white text-xs font-medium hover:bg-purple-700 disabled:opacity-50"
          >
            Generate Hooks
          </button>
          {hooks.length > 0 && (
            <div className="space-y-1.5">
              {hooks.map((hook, i) => (
                <button
                  key={i}
                  onClick={() => useHook(hook)}
                  className="w-full text-left p-2 rounded-lg border border-[var(--border)] text-xs text-[var(--text)] hover:bg-[var(--bg-secondary)]"
                >
                  {hook}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
