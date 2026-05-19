'use client';

import dynamic from 'next/dynamic';
import { useUIStore } from '@/stores/ui-store';

const Sidebar = dynamic(() => import('@/components/layout/sidebar').then(m => ({ default: m.Sidebar })), { ssr: false });
const TopBar = dynamic(() => import('@/components/layout/top-bar').then(m => ({ default: m.TopBar })), { ssr: false });
const ThreadEditor = dynamic(() => import('@/components/editor/thread-editor').then(m => ({ default: m.ThreadEditor })), { ssr: false });
const ThreadPreview = dynamic(() => import('@/components/preview/thread-preview').then(m => ({ default: m.ThreadPreview })), { ssr: false });
const PublishModal = dynamic(() => import('@/components/ui/publish-modal').then(m => ({ default: m.PublishModal })), { ssr: false });
const DraftsList = dynamic(() => import('@/components/drafts/drafts-list').then(m => ({ default: m.DraftsList })), { ssr: false });
const TemplatesPanel = dynamic(() => import('@/components/templates/templates-panel').then(m => ({ default: m.TemplatesPanel })), { ssr: false });
const IdeaInbox = dynamic(() => import('@/components/ui/idea-inbox').then(m => ({ default: m.IdeaInbox })), { ssr: false });
const AnalyticsDashboard = dynamic(() => import('@/components/ui/analytics-dashboard').then(m => ({ default: m.AnalyticsDashboard })), { ssr: false });
const AIAssistant = dynamic(() => import('@/components/ai/ai-assistant').then(m => ({ default: m.AIAssistant })), { ssr: false });

function SidebarContent() {
  const { sidebarTab } = useUIStore();
  switch (sidebarTab) {
    case 'drafts': return <DraftsList />;
    case 'templates': return <TemplatesPanel />;
    case 'ideas': return <IdeaInbox />;
    case 'analytics': return <AnalyticsDashboard />;
    default: return <div className="p-3 text-xs text-[var(--text-secondary)]">Settings coming soon</div>;
  }
}

export default function DashboardPage() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TopBar />
      <div className="flex-1 flex overflow-hidden">
        <aside className="w-56 border-r border-[var(--border)] bg-[var(--bg-secondary)] flex flex-col h-full">
          <Sidebar />
          <div className="flex-1 overflow-y-auto">
            <SidebarContent />
          </div>
        </aside>
        <main className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <ThreadEditor />
          </div>
          <div className="w-80 border-l border-[var(--border)] overflow-y-auto bg-[var(--bg-secondary)] flex flex-col">
            <ThreadPreview />
            <div className="border-t border-[var(--border)]">
              <AIAssistant />
            </div>
          </div>
        </main>
      </div>
      <PublishModal />
    </div>
  );
}
