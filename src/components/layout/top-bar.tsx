'use client';

import { useState } from 'react';
import { Menu, Save, Send, Clock, Monitor, Smartphone, Check } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useEditorStore } from '@/stores/editor-store';
import { useDraftsStore } from '@/stores/drafts-store';
import { generateId } from '@/lib/utils';
import { Draft } from '@/types';

export function TopBar() {
  const { toggleSidebar, setShowPublishModal } = useUIStore();
  const { previewMode, setPreviewMode, blocks, currentDraft } = useEditorStore();
  const { addDraft, updateDraft } = useDraftsStore();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    const now = new Date().toISOString();
    const title = blocks[0]?.content.slice(0, 50) || 'Untitled Thread';

    if (currentDraft) {
      updateDraft(currentDraft.id, { blocks, updated_at: now, title, version: currentDraft.version + 1 });
    } else {
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

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <header className="h-12 border-b border-[var(--border)] bg-[var(--bg)] flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <button onClick={toggleSidebar} className="p-1.5 rounded-md hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
          <Menu size={18} />
        </button>
        <span className="text-sm font-semibold text-[var(--text)]">Threads Composer</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center border border-[var(--border)] rounded-lg overflow-hidden">
          <button
            onClick={() => setPreviewMode('mobile')}
            className={`p-1.5 ${previewMode === 'mobile' ? 'bg-[var(--border)]' : ''}`}
            title="Mobile preview"
          >
            <Smartphone size={14} />
          </button>
          <button
            onClick={() => setPreviewMode('desktop')}
            className={`p-1.5 ${previewMode === 'desktop' ? 'bg-[var(--border)]' : ''}`}
            title="Desktop preview"
          >
            <Monitor size={14} />
          </button>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
        >
          {saved ? <Check size={14} className="text-[var(--success)]" /> : <Save size={14} />}
          {saved ? 'Saved!' : 'Save'}
        </button>
        <button
          onClick={() => setShowPublishModal(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-[var(--bg)] text-xs font-medium hover:opacity-90"
        >
          <Send size={14} /> Publish
        </button>
      </div>
    </header>
  );
}
