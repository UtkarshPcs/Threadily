'use client';

import { useState } from 'react';
import { Plus, Trash2, ArrowRight } from 'lucide-react';
import { useEditorStore } from '@/stores/editor-store';
import { generateId } from '@/lib/utils';

interface Idea {
  id: string;
  content: string;
  created_at: string;
}

export function IdeaInbox() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [newIdea, setNewIdea] = useState('');
  const { blocks, updateBlock, addBlock, pushUndo } = useEditorStore();

  function addIdea() {
    if (!newIdea.trim()) return;
    setIdeas([{ id: generateId(), content: newIdea, created_at: new Date().toISOString() }, ...ideas]);
    setNewIdea('');
  }

  function deleteIdea(id: string) {
    setIdeas(ideas.filter(i => i.id !== id));
  }

  function useIdea(idea: Idea) {
    pushUndo();
    // Add to first empty block or create new
    const emptyBlock = blocks.find(b => !b.content.trim());
    if (emptyBlock) {
      updateBlock(emptyBlock.id, idea.content);
    } else {
      addBlock();
      // Will be added to last block
      setTimeout(() => {
        const store = useEditorStore.getState();
        const last = store.blocks[store.blocks.length - 1];
        if (last) store.updateBlock(last.id, idea.content);
      }, 0);
    }
    deleteIdea(idea.id);
  }

  return (
    <div className="p-3 space-y-3">
      <span className="text-xs font-medium text-[var(--text-secondary)] uppercase">Idea Inbox</span>

      <div className="flex gap-2">
        <input
          value={newIdea}
          onChange={(e) => setNewIdea(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addIdea()}
          placeholder="Quick idea..."
          className="flex-1 px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-xs text-[var(--text)] outline-none"
        />
        <button onClick={addIdea} className="p-1.5 rounded-lg bg-[var(--accent)] text-[var(--bg)]">
          <Plus size={14} />
        </button>
      </div>

      <div className="space-y-1.5">
        {ideas.length === 0 && (
          <p className="text-xs text-[var(--text-secondary)] text-center py-4">No ideas yet. Capture them here!</p>
        )}
        {ideas.map(idea => (
          <div key={idea.id} className="group flex items-start gap-2 p-2 rounded-lg border border-[var(--border)] hover:border-[var(--text-secondary)]/30">
            <p className="flex-1 text-xs text-[var(--text)]">{idea.content}</p>
            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100">
              <button onClick={() => useIdea(idea)} className="p-1 rounded hover:bg-[var(--bg-secondary)]" title="Use in editor">
                <ArrowRight size={11} className="text-[var(--success)]" />
              </button>
              <button onClick={() => deleteIdea(idea.id)} className="p-1 rounded hover:bg-[var(--bg-secondary)]" title="Delete">
                <Trash2 size={11} className="text-[var(--danger)]" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
