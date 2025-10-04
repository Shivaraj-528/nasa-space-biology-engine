import { openrouterChat, ChatMessage } from './openrouter';

export async function summarizeAndExtract(text: string) {
  try {
    const sys: ChatMessage = {
      role: 'system',
      content:
        'You are an assistant that summarizes scientific PDFs succinctly and extracts metadata. Reply in JSON with fields: summary (<=150 words), keywords (array of 5-12), authors (array if identifiable else empty), year (number or null), institution (string or null).',
    };
    const user: ChatMessage = { role: 'user', content: `Text:\n${text.slice(0, 8000)}` };
    const { content } = await openrouterChat([sys, user], undefined, 0.2);
    try {
      const j = JSON.parse(content);
      return {
        summary: j.summary || '',
        extractedKeywords: Array.isArray(j.keywords) ? j.keywords.slice(0, 12) : [],
        authors: Array.isArray(j.authors) ? j.authors : [],
        year: typeof j.year === 'number' ? j.year : undefined,
        institution: typeof j.institution === 'string' ? j.institution : undefined,
      };
    } catch {
      return { summary: content, extractedKeywords: [], authors: [], year: undefined, institution: undefined };
    }
  } catch {
    // Fallback: naive summary and keyword extraction without LLM
    const plain = text.replace(/\s+/g, ' ').trim();
    const summary = plain.slice(0, 1200);
    const words = plain
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOPWORDS.has(w));
    const freq = new Map<string, number>();
    for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);
    const extractedKeywords = [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([w]) => w);
    return { summary, extractedKeywords, authors: [], year: undefined, institution: undefined };
  }
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
