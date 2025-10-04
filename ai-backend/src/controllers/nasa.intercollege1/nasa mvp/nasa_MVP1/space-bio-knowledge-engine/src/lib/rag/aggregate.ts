import { searchArxiv } from './arxiv';
import { searchPubMed } from './pubmed';
import { searchCrossRef } from './crossref';
import { searchNasa } from './nasa';
import type { RagDoc } from './types';

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, ' ');
}

export async function aggregateSearch(
  query: string,
  sources: Array<'nasa' | 'arxiv' | 'pubmed' | 'crossref' | 'url'>,
  maxPerSource = 3,
  urls?: string[]
): Promise<RagDoc[]> {
  const tasks: Promise<RagDoc[]>[] = [];
  if (sources.includes('nasa')) tasks.push(searchNasa(query, maxPerSource));
  if (sources.includes('arxiv')) tasks.push(searchArxiv(query, maxPerSource));
  if (sources.includes('pubmed')) tasks.push(searchPubMed(query, maxPerSource));
  if (sources.includes('crossref')) tasks.push(searchCrossRef(query, maxPerSource));
  const results = (await Promise.allSettled(tasks)).flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
  let urlDocs: RagDoc[] = [];
  if (sources.includes('url') && urls?.length) {
    const urlRes = await Promise.allSettled(
      urls.map(async (u) => {
        const r = await fetch(u);
        const t = await r.text();
        const snip = stripHtml(t).slice(0, 1000);
        return { title: u, url: u, summary: snip, source: 'url' as const } as RagDoc;
      })
    );
    urlDocs = urlRes.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []));
  }
  return [...results, ...urlDocs];
}
