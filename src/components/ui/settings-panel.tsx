'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, ExternalLink } from 'lucide-react';

export function SettingsPanel() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/threads/status')
      .then(r => r.json())
      .then(d => { setConnected(d.connected); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-3 space-y-4">
      <span className="text-xs font-medium text-[var(--text-secondary)] uppercase">Settings</span>

      {/* Threads Connection */}
      <div className="p-3 rounded-lg border border-[var(--border)]">
        <p className="text-sm font-medium text-[var(--text)] mb-2">Threads Account</p>
        {loading ? (
          <p className="text-xs text-[var(--text-secondary)]">Checking...</p>
        ) : connected ? (
          <div className="flex items-center gap-2">
            <CheckCircle size={14} className="text-[var(--success)]" />
            <span className="text-xs text-[var(--success)]">Connected</span>
          </div>
        ) : (
          <a
            href="/api/threads/connect"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--accent)] text-[var(--bg)] text-xs font-medium hover:opacity-90"
          >
            <ExternalLink size={12} /> Connect Threads Account
          </a>
        )}
      </div>

      {/* Export */}
      <div className="p-3 rounded-lg border border-[var(--border)]">
        <p className="text-sm font-medium text-[var(--text)] mb-2">Export</p>
        <p className="text-xs text-[var(--text-secondary)]">Use the Publish modal to copy or export your threads.</p>
      </div>
    </div>
  );
}
