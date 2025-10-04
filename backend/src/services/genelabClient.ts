import axios from 'axios';

const OSDR_API_BASE_URL = process.env.OSDR_API_BASE_URL || 'https://osdr.nasa.gov';
const OSDR_API_KEY = process.env.OSDR_API_KEY || ''; // Currently not required for public endpoints

export interface OSDRDataset {
  id: string;
  source: string;
  type: string;
  title: string;
  organism?: string;
  assay_type?: string;
  description?: string;
}

export interface OSDRSearchOptions {
  limit?: number;
  searchTerm?: string;
  organism?: string;
  assayType?: string;
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string;   // YYYY-MM-DD
  projectType?: string;
}

// Fetch datasets from NASA OSDR (Open Science Data Repository) API
export async function fetchOSDRDatasets(
  limitOrOptions: number | OSDRSearchOptions = 10, 
  searchTerm = 'space'
): Promise<OSDRDataset[]> {
  try {
    // Parse parameters
    let options: OSDRSearchOptions;
    if (typeof limitOrOptions === 'number') {
      options = { limit: limitOrOptions, searchTerm };
    } else {
      options = limitOrOptions;
    }

    const {
      limit = 10,
      searchTerm: term = 'space',
      organism,
      assayType,
      dateFrom,
      dateTo,
      projectType
    } = options;

    // Use OSDR search API to fetch datasets
    const url = `${OSDR_API_BASE_URL}/osdr/data/search`;
    const params: any = {
      term,
      from: 0,
      size: limit,
      type: 'cgene', // Focus on GeneLab datasets
    };

    // Add advanced search filters
    if (organism) {
      params.ffield = params.ffield || [];
      params.fvalue = params.fvalue || [];
      if (Array.isArray(params.ffield)) {
        params.ffield.push('organism');
        params.fvalue.push(organism);
      } else {
        params.ffield = ['organism'];
        params.fvalue = [organism];
      }
    }

    if (assayType) {
      params.ffield = params.ffield || [];
      params.fvalue = params.fvalue || [];
      if (Array.isArray(params.ffield)) {
        params.ffield.push('Study Assay Technology Type');
        params.fvalue.push(assayType);
      } else {
        params.ffield = ['Study Assay Technology Type'];
        params.fvalue = [assayType];
      }
    }

    const res = await axios.get(url, { 
      params,
      headers: OSDR_API_KEY ? { 'Authorization': `Bearer ${OSDR_API_KEY}` } : undefined,
      timeout: 30000,
    });

    const hits = res.data?.hits?.hits || [];
    
    return hits.map((hit: any) => {
      const source = hit._source || {};
      const accession = source['OSD Study ID'] || source.accession || hit._id;
      const title = source['Study Title'] || source.title || `OSDR Dataset ${accession}`;
      const organism = source.organism || source['Organism'] || 'Unknown';
      const assayType = source['Study Assay Measurement Type'] || source['Study Assay Technology Type'] || source.assay_type || 'genomics';
      const description = source['Study Description'] || source.description || '';
      
      // Map assay type to our simplified categories
      let type = 'genomics';
      const assayLower = String(assayType).toLowerCase();
      if (assayLower.includes('rna') || assayLower.includes('transcriptom')) type = 'transcriptomics';
      else if (assayLower.includes('protein') || assayLower.includes('proteom')) type = 'proteomics';
      else if (assayLower.includes('metabol')) type = 'metabolomics';
      else if (assayLower.includes('environ') || assayLower.includes('microstructure')) type = 'environmental';

      return {
        id: `osdr-${accession}`,
        source: 'OSDR',
        type,
        title: title.substring(0, 200), // Truncate long titles
        organism,
        assay_type: assayType,
        description: description.substring(0, 500), // Truncate long descriptions
      };
    });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[osdrClient] fetch error', err?.response?.data || err?.message || err);
    return [];
  }
}

// Backward compatibility alias
export const fetchGeneLabDatasets = fetchOSDRDatasets;
export type GeneLabDataset = OSDRDataset;
