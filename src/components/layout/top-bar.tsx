'use client';

import { Menu, Save, Send, Clock, Monitor, Smartphone } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useEditorStore } from '@/stores/editor-store';

export function TopBar() {
  const { toggleSidebar, setShowPublishModal } = useUIStore();
  const { previewMode, setPreviewMode, isSaving } = useEditorStore();

  return (
    <header className="h-12 border-b border-[var(--border)] bg-[var(--bg)] flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <button onClick={toggleSidebar} className="p-1.5 rounded-md hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
          <Menu size={18} />
        </button>
        <span className="text-sm font-semibold text-[var(--text)]">Threads Composer</span>
        {isSaving && <span className="text-xs text-[var(--text-secondary)]">Saving...</span>}
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

        <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]">
          <Clock size={14} /> Schedule
        </button>
        <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]">
          <Save size={14} /> Save
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
