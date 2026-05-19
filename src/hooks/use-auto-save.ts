'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useEditorStore } from '@/stores/editor-store';
import { useDraftsStore } from '@/stores/drafts-store';
import { Draft } from '@/types';
import { generateId } from '@/lib/utils';

export function useAutoSave() {
  const { blocks, currentDraft } = useEditorStore();
  const { addDraft, updateDraft } = useDraftsStore();
  const lastSaved = useRef<string>('');

  const save = useCallback(() => {
    const content = JSON.stringify(blocks);
    if (content === lastSaved.current) return; // No changes
    lastSaved.current = content;

    const now = new Date().toISOString();

    if (currentDraft) {
      updateDraft(currentDraft.id, { blocks, updated_at: now, version: currentDraft.version + 1 });
    } else {
      const title = blocks[0]?.content.slice(0, 50) || 'Untitled Thread';
      const newDraft: Draft = {
        id: generateId(),
        user_id: '',
        title,
        blocks,
        status: 'draft',
        tags: [],
        created_at: now,
        updated_at: now,
        version: 1,
      };
      addDraft(newDraft);
      useEditorStore.setState({ currentDraft: newDraft });
    }

    // Also try cloud save (fire and forget)
    fetch('/api/drafts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: currentDraft?.id,
        title: blocks[0]?.content.slice(0, 50) || 'Untitled Thread',
        blocks,
        tags: currentDraft?.tags || [],
        status: 'draft',
      }),
    }).catch(() => {}); // Silently fail - local backup is safe
  }, [blocks, currentDraft, addDraft, updateDraft]);

  // Listen for autosave events
  useEffect(() => {
    const handler = () => save();
    window.addEventListener('autosave', handler);
    return () => window.removeEventListener('autosave', handler);
  }, [save]);

  return { save };
}
