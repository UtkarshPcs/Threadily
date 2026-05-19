'use client';

import { useState } from 'react';
import { X, Lock } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';

interface PinModalProps {
  onVerified: () => void;
}

export function PinModal({ onVerified }: PinModalProps) {
  const { showPinModal, setShowPinModal } = useUIStore();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  if (!showPinModal) return null;

  async function handleVerify() {
    // Verify PIN against stored hash
    const res = await fetch('/api/auth/verify-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });

    if (res.ok) {
      setShowPinModal(false);
      setPin('');
      onVerified();
    } else {
      setError('Incorrect PIN');
      setPin('');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-xs bg-[var(--bg)] border border-[var(--border)] rounded-xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-[var(--text-secondary)]" />
            <h2 className="text-sm font-semibold text-[var(--text)]">Enter PIN to publish</h2>
          </div>
          <button onClick={() => setShowPinModal(false)} className="p-1 rounded hover:bg-[var(--bg-secondary)]">
            <X size={16} />
          </button>
        </div>

        <input
          type="password"
          maxLength={6}
          value={pin}
          onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setError(''); }}
          onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
          placeholder="••••••"
          className="w-full text-center text-2xl tracking-[0.5em] px-3 py-3 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text)] outline-none"
          autoFocus
        />

        {error && <p className="text-xs text-[var(--danger)] mt-2 text-center">{error}</p>}

        <button
          onClick={handleVerify}
          disabled={pin.length < 4}
          className="w-full mt-4 py-2 rounded-lg bg-[var(--accent)] text-[var(--bg)] text-sm font-medium disabled:opacity-50"
        >
          Verify
        </button>
      </div>
    </div>
  );
}
