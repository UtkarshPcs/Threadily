import { AITone } from '@/types';

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';

async function callGroq(systemPrompt: string, userPrompt: string): Promise<string> {
  const res = await fetch(GROQ_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 1000,
    }),
  });

  if (!res.ok) throw new Error('AI request failed');
  const data = await res.json();
  return data.choices[0]?.message?.content || '';
}

export async function rewriteText(text: string, action: string): Promise<string> {
  const prompts: Record<string, string> = {
    'improve_hook': 'Rewrite this as a stronger, more attention-grabbing hook for social media. Keep it concise.',
    'shorten': 'Make this shorter and punchier while keeping the core message. Remove filler words.',
    'make_viral': 'Rewrite this to be more shareable and viral. Use power words, create curiosity.',
    'improve_clarity': 'Rewrite this for maximum clarity. Simple words, short sentences.',
    'simplify': 'Simplify this text. Use everyday language a 12-year-old would understand.',
    'add_cta': 'Add a compelling call-to-action at the end of this text.',
    'stronger_ending': 'Rewrite the ending to be more impactful and memorable.',
  };

  return callGroq(
    'You are a social media writing expert. Return ONLY the rewritten text, no explanations.',
    `${prompts[action] || 'Improve this text.'}\n\nText: ${text}`
  );
}

export async function expandThread(idea: string): Promise<string[]> {
  const result = await callGroq(
    'You are a Threads content strategist. Given a short idea, expand it into a full thread (3-7 posts). Each post should be under 500 characters. Return posts separated by ---.',
    `Expand this idea into a full thread:\n\n${idea}`
  );
  return result.split('---').map(s => s.trim()).filter(Boolean);
}

export async function generateHooks(topic: string, count = 5): Promise<string[]> {
  const result = await callGroq(
    `You are a viral content hook expert. Generate ${count} different hook variations for a thread. Each hook should be attention-grabbing, under 100 characters, and make people want to read more. Return one per line.`,
    `Topic: ${topic}`
  );
  return result.split('\n').map(s => s.trim()).filter(Boolean).slice(0, count);
}

export async function applyTone(text: string, tone: AITone): Promise<string> {
  const toneDescriptions: Record<AITone, string> = {
    educational: 'informative, clear, teaching style with examples',
    storytelling: 'narrative, personal, engaging story format',
    viral: 'punchy, controversial, shareable, uses power words',
    motivational: 'inspiring, uplifting, action-oriented',
    minimalist: 'extremely concise, every word counts, no fluff',
    controversial: 'bold, challenges assumptions, provocative but respectful',
  };

  return callGroq(
    `Rewrite this text in a ${tone} tone: ${toneDescriptions[tone]}. Return ONLY the rewritten text.`,
    text
  );
}
