import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(' ');
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function estimateReadingTime(text: string): number {
  const words = text.split(/\s+/).length;
  return Math.ceil(words / 200);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}
