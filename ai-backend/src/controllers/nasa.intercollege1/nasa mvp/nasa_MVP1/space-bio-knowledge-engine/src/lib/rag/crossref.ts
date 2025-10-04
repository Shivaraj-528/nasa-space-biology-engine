import type { RagDoc } from './types';

export async function searchCrossRef(query: string, maxResults = 5): Promise<RagDoc[]> {
  const url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=${maxResults}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  const j = await res.json();
  const items = j?.message?.items || [];
  return items.map((it: any) => ({
    title: (it.title && it.title[0]) || 'CrossRef Work',
    url: it.URL,
    authors: (it.author || [])
      .map((a: any) => [a.given, a.family].filter(Boolean).join(' '))
      .filter(Boolean),
    year: it.issued?.['date-parts']?.[0]?.[0],
    source: 'crossref',
    snippet: it['container-title']?.[0],
  }));
}
