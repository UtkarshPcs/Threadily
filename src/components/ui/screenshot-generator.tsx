'use client';

import { useRef } from 'react';
import { Camera, Download } from 'lucide-react';
import { useEditorStore } from '@/stores/editor-store';

export function ScreenshotGenerator() {
  const { blocks } = useEditorStore();
  const captureRef = useRef<HTMLDivElement>(null);

  async function generateScreenshot() {
    if (!captureRef.current) return;
    // Use html2canvas dynamically
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(captureRef.current, {
      backgroundColor: '#000000',
      scale: 2,
    });
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'thread-screenshot.png';
    a.click();
  }

  const validBlocks = blocks.filter(b => b.content.trim());

  return (
    <div className="space-y-3">
      <button
        onClick={generateScreenshot}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
      >
        <Camera size={14} /> Generate Screenshot
      </button>

      {/* Hidden capture area */}
      <div ref={captureRef} className="p-8 bg-gradient-to-br from-gray-900 to-black rounded-2xl" style={{ width: 600 }}>
        <div className="space-y-4">
          {validBlocks.map((block, i) => (
            <div key={block.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0" />
                {i < validBlocks.length - 1 && <div className="w-0.5 flex-1 mt-1 bg-gray-800" />}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-white">You</span>
                  <span className="text-xs text-gray-500">now</span>
                </div>
                <p className="text-sm text-gray-100 whitespace-pre-wrap">{block.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
