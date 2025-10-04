import Bull from 'bull';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const genelabIngestQueue = new Bull('genelab:ingest', REDIS_URL);

export interface GenelabIngestJobData {
  limit?: number;
  searchTerm?: string;
  organism?: string;
  assayType?: string;
  dateFrom?: string;
  dateTo?: string;
  projectType?: string;
}
