import axios from 'axios';

export interface SearchResult {
  id: string;
  title: string;
  abstract?: string;
  authors: string[];
  publishedAt?: string;
  doi?: string;
  source: 'NASA' | 'ArXiv' | 'PubMed' | 'CrossRef';
  url?: string;
  keywords?: string[];
}

// NASA GeneLab API
export class NASAService {
  private apiKey: string;
  private baseUrl = 'https://genelab-data.ndc.nasa.gov/genelab/data/search';

  constructor() {
    this.apiKey = process.env.NASA_API_KEY || '';
  }

  async search(query: string, limit = 20): Promise<SearchResult[]> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          term: query,
          size: limit,
          api_key: this.apiKey
        }
      });

      return response.data.hits?.hits?.map((hit: any) => ({
        id: hit._id,
        title: hit._source.title || 'Untitled',
        abstract: hit._source.description,
        authors: hit._source.investigators || [],
        publishedAt: hit._source.release_date,
        source: 'NASA' as const,
        url: `https://genelab-data.ndc.nasa.gov/genelab/accession/${hit._id}`,
        keywords: hit._source.factors || []
      })) || [];
    } catch (error) {
      console.error('NASA API error:', error);
      return [];
    }
  }
}

// ArXiv API
export class ArXivService {
  private baseUrl = 'http://export.arxiv.org/api/query';

  async search(query: string, limit = 20): Promise<SearchResult[]> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          search_query: `all:${query} AND cat:q-bio*`,
          start: 0,
          max_results: limit,
          sortBy: 'relevance',
          sortOrder: 'descending'
        }
      });

      // Parse XML response
      const xml2js = require('xml2js');
      const parser = new xml2js.Parser();
      const result = await parser.parseStringPromise(response.data);

      const entries = result.feed?.entry || [];
      
      return entries.map((entry: any) => ({
        id: entry.id[0].split('/').pop(),
        title: entry.title[0].replace(/\s+/g, ' ').trim(),
        abstract: entry.summary[0].replace(/\s+/g, ' ').trim(),
        authors: entry.author?.map((author: any) => author.name[0]) || [],
        publishedAt: entry.published[0],
        doi: entry['arxiv:doi']?.[0],
        source: 'ArXiv' as const,
        url: entry.id[0],
        keywords: entry.category?.map((cat: any) => cat.$.term) || []
      }));
    } catch (error) {
      console.error('ArXiv API error:', error);
      return [];
    }
  }
}

// PubMed API
export class PubMedService {
  private baseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

  async search(query: string, limit = 20): Promise<SearchResult[]> {
    try {
      // First, search for IDs
      const searchResponse = await axios.get(`${this.baseUrl}/esearch.fcgi`, {
        params: {
          db: 'pubmed',
          term: `${query} AND ("space biology"[MeSH Terms] OR "astrobiology"[All Fields] OR "space flight"[MeSH Terms])`,
          retmax: limit,
          retmode: 'json'
        }
      });

      const ids = searchResponse.data.esearchresult?.idlist || [];
      
      if (ids.length === 0) return [];

      // Then fetch details
      const detailsResponse = await axios.get(`${this.baseUrl}/esummary.fcgi`, {
        params: {
          db: 'pubmed',
          id: ids.join(','),
          retmode: 'json'
        }
      });

      const articles = detailsResponse.data.result;
      
      return ids.map((id: string) => {
        const article = articles[id];
        return {
          id: id,
          title: article.title || 'Untitled',
          abstract: article.abstract,
          authors: article.authors?.map((author: any) => author.name) || [],
          publishedAt: article.pubdate,
          doi: article.elocationid?.startsWith('doi:') ? article.elocationid.substring(4) : undefined,
          source: 'PubMed' as const,
          url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
          keywords: article.keywords || []
        };
      });
    } catch (error) {
      console.error('PubMed API error:', error);
      return [];
    }
  }
}

// CrossRef API
export class CrossRefService {
  private baseUrl = 'https://api.crossref.org/works';

  async search(query: string, limit = 20): Promise<SearchResult[]> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          query: `${query} space biology astrobiology`,
          rows: limit,
          sort: 'relevance',
          order: 'desc'
        }
      });

      const items = response.data.message?.items || [];
      
      return items.map((item: any) => ({
        id: item.DOI,
        title: item.title?.[0] || 'Untitled',
        abstract: item.abstract,
        authors: item.author?.map((author: any) => `${author.given} ${author.family}`) || [],
        publishedAt: item.published?.['date-parts']?.[0]?.join('-'),
        doi: item.DOI,
        source: 'CrossRef' as const,
        url: item.URL,
        keywords: item.subject || []
      }));
    } catch (error) {
      console.error('CrossRef API error:', error);
      return [];
    }
  }
}

// Combined search service
export class SearchService {
  private nasaService = new NASAService();
  private arxivService = new ArXivService();
  private pubmedService = new PubMedService();
  private crossrefService = new CrossRefService();

  async searchAll(query: string, sources?: string[], limit = 20): Promise<SearchResult[]> {
    const promises: Promise<SearchResult[]>[] = [];
    const perSourceLimit = Math.ceil(limit / (sources?.length || 4));

    if (!sources || sources.includes('NASA')) {
      promises.push(this.nasaService.search(query, perSourceLimit));
    }
    
    if (!sources || sources.includes('ArXiv')) {
      promises.push(this.arxivService.search(query, perSourceLimit));
    }
    
    if (!sources || sources.includes('PubMed')) {
      promises.push(this.pubmedService.search(query, perSourceLimit));
    }
    
    if (!sources || sources.includes('CrossRef')) {
      promises.push(this.crossrefService.search(query, perSourceLimit));
    }

    try {
      const results = await Promise.allSettled(promises);
      const allResults: SearchResult[] = [];

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          allResults.push(...result.value);
        }
      });

      // Sort by relevance (you can implement more sophisticated scoring)
      return allResults
        .sort((a, b) => {
          // Prioritize results with abstracts
          if (a.abstract && !b.abstract) return -1;
          if (!a.abstract && b.abstract) return 1;
          
          // Prioritize more recent publications
          const dateA = new Date(a.publishedAt || '1900-01-01');
          const dateB = new Date(b.publishedAt || '1900-01-01');
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, limit);
    } catch (error) {
      console.error('Search all error:', error);
      return [];
    }
  }
}
