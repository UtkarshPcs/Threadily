'use client';

import { useState } from 'react';
import { Search, Copy, Trash2, Archive, Tag } from 'lucide-react';
import { useDraftsStore } from '@/stores/drafts-store';
import { useEditorStore } from '@/stores/editor-store';
import { Draft } from '@/types';
import { formatDate } from '@/lib/utils';

export function DraftsList() {
  const { drafts, searchQuery, setSearchQuery, deleteDraft, duplicateDraft, updateDraft } = useDraftsStore();
  const { setDraft } = useEditorStore();
  const filteredDrafts = useDraftsStore(s => s.filteredDrafts());

  function handleOpen(draft: Draft) {
    setDraft(draft);
  }

  function handleArchive(id: string) {
    updateDraft(id, { status: 'archived' as Draft['status'] });
  }

  const activeDrafts = filteredDrafts.filter(d => d.status !== 'archived');
  const archivedDrafts = filteredDrafts.filter(d => d.status === 'archived');

  return (
    <div className="p-3 space-y-3">
      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-2.5 top-2.5 text-[var(--text-secondary)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search drafts..."
          className="w-full pl-8 pr-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-xs text-[var(--text)] outline-none focus:ring-1 focus:ring-[var(--accent)]"
        />
      </div>

      {/* Draft list */}
      <div className="space-y-1">
        {activeDrafts.length === 0 && (
          <p className="text-xs text-[var(--text-secondary)] text-center py-4">No drafts yet</p>
        )}
        {activeDrafts.map(draft => (
          <DraftItem
            key={draft.id}
            draft={draft}
            onOpen={() => handleOpen(draft)}
            onDuplicate={() => duplicateDraft(draft.id)}
            onArchive={() => handleArchive(draft.id)}
            onDelete={() => deleteDraft(draft.id)}
          />
        ))}
      </div>

      {/* Archived section */}
      {archivedDrafts.length > 0 && (
        <details className="mt-4">
          <summary className="text-xs text-[var(--text-secondary)] cursor-pointer">
            Archived ({archivedDrafts.length})
          </summary>
          <div className="mt-2 space-y-1">
            {archivedDrafts.map(draft => (
              <DraftItem
                key={draft.id}
                draft={draft}
                onOpen={() => handleOpen(draft)}
                onDuplicate={() => duplicateDraft(draft.id)}
                onArchive={() => updateDraft(draft.id, { status: 'draft' })}
                onDelete={() => deleteDraft(draft.id)}
              />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function DraftItem({ draft, onOpen, onDuplicate, onArchive, onDelete }: {
  draft: Draft;
  onOpen: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      onClick={onOpen}
      className="group p-2.5 rounded-lg hover:bg-[var(--border)]/50 cursor-pointer transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text)] truncate">{draft.title}</p>
          <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">
            {draft.blocks[0]?.content.slice(0, 60) || 'Empty'}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-[var(--text-secondary)]">{formatDate(draft.updated_at)}</span>
            <span className="text-[10px] text-[var(--text-secondary)]">v{draft.version}</span>
            {draft.tags.map(tag => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--border)] text-[var(--text-secondary)]">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          <button onClick={onDuplicate} className="p-1 rounded hover:bg-[var(--bg-secondary)]" title="Duplicate">
            <Copy size={11} className="text-[var(--text-secondary)]" />
          </button>
          <button onClick={onArchive} className="p-1 rounded hover:bg-[var(--bg-secondary)]" title="Archive">
            <Archive size={11} className="text-[var(--text-secondary)]" />
          </button>
          <button onClick={onDelete} className="p-1 rounded hover:bg-[var(--bg-secondary)]" title="Delete">
            <Trash2 size={11} className="text-[var(--danger)]" />
          </button>
        </div>
      </div>
    </div>
  );
}
