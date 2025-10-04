import { NextRequest, NextResponse } from 'next/server';
import { aggregateSearch } from '@/lib/rag/aggregate';
import { openrouterChat, ChatMessage } from '@/lib/openrouter';

export const runtime = 'nodejs';

const roleSystemMap: Record<string, string> = {
  student: 'Explain in simple terms for a student. Focus on definitions and intuition.',
  teacher: 'Explain with educational context, analogies, and key takeaways.',
  researcher: 'Provide technical, multi-paper insights. Compare findings.',
  scientist: 'Provide deep technical analysis with precise references and methods.',
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const question: string = body.question;
  const role: string = body.role || 'student';
  const sources: string[] = body.sources || ['nasa', 'arxiv', 'pubmed', 'crossref'];
  const urls: string[] | undefined = body.urls;

  let docs: any[] = [];
  try {
    docs = await aggregateSearch(question, sources as any, 3, urls);
  } catch {
    docs = [];
  }

  const context = docs
    .map(
      (d, i) => `[${i + 1}] ${d.title} (${d.source}) ${d.url || ''}\n${(d.summary || d.snippet || '').slice(0, 800)}`
    )
    .join('\n\n');

  try {
    const sys: ChatMessage = {
      role: 'system',
      content: `You are a space biology assistant. ${roleSystemMap[role] || ''} Cite sources as [n] matching the provided references.`,
    };
    const user: ChatMessage = {
      role: 'user',
      content: `Question: ${question}\n\nContext sources:\n${context}\n\nReturn an answer with citations like [1], [2]. Then list References as a numbered list with URLs.`,
    };

    const { content } = await openrouterChat([sys, user], undefined, 0.2);
    return NextResponse.json({
      answer: content,
      references: docs.map((d, i) => ({ index: i + 1, title: d.title, url: d.url, source: d.source })),
    });
  } catch (e: any) {
    // Fallback: synthesize a concise answer from available docs
    const lines = docs.map(
      (d, i) => `- [${i + 1}] ${d.title} (${d.source})${d.url ? ` — ${d.url}` : ''}`
    );
    const snippet = docs
      .map((d) => d.summary || d.snippet)
      .filter(Boolean)
      .slice(0, 3)
      .join(' ');
    const answer = docs.length
      ? `Preliminary synthesis (offline mode): ${snippet || 'insufficient context'}`
      : 'No sources available. Try rephrasing your query or enable more sources.';
    return NextResponse.json({
      answer: `${answer}\n\nReferences:\n${lines.join('\n')}`,
      references: docs.map((d, i) => ({ index: i + 1, title: d.title, url: d.url, source: d.source })),
      warning: 'Using fallback synthesis (OpenRouter or sources unavailable)'
    });
  }
}
