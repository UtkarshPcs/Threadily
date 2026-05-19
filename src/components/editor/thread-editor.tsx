'use client';

import { useCallback, useEffect, useRef } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useEditorStore } from '@/stores/editor-store';
import { EditorBlock } from './editor-block';
import { APP_CONFIG } from '@/config';
import { AutoSplitter } from './auto-splitter';

export function ThreadEditor() {
  const { blocks, reorderBlocks, addBlock, undo, redo } = useEditorStore();
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  // Auto-save
  useEffect(() => {
    autoSaveTimer.current = setInterval(() => {
      // Trigger auto-save (handled by draft system)
      window.dispatchEvent(new CustomEvent('autosave'));
    }, APP_CONFIG.autoSaveInterval);
    return () => { if (autoSaveTimer.current) clearInterval(autoSaveTimer.current); };
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
        if (e.key === 'z' && e.shiftKey) { e.preventDefault(); redo(); }
        if (e.key === 'y') { e.preventDefault(); redo(); }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex(b => b.id === active.id);
      const newIndex = blocks.findIndex(b => b.id === over.id);
      reorderBlocks(oldIndex, newIndex);
    }
  }, [blocks, reorderBlocks]);

  return (
    <div className="max-w-2xl mx-auto">
      <input
        type="text"
        placeholder="Thread title..."
        className="w-full text-xl font-semibold bg-transparent border-none outline-none text-[var(--text)] placeholder:text-[var(--text-secondary)]/50 mb-6"
      />

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {blocks.map((block, index) => (
              <EditorBlock key={block.id} block={block} index={index} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button
        onClick={() => addBlock()}
        className="mt-4 w-full py-3 border border-dashed border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)] hover:border-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
      >
        + Add block
      </button>

      <div className="mt-4">
        <AutoSplitter />
      </div>

      <div className="mt-4 text-xs text-[var(--text-secondary)] flex gap-4">
        <span>{blocks.length} block{blocks.length !== 1 ? 's' : ''}</span>
        <span>{blocks.reduce((sum, b) => sum + b.char_count, 0)} total chars</span>
        <span>~{Math.ceil(blocks.reduce((sum, b) => sum + b.content.split(/\s+/).length, 0) / 200)} min read</span>
      </div>
    </div>
  );
}
