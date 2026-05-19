import { ThreadBlock } from '@/types';
import { APP_CONFIG } from '@/config';
import { generateId } from '@/lib/utils';

const MAX = APP_CONFIG.maxCharsPerBlock;

/**
 * Intelligently splits text into Threads-compatible chunks.
 * Priority: paragraph breaks > sentence endings > bullet points > word boundaries
 */
export function autoSplitText(text: string): ThreadBlock[] {
  if (text.length <= MAX) {
    return [{ id: generateId(), content: text.trim(), order: 0, char_count: text.trim().length }];
  }

  const blocks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= MAX) {
      blocks.push(remaining.trim());
      break;
    }

    const chunk = remaining.slice(0, MAX);
    const splitPoint = findBestSplitPoint(chunk);
    blocks.push(remaining.slice(0, splitPoint).trim());
    remaining = remaining.slice(splitPoint).trim();
  }

  return blocks.map((content, i) => ({
    id: generateId(),
    content,
    order: i,
    char_count: content.length,
  }));
}

function findBestSplitPoint(text: string): number {
  // 1. Try paragraph break (double newline)
  const paraBreak = text.lastIndexOf('\n\n');
  if (paraBreak > text.length * 0.3) return paraBreak;

  // 2. Try single newline
  const newline = text.lastIndexOf('\n');
  if (newline > text.length * 0.5) return newline;

  // 3. Try sentence ending (. ! ?)
  const sentenceEnd = findLastSentenceEnd(text);
  if (sentenceEnd > text.length * 0.3) return sentenceEnd + 1;

  // 4. Try bullet point / list item
  const bullet = text.lastIndexOf('\n-');
  if (bullet > text.length * 0.3) return bullet;
  const numbered = text.lastIndexOf('\n•');
  if (numbered > text.length * 0.3) return numbered;

  // 5. Try comma or semicolon
  const comma = text.lastIndexOf(', ');
  if (comma > text.length * 0.5) return comma + 1;

  // 6. Try word boundary (space)
  const space = text.lastIndexOf(' ');
  if (space > text.length * 0.5) return space;

  // 7. Hard cut (last resort)
  return text.length;
}

function findLastSentenceEnd(text: string): number {
  let lastEnd = -1;
  for (let i = text.length - 1; i >= Math.floor(text.length * 0.3); i--) {
    if ((text[i] === '.' || text[i] === '!' || text[i] === '?') &&
        (i + 1 >= text.length || text[i + 1] === ' ' || text[i + 1] === '\n')) {
      // Avoid splitting on abbreviations like "e.g." or "Dr."
      if (text[i] === '.' && i > 0 && text[i - 1] === text[i - 1].toUpperCase() && i - 1 > 0 && text[i - 2] === '.') continue;
      lastEnd = i;
      break;
    }
  }
  return lastEnd;
}

/**
 * Splits a single block into multiple if it exceeds the limit.
 * Returns the original block if within limit.
 */
export function splitBlockIfNeeded(block: ThreadBlock): ThreadBlock[] {
  if (block.content.length <= MAX) return [block];
  return autoSplitText(block.content);
}

/**
 * Auto-splits all blocks that exceed the character limit.
 */
export function autoSplitAllBlocks(blocks: ThreadBlock[]): ThreadBlock[] {
  const result: ThreadBlock[] = [];
  for (const block of blocks) {
    const split = splitBlockIfNeeded(block);
    result.push(...split);
  }
  return result.map((b, i) => ({ ...b, order: i }));
}
