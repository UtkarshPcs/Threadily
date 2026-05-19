'use client';

import { useRef, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Copy, Trash2, Scissors, Merge, Plus } from 'lucide-react';
import { useEditorStore } from '@/stores/editor-store';
import { ThreadBlock } from '@/types';
import { APP_CONFIG } from '@/config';

interface Props {
  block: ThreadBlock;
  index: number;
}

export function EditorBlock({ block, index }: Props) {
  const { updateBlock, deleteBlock, duplicateBlock, splitBlock, mergeBlocks, addBlock, blocks, pushUndo } = useEditorStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const charCount = block.char_count;
  const isWarning = charCount > APP_CONFIG.splitWarningThreshold && charCount <= APP_CONFIG.splitDangerThreshold;
  const isDanger = charCount > APP_CONFIG.splitDangerThreshold;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateBlock(block.id, e.target.value);
    // Auto-resize
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }, [block.id, updateBlock]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Ctrl+Enter to split at cursor
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      const pos = textareaRef.current?.selectionStart ?? block.content.length;
      splitBlock(block.id, pos);
    }
    // Backspace at start to merge with previous
    if (e.key === 'Backspace' && textareaRef.current?.selectionStart === 0 && index > 0) {
      e.preventDefault();
      mergeBlocks(blocks[index - 1].id, block.id);
    }
    // Enter at end to add new block
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
      const pos = textareaRef.current?.selectionStart ?? 0;
      if (pos === block.content.length) {
        e.preventDefault();
        addBlock(index);
      }
    }
  }, [block, index, blocks, splitBlock, mergeBlocks, addBlock]);

  // Paste handling - auto-split if pasted content exceeds limit
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text');
    if (block.content.length + text.length > APP_CONFIG.maxCharsPerBlock) {
      e.preventDefault();
      pushUndo();
      // Split pasted content into chunks
      const combined = block.content + text;
      updateBlock(block.id, combined.slice(0, APP_CONFIG.maxCharsPerBlock));
      // Remaining goes to new block
      const remaining = combined.slice(APP_CONFIG.maxCharsPerBlock);
      if (remaining) {
        splitBlock(block.id, APP_CONFIG.maxCharsPerBlock);
      }
    }
  }, [block, updateBlock, splitBlock, pushUndo]);

  return (
    <div ref={setNodeRef} style={style} className="editor-block group relative flex gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3 transition-all hover:border-[var(--text-secondary)]/30">
      {/* Drag handle */}
      <div {...attributes} {...listeners} className="flex flex-col items-center gap-1 pt-1 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical size={14} className="text-[var(--text-secondary)]" />
        <span className="text-[10px] text-[var(--text-secondary)]">{index + 1}</span>
      </div>

      {/* Content */}
      <div className="flex-1">
        <textarea
          ref={textareaRef}
          value={block.content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={index === 0 ? "Start writing your thread..." : "Continue..."}
          className="w-full bg-transparent border-none outline-none resize-none text-sm text-[var(--text)] placeholder:text-[var(--text-secondary)]/40 min-h-[60px]"
          rows={2}
        />

        {/* Footer */}
        <div className="flex items-center justify-between mt-2">
          <span className={`text-xs ${isDanger ? 'text-[var(--danger)] font-medium' : isWarning ? 'text-[var(--warning)]' : 'text-[var(--text-secondary)]'}`}>
            {charCount}/{APP_CONFIG.maxCharsPerBlock}
          </span>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => addBlock(index)} className="p-1 rounded hover:bg-[var(--bg-secondary)]" title="Add block below">
              <Plus size={12} className="text-[var(--text-secondary)]" />
            </button>
            <button onClick={() => splitBlock(block.id, Math.floor(block.content.length / 2))} className="p-1 rounded hover:bg-[var(--bg-secondary)]" title="Split block">
              <Scissors size={12} className="text-[var(--text-secondary)]" />
            </button>
            {index > 0 && (
              <button onClick={() => mergeBlocks(blocks[index - 1].id, block.id)} className="p-1 rounded hover:bg-[var(--bg-secondary)]" title="Merge with above">
                <Merge size={12} className="text-[var(--text-secondary)]" />
              </button>
            )}
            <button onClick={() => duplicateBlock(block.id)} className="p-1 rounded hover:bg-[var(--bg-secondary)]" title="Duplicate">
              <Copy size={12} className="text-[var(--text-secondary)]" />
            </button>
            <button onClick={() => deleteBlock(block.id)} className="p-1 rounded hover:bg-[var(--bg-secondary)]" title="Delete">
              <Trash2 size={12} className="text-[var(--danger)]" />
            </button>
          </div>
        </div>

        {/* Character limit bar */}
        <div className="mt-1 h-0.5 rounded-full bg-[var(--border)] overflow-hidden">
          <div
            className={`h-full transition-all ${isDanger ? 'bg-[var(--danger)]' : isWarning ? 'bg-[var(--warning)]' : 'bg-[var(--success)]'}`}
            style={{ width: `${Math.min(100, (charCount / APP_CONFIG.maxCharsPerBlock) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
