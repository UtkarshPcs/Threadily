import { ThreadBlock } from '@/types';

export function exportAsMarkdown(blocks: ThreadBlock[], title: string): string {
  let md = `# ${title}\n\n`;
  blocks.forEach((b, i) => {
    md += `## Post ${i + 1}\n\n${b.content}\n\n---\n\n`;
  });
  return md;
}

export function exportAsText(blocks: ThreadBlock[]): string {
  return blocks.map((b, i) => `[${i + 1}/${blocks.length}]\n${b.content}`).join('\n\n---\n\n');
}

export function exportAsJSON(blocks: ThreadBlock[], title: string): string {
  return JSON.stringify({ title, blocks: blocks.map(b => ({ content: b.content, order: b.order })) }, null, 2);
}

export function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportThread(blocks: ThreadBlock[], title: string, format: 'md' | 'txt' | 'json') {
  const exporters = {
    md: () => downloadFile(exportAsMarkdown(blocks, title), `${title}.md`, 'text/markdown'),
    txt: () => downloadFile(exportAsText(blocks), `${title}.txt`, 'text/plain'),
    json: () => downloadFile(exportAsJSON(blocks, title), `${title}.json`, 'application/json'),
  };
  exporters[format]();
}
