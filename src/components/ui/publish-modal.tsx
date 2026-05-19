'use client';

import { useState } from 'react';
import { X, Send, Clock, AlertTriangle, CheckCircle, Copy } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useEditorStore } from '@/stores/editor-store';

export function PublishModal() {
  const { showPublishModal, setShowPublishModal } = useUIStore();
  const { blocks } = useEditorStore();
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'copy' | 'publish'>('copy');

  if (!showPublishModal) return null;

  const validBlocks = blocks.filter(b => b.content.trim());

  function handleCopyAll() {
    const text = validBlocks.map((b, i) => `[${i + 1}/${validBlocks.length}]\n${b.content}`).join('\n\n---\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleCopyBlock(content: string) {
    navigator.clipboard.writeText(content);
  }

  async function handlePublish() {
    try {
      const res = await fetch('/api/threads/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks: validBlocks.map(b => ({ content: b.content })) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Publishing failed');
      alert('Published successfully!');
      setShowPublishModal(false);
    } catch (err: any) {
      alert(err.message || 'Publishing failed. Use Copy mode to post manually.');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[var(--bg)] border border-[var(--border)] rounded-xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--text)]">Publish Thread</h2>
          <button onClick={() => setShowPublishModal(false)} className="p-1 rounded hover:bg-[var(--bg-secondary)]">
            <X size={18} />
          </button>
        </div>

        {/* Summary */}
        <div className="mb-4 p-3 rounded-lg bg-[var(--bg-secondary)] text-sm">
          <p className="text-[var(--text)]">{validBlocks.length} post{validBlocks.length !== 1 ? 's' : ''} in thread</p>
          <p className="text-[var(--text-secondary)] text-xs mt-1">
            {validBlocks.reduce((s, b) => s + b.char_count, 0)} total characters
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode('copy')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium ${mode === 'copy' ? 'bg-[var(--accent)] text-[var(--bg)]' : 'border border-[var(--border)] text-[var(--text-secondary)]'}`}
          >
            <Copy size={14} className="inline mr-1" /> Copy to Clipboard
          </button>
          <button
            onClick={() => setMode('publish')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium ${mode === 'publish' ? 'bg-[var(--accent)] text-[var(--bg)]' : 'border border-[var(--border)] text-[var(--text-secondary)]'}`}
          >
            <Send size={14} className="inline mr-1" /> Direct Publish
          </button>
        </div>

        {mode === 'copy' && (
          <div className="space-y-2">
            {validBlocks.map((block, i) => (
              <div key={block.id} className="p-2.5 rounded-lg border border-[var(--border)] group relative">
                <p className="text-xs text-[var(--text)] whitespace-pre-wrap">{block.content}</p>
                <button
                  onClick={() => handleCopyBlock(block.content)}
                  className="absolute top-2 right-2 p-1 rounded bg-[var(--bg-secondary)] opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Copy size={10} />
                </button>
                <span className="text-[10px] text-[var(--text-secondary)] mt-1 block">{i + 1}/{validBlocks.length}</span>
              </div>
            ))}
            <button
              onClick={handleCopyAll}
              className="w-full py-2.5 rounded-lg bg-[var(--accent)] text-[var(--bg)] text-sm font-medium hover:opacity-90"
            >
              {copied ? '✓ Copied!' : 'Copy All Posts'}
            </button>
          </div>
        )}

        {mode === 'publish' && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-xs text-[var(--warning)]">
                Direct publishing requires Threads API connection. If not connected, use Copy mode.
              </p>
            </div>
            <button
              onClick={handlePublish}
              disabled={validBlocks.length === 0}
              className="w-full py-2.5 rounded-lg bg-[var(--accent)] text-[var(--bg)] text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              Publish to Threads
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
