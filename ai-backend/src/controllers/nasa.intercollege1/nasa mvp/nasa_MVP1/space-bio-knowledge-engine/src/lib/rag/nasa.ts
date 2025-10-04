import type { RagDoc } from './types';

export async function searchNasa(query: string, maxResults = 5): Promise<RagDoc[]> {
  const key = process.env.NASA_API_KEY || 'DEMO_KEY';
  const url = `https://techport.nasa.gov/api/projects/search?searchQuery=${encodeURIComponent(query)}&api_key=${key}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const j = await res.json();
  const arr = j?.projects || j?.results || j?.projectSearchResult?.projects || [];
  const items = Array.isArray(arr) ? arr : arr?.projects || [];
  const docs: RagDoc[] = [];
  for (const p of items.slice(0, maxResults)) {
    const title = p?.title || p?.projectTitle || 'NASA Project';
    const id = p?.id || p?.projectId;
    const desc = p?.description || p?.projectDescription;
    docs.push({
      title,
      url: id ? `https://techport.nasa.gov/view/${id}` : undefined,
      summary: typeof desc === 'string' ? desc : undefined,
      authors: undefined,
      year: p?.lastUpdated ? new Date(p.lastUpdated).getFullYear() : undefined,
      source: 'nasa',
      snippet: typeof desc === 'string' ? desc.slice(0, 240) : undefined,
    });
  }
  return docs;
}
