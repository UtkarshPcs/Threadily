'use client';

import { FileText, Layout, Lightbulb, BarChart3, Settings, Plus, LogOut } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useEditorStore } from '@/stores/editor-store';
import { useAuth } from '@/hooks/use-auth';

const tabs = [
  { id: 'drafts' as const, icon: FileText, label: 'Drafts' },
  { id: 'templates' as const, icon: Layout, label: 'Templates' },
  { id: 'ideas' as const, icon: Lightbulb, label: 'Ideas' },
  { id: 'analytics' as const, icon: BarChart3, label: 'Analytics' },
  { id: 'settings' as const, icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const { sidebarTab, setSidebarTab } = useUIStore();
  const { newDraft } = useEditorStore();
  const { signOut } = useAuth();

  return (
    <>
      <div className="p-3 border-b border-[var(--border)]">
        <button
          onClick={newDraft}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--accent)] text-[var(--bg)] text-sm font-medium hover:opacity-90"
        >
          <Plus size={16} /> New Thread
        </button>
      </div>

      <nav className="p-2 space-y-1">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setSidebarTab(id)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              sidebarTab === id
                ? 'bg-[var(--border)] text-[var(--text)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--border)]/50'
            }`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </nav>

      <div className="mt-auto p-2 border-t border-[var(--border)]">
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--border)]/50"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </>
  );
}
