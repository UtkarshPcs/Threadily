'use client';

import { useState, useEffect, Component, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { useUIStore } from '@/stores/ui-store';
import { useEditorStore } from '@/stores/editor-store';

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
const DraftsList = dynamic(() => import('@/components/drafts/drafts-list').then(m => ({ default: m.DraftsList })), { ssr: false });
const TemplatesPanel = dynamic(() => import('@/components/templates/templates-panel').then(m => ({ default: m.TemplatesPanel })), { ssr: false });
const IdeaInbox = dynamic(() => import('@/components/ui/idea-inbox').then(m => ({ default: m.IdeaInbox })), { ssr: false });
const AnalyticsDashboard = dynamic(() => import('@/components/ui/analytics-dashboard').then(m => ({ default: m.AnalyticsDashboard })), { ssr: false });
const AIAssistant = dynamic(() => import('@/components/ai/ai-assistant').then(m => ({ default: m.AIAssistant })), { ssr: false });
const SettingsPanel = dynamic(() => import('@/components/ui/settings-panel').then(m => ({ default: m.SettingsPanel })), { ssr: false });

function SidebarContent() {
  const { sidebarTab } = useUIStore();
  switch (sidebarTab) {
    case 'drafts': return <DraftsList />;
    case 'templates': return <TemplatesPanel />;
    case 'ideas': return <IdeaInbox />;
    case 'analytics': return <AnalyticsDashboard />;
    case 'settings': return <SettingsPanel />;
    default: return null;
  }
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const { sidebarTab, setSidebarTab } = useUIStore();
  const { newDraft } = useEditorStore();

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <div style={{ padding: 40, color: 'white', background: '#0a0a0a', minHeight: '100vh' }}>Loading...</div>;

  const tabs = ['drafts', 'templates', 'ideas', 'analytics', 'settings'] as const;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <ErrorCatch name="TopBar"><TopBar /></ErrorCatch>
      <div className="flex-1 flex overflow-hidden">
        <aside className="w-56 border-r border-[var(--border)] bg-[var(--bg-secondary)] flex flex-col h-full">
          <div className="p-3 border-b border-[var(--border)]">
            <button onClick={newDraft} className="w-full px-3 py-2 rounded-lg bg-white text-black text-sm font-medium">
              + New Thread
            </button>
          </div>
          <nav className="p-2 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setSidebarTab(tab)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm capitalize ${sidebarTab === tab ? 'bg-[var(--border)] text-[var(--text)]' : 'text-[var(--text-secondary)] hover:text-[var(--text)]'}`}
              >
                {tab}
              </button>
            ))}
          </nav>
          <div className="flex-1 overflow-y-auto">
            <ErrorCatch name="SidebarContent"><SidebarContent /></ErrorCatch>
          </div>
        </aside>
        <main className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <ErrorCatch name="ThreadEditor"><ThreadEditor /></ErrorCatch>
          </div>
          <div className="w-80 border-l border-[var(--border)] overflow-y-auto bg-[var(--bg-secondary)] flex flex-col">
            <ErrorCatch name="ThreadPreview"><ThreadPreview /></ErrorCatch>
            <div className="border-t border-[var(--border)]">
              <ErrorCatch name="AIAssistant"><AIAssistant /></ErrorCatch>
            </div>
          </div>
        </main>
      </div>
      <ErrorCatch name="PublishModal"><PublishModal /></ErrorCatch>
    </div>
  );
}
