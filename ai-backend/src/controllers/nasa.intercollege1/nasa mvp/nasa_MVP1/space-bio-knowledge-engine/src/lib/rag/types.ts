export type RagDoc = {
  title: string;
  url?: string;
  summary?: string;
  authors?: string[];
  year?: number;
  source: 'arxiv' | 'pubmed' | 'crossref' | 'nasa' | 'url';
  snippet?: string;
};
