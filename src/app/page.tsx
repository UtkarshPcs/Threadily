'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { TopBar } from '@/components/layout/top-bar';
import { ThreadEditor } from '@/components/editor/thread-editor';
import { ThreadPreview } from '@/components/preview/thread-preview';
import { DraftsList } from '@/components/drafts/drafts-list';
import { TemplatesPanel } from '@/components/templates/templates-panel';
import { IdeaInbox } from '@/components/ui/idea-inbox';
import { AnalyticsDashboard } from '@/components/ui/analytics-dashboard';
import { AIAssistant } from '@/components/ai/ai-assistant';
import { PublishModal } from '@/components/ui/publish-modal';
import { useUIStore } from '@/stores/ui-store';

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
  const [mounted, setMounted] = useState(false);
  const { sidebarOpen } = useUIStore();

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg)]">
        <p className="text-sm text-[var(--text-secondary)]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TopBar />
      <div className="flex-1 flex overflow-hidden">
        {sidebarOpen && (
          <aside className="w-56 border-r border-[var(--border)] bg-[var(--bg-secondary)] flex flex-col h-full">
            <Sidebar />
            <div className="flex-1 overflow-y-auto">
              <SidebarContent />
            </div>
          </aside>
        )}
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
