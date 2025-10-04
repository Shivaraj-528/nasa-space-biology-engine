import { parseStringPromise } from 'xml2js';
import type { RagDoc } from './types';

export async function searchArxiv(query: string, maxResults = 5): Promise<RagDoc[]> {
  const url = `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=${maxResults}`;
  const res = await fetch(url);
  const xml = await res.text();
  const parsed = await parseStringPromise(xml);
  const entries = parsed.feed?.entry || [];
  return entries.map((e: any) => ({
    title: e.title?.[0]?.trim(),
    url: e.id?.[0],
    summary: e.summary?.[0]?.trim(),
    authors: (e.author || []).map((a: any) => a.name?.[0]).filter(Boolean),
    year: e.published?.[0] ? new Date(e.published[0]).getFullYear() : undefined,
    source: 'arxiv',
  }));
}
