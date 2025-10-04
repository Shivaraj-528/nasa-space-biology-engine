import type { RagDoc } from './types';

export async function searchPubMed(query: string, maxResults = 5): Promise<RagDoc[]> {
  const esearchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(
    query
  )}&retmax=${maxResults}&retmode=json`;
  const es = await fetch(esearchUrl);
  const esj = await es.json();
  const ids = (esj?.esearchresult?.idlist || []).join(',');
  if (!ids) return [];
  const esumUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids}&retmode=json`;
  const sm = await fetch(esumUrl);
  const smj = await sm.json();
  const result: RagDoc[] = [];
  const uids: string[] = smj?.result?.uids || [];
  for (const uid of uids) {
    const item = smj.result[uid];
    result.push({
      title: item?.title || 'PubMed article',
      url: `https://pubmed.ncbi.nlm.nih.gov/${uid}/`,
      authors: (item?.authors || []).map((a: any) => a.name).filter(Boolean),
      year: item?.pubdate ? parseInt(String(item.pubdate).slice(0, 4)) : undefined,
      source: 'pubmed',
      snippet: item?.sortfirstauthor || undefined,
    });
  }
  return result;
}
