import { openrouterChat, ChatMessage } from './openrouter';

export type MCQ = { question: string; options: string[]; answerIndex: number; explanation?: string };

export async function generateMCQs(title: string, context: string, count = 5): Promise<MCQ[]> {
  try {
    const sys: ChatMessage = {
      role: 'system',
      content:
        'Generate high-quality multiple choice questions with exactly 4 options. Return pure JSON array of objects: {question, options[4], answerIndex (0-3), explanation}.',
    };
    const user: ChatMessage = {
      role: 'user',
      content: `Title: ${title}\nContext:\n${context.slice(0, 6000)}\nCount: ${count}`,
    };
    const { content } = await openrouterChat([sys, user], undefined, 0.3);
    try {
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed.slice(0, count) : [];
    } catch {
      // fall through to fallback
    }
  } catch {}

  // Fallback deterministic MCQs
  const sents = context
    .replace(/\s+/g, ' ')
    .split(/[.!?]\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);
  const keywords = extractKeywords(context, 20);
  const qs: MCQ[] = [];
  for (let i = 0; i < Math.min(count, 5); i++) {
    const base = sents[i % Math.max(1, sents.length)] || title;
    const key = keywords[i % Math.max(1, keywords.length)] || 'microgravity';
    const correct = key;
    const distractors = shuffle(
      Array.from(new Set(keywords.filter((k) => k !== correct))).slice(0, 8)
    ).slice(0, 3);
    while (distractors.length < 3) distractors.push('control');
    const options = shuffle([correct, ...distractors]).slice(0, 4);
    const answerIndex = options.findIndex((o) => o === correct);
    qs.push({
      question: `Which keyword best relates to: "${base.slice(0, 120)}"?`,
      options,
      answerIndex: answerIndex >= 0 ? answerIndex : 0,
      explanation: `The context emphasizes "${correct}" as a central concept.`,
    });
  }
  return qs;
}

function extractKeywords(text: string, k = 12): string[] {
  const plain = text.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ');
  const tokens = plain.split(/\s+/).filter((w) => w.length > 3 && !STOPWORDS.has(w));
  const freq = new Map<string, number>();
  for (const t of tokens) freq.set(t, (freq.get(t) || 0) + 1);
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, k)
    .map(([w]) => w);
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const STOPWORDS = new Set([
  'the',
  'and',
  'for',
  'that',
  'with',
  'this',
  'from',
  'have',
  'are',
  'was',
  'were',
  'been',
  'will',
  'into',
  'such',
  'their',
  'which',
  'these',
  'also',
  'using',
  'use',
  'can',
  'may',
  'not',
  'but',
  'our',
  'its',
  'over',
  'more',
  'than',
  'under',
  'between',
]);
