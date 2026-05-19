'use client';

import dynamic from 'next/dynamic';

const Sidebar = dynamic(() => import('@/components/layout/sidebar').then(m => ({ default: m.Sidebar })), { ssr: false });
const TopBar = dynamic(() => import('@/components/layout/top-bar').then(m => ({ default: m.TopBar })), { ssr: false });
const ThreadEditor = dynamic(() => import('@/components/editor/thread-editor').then(m => ({ default: m.ThreadEditor })), { ssr: false });
const ThreadPreview = dynamic(() => import('@/components/preview/thread-preview').then(m => ({ default: m.ThreadPreview })), { ssr: false });
const PublishModal = dynamic(() => import('@/components/ui/publish-modal').then(m => ({ default: m.PublishModal })), { ssr: false });

export default function DashboardPage() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TopBar />
      <div className="flex-1 flex overflow-hidden">
        <aside className="w-56 border-r border-[var(--border)] bg-[var(--bg-secondary)] flex flex-col h-full">
          <Sidebar />
        </aside>
        <main className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <ThreadEditor />
          </div>
          <div className="w-80 border-l border-[var(--border)] overflow-y-auto bg-[var(--bg-secondary)]">
            <ThreadPreview />
          </div>
        </main>
      </div>
      <PublishModal />
    </div>
  );
}
