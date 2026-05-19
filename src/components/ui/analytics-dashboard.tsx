'use client';

import { useDraftsStore } from '@/stores/drafts-store';

export function AnalyticsDashboard() {
  const { drafts } = useDraftsStore();

  const published = drafts.filter(d => d.status === 'published').length;
  const totalBlocks = drafts.reduce((s, d) => s + d.blocks.length, 0);
  const totalChars = drafts.reduce((s, d) => s + d.blocks.reduce((bs, b) => bs + b.char_count, 0), 0);
  const avgLength = drafts.length ? Math.round(totalChars / drafts.length) : 0;

  // Writing streak (consecutive days with drafts)
  const dates = [...new Set(drafts.map(d => d.updated_at.split('T')[0]))].sort().reverse();
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  for (let i = 0; i < dates.length; i++) {
    const expected = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
    if (dates[i] === expected) streak++;
    else break;
  }

  const stats = [
    { label: 'Total Drafts', value: drafts.length },
    { label: 'Published', value: published },
    { label: 'Avg Length', value: `${avgLength} chars` },
    { label: 'Total Blocks', value: totalBlocks },
    { label: 'Writing Streak', value: `${streak} day${streak !== 1 ? 's' : ''}` },
    { label: 'Total Characters', value: totalChars.toLocaleString() },
  ];

  return (
    <div className="p-3 space-y-3">
      <span className="text-xs font-medium text-[var(--text-secondary)] uppercase">Analytics</span>

      <div className="grid grid-cols-2 gap-2">
        {stats.map(s => (
          <div key={s.label} className="p-3 rounded-lg border border-[var(--border)] bg-[var(--bg)]">
            <p className="text-lg font-bold text-[var(--text)]">{s.value}</p>
            <p className="text-[10px] text-[var(--text-secondary)]">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 rounded-lg border border-[var(--border)]">
        <p className="text-xs font-medium text-[var(--text)] mb-2">Recent Activity</p>
        {drafts.slice(0, 5).map(d => (
          <div key={d.id} className="flex items-center justify-between py-1.5 border-b border-[var(--border)] last:border-0">
            <span className="text-xs text-[var(--text)] truncate max-w-[120px]">{d.title}</span>
            <span className="text-[10px] text-[var(--text-secondary)]">{d.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
