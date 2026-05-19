'use client';

import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    setStep(1);
    // Test if stores work
    try {
      const { useUIStore } = require('@/stores/ui-store');
      useUIStore.getState();
      setStep(2);
    } catch (e: any) {
      setError(`Store error: ${e.message}`);
      return;
    }

    try {
      const { useEditorStore } = require('@/stores/editor-store');
      useEditorStore.getState();
      setStep(3);
    } catch (e: any) {
      setError(`Editor store error: ${e.message}`);
      return;
    }
  }, []);

  if (error) {
    return (
      <div style={{ padding: 40, color: 'white', background: 'black', minHeight: '100vh' }}>
        <h1>Debug Error</h1>
        <p style={{ color: 'red' }}>{error}</p>
        <p>Step reached: {step}</p>
      </div>
    );
  }

  if (step < 3) {
    return (
      <div style={{ padding: 40, color: 'white', background: 'black', minHeight: '100vh' }}>
        <p>Loading step {step}...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 40, color: 'white', background: 'black', minHeight: '100vh' }}>
      <h1>✅ Page loaded successfully!</h1>
      <p>All stores initialized. Step: {step}</p>
      <p>If you see this, the base app works. The issue is in a component.</p>
    </div>
  );
}
