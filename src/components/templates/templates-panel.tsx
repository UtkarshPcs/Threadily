'use client';

import { useState } from 'react';
import { Plus, Trash2, Copy } from 'lucide-react';
import { useEditorStore } from '@/stores/editor-store';
import { Template } from '@/types';
import { generateId } from '@/lib/utils';

const defaultTemplates: Template[] = [
  { id: '1', user_id: '', name: 'Hook → Story → Lesson', category: 'storytelling', content: '🧵 [Hook that creates curiosity]\n\n---\n\nHere\'s the story:\n\n[Personal experience]\n\n---\n\nThe lesson:\n\n[Key takeaway]\n\n---\n\nIf this resonated, follow for more.', created_at: '' },
  { id: '2', user_id: '', name: 'Listicle Thread', category: 'hook', content: '[Number] [things/lessons/tips] I learned about [topic]:\n\n(A thread 🧵)\n\n---\n\n1. [Point]\n\n---\n\n2. [Point]\n\n---\n\n3. [Point]\n\n---\n\nThat\'s it. Save this for later.', created_at: '' },
  { id: '3', user_id: '', name: 'Contrarian Take', category: 'hook', content: 'Unpopular opinion:\n\n[Bold statement]\n\nHere\'s why 👇\n\n---\n\n[Reasoning]\n\n---\n\n[Evidence/example]\n\n---\n\nAgree or disagree? Let me know below.', created_at: '' },
  { id: '4', user_id: '', name: 'CTA Closer', category: 'cta', content: 'If you found this valuable:\n\n→ Follow @[handle] for more\n→ Repost to help others\n→ Save for reference\n\n[Optional: link or offer]', created_at: '' },
];

export function TemplatesPanel() {
  const [templates, setTemplates] = useState<Template[]>(defaultTemplates);
  const [newName, setNewName] = useState('');
  const [newContent, setNewContent] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const { blocks, setBlocks, pushUndo } = useEditorStore();

  function useTemplate(template: Template) {
    pushUndo();
    const parts = template.content.split('---').map(s => s.trim()).filter(Boolean);
    setBlocks(parts.map((content, i) => ({ id: generateId(), content, order: i, char_count: content.length })));
  }

  function saveAsTemplate() {
    if (!newName.trim()) return;
    const content = newContent || blocks.map(b => b.content).join('\n\n---\n\n');
    setTemplates([...templates, { id: generateId(), user_id: '', name: newName, category: 'custom', content, created_at: new Date().toISOString() }]);
    setNewName('');
    setNewContent('');
    setShowAdd(false);
  }

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--text-secondary)] uppercase">Templates</span>
        <button onClick={() => setShowAdd(!showAdd)} className="p-1 rounded hover:bg-[var(--bg-secondary)]">
          <Plus size={14} className="text-[var(--text-secondary)]" />
        </button>
      </div>

      {showAdd && (
        <div className="space-y-2 p-2 rounded-lg border border-[var(--border)]">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Template name"
            className="w-full px-2 py-1.5 rounded border border-[var(--border)] bg-[var(--bg)] text-xs text-[var(--text)] outline-none"
          />
          <button onClick={saveAsTemplate} className="w-full py-1.5 rounded bg-[var(--accent)] text-[var(--bg)] text-xs">
            Save Current as Template
          </button>
        </div>
      )}

      <div className="space-y-1.5">
        {templates.map(t => (
          <div key={t.id} className="group p-2.5 rounded-lg border border-[var(--border)] hover:border-[var(--text-secondary)]/30 cursor-pointer" onClick={() => useTemplate(t)}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--text)]">{t.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-secondary)] capitalize">{t.category}</span>
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] mt-1 line-clamp-2">{t.content.slice(0, 80)}...</p>
          </div>
        ))}
      </div>
    </div>
  );
}
