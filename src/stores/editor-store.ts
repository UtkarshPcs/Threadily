import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ThreadBlock, Draft, PreviewMode, ThemeMode } from '@/types';
import { generateId } from '@/lib/utils';

interface EditorState {
  currentDraft: Draft | null;
  blocks: ThreadBlock[];
  previewMode: PreviewMode;
  themeMode: ThemeMode;
  isSaving: boolean;
  undoStack: ThreadBlock[][];
  redoStack: ThreadBlock[][];

  setDraft: (draft: Draft) => void;
  setBlocks: (blocks: ThreadBlock[]) => void;
  addBlock: (afterIndex?: number) => void;
  updateBlock: (id: string, content: string) => void;
  deleteBlock: (id: string) => void;
  duplicateBlock: (id: string) => void;
  splitBlock: (id: string, splitAt: number) => void;
  mergeBlocks: (id1: string, id2: string) => void;
  reorderBlocks: (fromIndex: number, toIndex: number) => void;
  setPreviewMode: (mode: PreviewMode) => void;
  setThemeMode: (mode: ThemeMode) => void;
  undo: () => void;
  redo: () => void;
  pushUndo: () => void;
  newDraft: () => void;
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      currentDraft: null,
      blocks: [{ id: generateId(), content: '', order: 0, char_count: 0 }],
      previewMode: 'mobile',
      themeMode: 'dark',
      isSaving: false,
      undoStack: [],
      redoStack: [],

      setDraft: (draft) => set({ currentDraft: draft, blocks: draft.blocks }),
      setBlocks: (blocks) => set({ blocks }),

      addBlock: (afterIndex) => {
        const { blocks, pushUndo } = get();
        pushUndo();
        const idx = afterIndex !== undefined ? afterIndex + 1 : blocks.length;
        const newBlock: ThreadBlock = { id: generateId(), content: '', order: idx, char_count: 0 };
        const updated = [...blocks];
        updated.splice(idx, 0, newBlock);
        set({ blocks: updated.map((b, i) => ({ ...b, order: i })) });
      },

      updateBlock: (id, content) => {
        const { blocks } = get();
        set({ blocks: blocks.map(b => b.id === id ? { ...b, content, char_count: content.length } : b) });
      },

      deleteBlock: (id) => {
        const { blocks, pushUndo } = get();
        if (blocks.length <= 1) return;
        pushUndo();
        set({ blocks: blocks.filter(b => b.id !== id).map((b, i) => ({ ...b, order: i })) });
      },

      duplicateBlock: (id) => {
        const { blocks, pushUndo } = get();
        pushUndo();
        const idx = blocks.findIndex(b => b.id === id);
        if (idx === -1) return;
        const dup: ThreadBlock = { ...blocks[idx], id: generateId(), order: idx + 1 };
        const updated = [...blocks];
        updated.splice(idx + 1, 0, dup);
        set({ blocks: updated.map((b, i) => ({ ...b, order: i })) });
      },

      splitBlock: (id, splitAt) => {
        const { blocks, pushUndo } = get();
        pushUndo();
        const idx = blocks.findIndex(b => b.id === id);
        if (idx === -1) return;
        const block = blocks[idx];
        const first = block.content.slice(0, splitAt);
        const second = block.content.slice(splitAt).trimStart();
        const updated = [...blocks];
        updated[idx] = { ...block, content: first, char_count: first.length };
        updated.splice(idx + 1, 0, { id: generateId(), content: second, order: idx + 1, char_count: second.length });
        set({ blocks: updated.map((b, i) => ({ ...b, order: i })) });
      },

      mergeBlocks: (id1, id2) => {
        const { blocks, pushUndo } = get();
        pushUndo();
        const b1 = blocks.find(b => b.id === id1);
        const b2 = blocks.find(b => b.id === id2);
        if (!b1 || !b2) return;
        const merged = b1.content + '\n' + b2.content;
        set({
          blocks: blocks
            .map(b => b.id === id1 ? { ...b, content: merged, char_count: merged.length } : b)
            .filter(b => b.id !== id2)
            .map((b, i) => ({ ...b, order: i })),
        });
      },

      reorderBlocks: (fromIndex, toIndex) => {
        const { blocks, pushUndo } = get();
        pushUndo();
        const updated = [...blocks];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);
        set({ blocks: updated.map((b, i) => ({ ...b, order: i })) });
      },

      setPreviewMode: (mode) => set({ previewMode: mode }),
      setThemeMode: (mode) => set({ themeMode: mode }),

      undo: () => {
        const { undoStack, blocks } = get();
        if (undoStack.length === 0) return;
        const prev = undoStack[undoStack.length - 1];
        set({ undoStack: undoStack.slice(0, -1), redoStack: [...get().redoStack, blocks], blocks: prev });
      },

      redo: () => {
        const { redoStack, blocks } = get();
        if (redoStack.length === 0) return;
        const next = redoStack[redoStack.length - 1];
        set({ redoStack: redoStack.slice(0, -1), undoStack: [...get().undoStack, blocks], blocks: next });
      },

      pushUndo: () => {
        const { blocks, undoStack } = get();
        set({ undoStack: [...undoStack.slice(-20), blocks], redoStack: [] });
      },

      newDraft: () => {
        set({
          currentDraft: null,
          blocks: [{ id: generateId(), content: '', order: 0, char_count: 0 }],
          undoStack: [],
          redoStack: [],
        });
      },
    }),
    { name: 'editor-store', partialize: (state) => ({ blocks: state.blocks, currentDraft: state.currentDraft }) }
  )
);
