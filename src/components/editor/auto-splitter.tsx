'use client';

import { useState } from 'react';
import { Wand2 } from 'lucide-react';
import { useEditorStore } from '@/stores/editor-store';
import { autoSplitText, autoSplitAllBlocks } from '@/lib/utils/splitter';

export function AutoSplitter() {
  const { blocks, setBlocks, pushUndo } = useEditorStore();
  const [showInput, setShowInput] = useState(false);
  const [bulkText, setBulkText] = useState('');

  const hasOversized = blocks.some(b => b.char_count > 500);

  function handleAutoSplit() {
    pushUndo();
    setBlocks(autoSplitAllBlocks(blocks));
  }

  function handleBulkSplit() {
    if (!bulkText.trim()) return;
    pushUndo();
    const newBlocks = autoSplitText(bulkText);
    setBlocks(newBlocks);
    setBulkText('');
    setShowInput(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {hasOversized && (
          <button
            onClick={handleAutoSplit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--warning)]/10 border border-[var(--warning)]/30 text-xs text-[var(--warning)] hover:bg-[var(--warning)]/20 transition-colors"
          >
            <Wand2 size={12} /> Auto-split oversized blocks
          </button>
        )}
        <button
          onClick={() => setShowInput(!showInput)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
        >
          <Wand2 size={12} /> Paste & Split
        </button>
      </div>

      {showInput && (
        <div className="space-y-2">
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder="Paste your full text here and it will be intelligently split into thread blocks..."
            className="w-full h-32 p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-sm text-[var(--text)] resize-none outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-secondary)]">
              {bulkText.length} chars → ~{Math.ceil(bulkText.length / 500)} blocks
            </span>
            <button
              onClick={handleBulkSplit}
              disabled={!bulkText.trim()}
              className="px-3 py-1.5 rounded-lg bg-[var(--accent)] text-[var(--bg)] text-xs font-medium hover:opacity-90 disabled:opacity-50"
            >
              Split into blocks
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
