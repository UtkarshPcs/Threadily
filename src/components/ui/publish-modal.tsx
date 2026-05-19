'use client';

import { useState } from 'react';
import { X, Send, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useEditorStore } from '@/stores/editor-store';

export function PublishModal() {
  const { showPublishModal, setShowPublishModal } = useUIStore();
  const { blocks, currentDraft } = useEditorStore();
  const [status, setStatus] = useState<'idle' | 'publishing' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [mode, setMode] = useState<'now' | 'schedule'>('now');

  if (!showPublishModal) return null;

  const validBlocks = blocks.filter(b => b.content.trim());

  async function handlePublish() {
    setStatus('publishing');
    setError('');

    try {
      const endpoint = mode === 'now' ? '/api/threads/publish' : '/api/threads/schedule';
      const body = mode === 'now'
        ? { blocks: validBlocks.map(b => ({ content: b.content })), draftId: currentDraft?.id }
        : { draftId: currentDraft?.id, scheduledAt: scheduleDate };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatus('success');
      setTimeout(() => { setShowPublishModal(false); setStatus('idle'); }, 2000);
    } catch (err: any) {
      setError(err.message);
      setStatus('error');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[var(--bg)] border border-[var(--border)] rounded-xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--text)]">Publish Thread</h2>
          <button onClick={() => setShowPublishModal(false)} className="p-1 rounded hover:bg-[var(--bg-secondary)]">
            <X size={18} />
          </button>
        </div>

        {/* Summary */}
        <div className="mb-4 p-3 rounded-lg bg-[var(--bg-secondary)] text-sm">
          <p className="text-[var(--text)]">{validBlocks.length} post{validBlocks.length !== 1 ? 's' : ''} in thread</p>
          <p className="text-[var(--text-secondary)] text-xs mt-1">
            {validBlocks.reduce((s, b) => s + b.char_count, 0)} total characters
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode('now')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium ${mode === 'now' ? 'bg-[var(--accent)] text-[var(--bg)]' : 'border border-[var(--border)] text-[var(--text-secondary)]'}`}
          >
            <Send size={14} className="inline mr-1" /> Publish Now
          </button>
          <button
            onClick={() => setMode('schedule')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium ${mode === 'schedule' ? 'bg-[var(--accent)] text-[var(--bg)]' : 'border border-[var(--border)] text-[var(--text-secondary)]'}`}
          >
            <Clock size={14} className="inline mr-1" /> Schedule
          </button>
        </div>

        {mode === 'schedule' && (
          <input
            type="datetime-local"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
            className="w-full mb-4 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-sm text-[var(--text)]"
          />
        )}

        {/* Status messages */}
        {status === 'error' && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
            <AlertTriangle size={14} className="text-[var(--danger)]" />
            <span className="text-xs text-[var(--danger)]">{error}</span>
          </div>
        )}
        {status === 'success' && (
          <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2">
            <CheckCircle size={14} className="text-[var(--success)]" />
            <span className="text-xs text-[var(--success)]">
              {mode === 'now' ? 'Published successfully!' : 'Scheduled successfully!'}
            </span>
          </div>
        )}

        {/* Publish button */}
        <button
          onClick={handlePublish}
          disabled={status === 'publishing' || validBlocks.length === 0 || (mode === 'schedule' && !scheduleDate)}
          className="w-full py-2.5 rounded-lg bg-[var(--accent)] text-[var(--bg)] text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {status === 'publishing' ? 'Publishing...' : mode === 'now' ? 'Confirm & Publish' : 'Confirm & Schedule'}
        </button>
      </div>
    </div>
  );
}
