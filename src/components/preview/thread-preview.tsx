'use client';

import { useEditorStore } from '@/stores/editor-store';
import { Sun, Moon } from 'lucide-react';

export function ThreadPreview() {
  const { blocks, previewMode, themeMode, setThemeMode } = useEditorStore();
  const isMobile = previewMode === 'mobile';
  const isDark = themeMode === 'dark';

  return (
    <div className="h-full flex flex-col">
      {/* Preview header */}
      <div className="flex items-center justify-between p-3 border-b border-[var(--border)]">
        <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">
          {isMobile ? 'Mobile' : 'Desktop'} Preview
        </span>
        <button
          onClick={() => setThemeMode(isDark ? 'light' : 'dark')}
          className="p-1.5 rounded-md hover:bg-[var(--border)]"
          title="Toggle theme"
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>

      {/* Preview content */}
      <div className="flex-1 overflow-y-auto p-4 flex justify-center">
        <div className={`${isMobile ? 'w-[375px]' : 'w-full max-w-[600px]'}`}>
          <div className={`rounded-2xl overflow-hidden ${isDark ? 'bg-black' : 'bg-white'} ${isMobile ? 'border border-gray-800 shadow-2xl' : ''}`}>
            {/* Phone notch (mobile only) */}
            {isMobile && (
              <div className={`h-6 flex items-center justify-center ${isDark ? 'bg-black' : 'bg-white'}`}>
                <div className="w-20 h-4 rounded-full bg-gray-900" />
              </div>
            )}

            {/* Thread posts */}
            <div className={`${isMobile ? 'px-4 py-3' : 'px-6 py-4'}`}>
              {blocks.filter(b => b.content.trim()).map((block, index) => (
                <ThreadPost
                  key={block.id}
                  content={block.content}
                  index={index}
                  isLast={index === blocks.filter(b => b.content.trim()).length - 1}
                  isDark={isDark}
                  isMobile={isMobile}
                />
              ))}

              {blocks.every(b => !b.content.trim()) && (
                <div className={`text-center py-12 text-sm ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                  Start typing to see preview...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ThreadPost({ content, index, isLast, isDark, isMobile }: {
  content: string;
  index: number;
  isLast: boolean;
  isDark: boolean;
  isMobile: boolean;
}) {
  return (
    <div className="flex gap-3">
      {/* Avatar + thread line */}
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex-shrink-0 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
        {!isLast && (
          <div className={`w-0.5 flex-1 mt-1 ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`} />
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 ${isLast ? 'pb-4' : 'pb-6'}`}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
            You
          </span>
          <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            now
          </span>
        </div>

        {/* Post content */}
        <div className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${isDark ? 'text-gray-100' : 'text-gray-900'} ${isMobile ? 'text-[15px]' : 'text-[15px]'}`}>
          {content}
        </div>

        {/* Engagement bar */}
        <div className={`flex items-center gap-4 mt-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          <ThreadIcon type="heart" />
          <ThreadIcon type="comment" />
          <ThreadIcon type="repost" />
          <ThreadIcon type="share" />
        </div>
      </div>
    </div>
  );
}

function ThreadIcon({ type }: { type: 'heart' | 'comment' | 'repost' | 'share' }) {
  const icons = {
    heart: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    comment: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
    repost: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
    ),
    share: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
      </svg>
    ),
  };
  return <button className="hover:opacity-70 transition-opacity">{icons[type]}</button>;
}
