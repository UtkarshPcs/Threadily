'use client';

import { useState, useEffect, Component, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { useUIStore } from '@/stores/ui-store';
import { useEditorStore } from '@/stores/editor-store';

// Error boundary
class ErrorCatch extends Component<{ name: string; children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null };
  static getDerivedStateFromError(e: Error) { return { error: e.message }; }
  render() {
    if (this.state.error) return <div style={{ padding: 8, color: 'red', fontSize: 12 }}>❌ {this.props.name}: {this.state.error}</div>;
    return this.props.children;
  }
}

const TopBar = dynamic(() => import('@/components/layout/top-bar').then(m => ({ default: m.TopBar })), { ssr: false });
const ThreadEditor = dynamic(() => import('@/components/editor/thread-editor').then(m => ({ default: m.ThreadEditor })), { ssr: false });
const ThreadPreview = dynamic(() => import('@/components/preview/thread-preview').then(m => ({ default: m.ThreadPreview })), { ssr: false });
const PublishModal = dynamic(() => import('@/components/ui/publish-modal').then(m => ({ default: m.PublishModal })), { ssr: false });

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const { sidebarOpen } = useUIStore();

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <div style={{ padding: 40, color: 'white', background: '#0a0a0a', minHeight: '100vh' }}>Loading...</div>;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <ErrorCatch name="TopBar"><TopBar /></ErrorCatch>
      <div className="flex-1 flex overflow-hidden">
        <aside className="w-56 border-r border-[var(--border)] bg-[var(--bg-secondary)] flex flex-col h-full p-3">
          <SidebarSimple />
        </aside>
        <main className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <ErrorCatch name="ThreadEditor"><ThreadEditor /></ErrorCatch>
          </div>
          <div className="w-80 border-l border-[var(--border)] overflow-y-auto bg-[var(--bg-secondary)]">
            <ErrorCatch name="ThreadPreview"><ThreadPreview /></ErrorCatch>
          </div>
        </main>
      </div>
      <ErrorCatch name="PublishModal"><PublishModal /></ErrorCatch>
    </div>
  );
}

// Inline simple sidebar to avoid useAuth crash
function SidebarSimple() {
  const { sidebarTab, setSidebarTab } = useUIStore();
  const { newDraft } = useEditorStore();

  const tabs = ['drafts', 'templates', 'ideas', 'analytics', 'settings'] as const;

  return (
    <div className="space-y-2">
      <button onClick={newDraft} className="w-full px-3 py-2 rounded-lg bg-white text-black text-sm font-medium">
        + New Thread
      </button>
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => setSidebarTab(tab)}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm capitalize ${sidebarTab === tab ? 'bg-[var(--border)] text-[var(--text)]' : 'text-[var(--text-secondary)]'}`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
