import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Draft } from '@/types';

interface DraftsState {
  drafts: Draft[];
  searchQuery: string;
  filterTag: string | null;
  setDrafts: (drafts: Draft[]) => void;
  addDraft: (draft: Draft) => void;
  updateDraft: (id: string, updates: Partial<Draft>) => void;
  deleteDraft: (id: string) => void;
  duplicateDraft: (id: string) => void;
  setSearchQuery: (q: string) => void;
  setFilterTag: (tag: string | null) => void;
  filteredDrafts: () => Draft[];
}

export const useDraftsStore = create<DraftsState>()(
  persist(
    (set, get) => ({
      drafts: [],
      searchQuery: '',
      filterTag: null,

      setDrafts: (drafts) => set({ drafts }),
      addDraft: (draft) => set({ drafts: [draft, ...get().drafts] }),
      updateDraft: (id, updates) => set({
        drafts: get().drafts.map(d => d.id === id ? { ...d, ...updates, updated_at: new Date().toISOString() } : d),
      }),
      deleteDraft: (id) => set({ drafts: get().drafts.filter(d => d.id !== id) }),
      duplicateDraft: (id) => {
        const draft = get().drafts.find(d => d.id === id);
        if (!draft) return;
        const dup: Draft = { ...draft, id: crypto.randomUUID(), title: `${draft.title} (copy)`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        set({ drafts: [dup, ...get().drafts] });
      },
      setSearchQuery: (q) => set({ searchQuery: q }),
      setFilterTag: (tag) => set({ filterTag: tag }),
      filteredDrafts: () => {
        const { drafts, searchQuery, filterTag } = get();
        return drafts.filter(d => {
          const matchesSearch = !searchQuery || d.title.toLowerCase().includes(searchQuery.toLowerCase()) || d.blocks.some(b => b.content.toLowerCase().includes(searchQuery.toLowerCase()));
          const matchesTag = !filterTag || d.tags.includes(filterTag);
          return matchesSearch && matchesTag;
        });
      },
    }),
    { name: 'drafts-store' }
  )
);
