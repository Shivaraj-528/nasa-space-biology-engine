import { genelabIngestQueue, GenelabIngestJobData } from './index';
import { fetchOSDRDatasets } from '../services/genelabClient';
import { Dataset } from '../models/Dataset';

// Simple processor to ingest OSDR datasets into MongoDB
export function registerGenelabProcessor() {
  genelabIngestQueue.process(async (job) => {
    try {
      const data = job.data as GenelabIngestJobData;
      const limit = data.limit ?? 5;
      
      // eslint-disable-next-line no-console
      console.log(`[processor] Starting ingestion job with limit: ${limit}`);
      
      const datasets = await fetchOSDRDatasets({
        limit,
        searchTerm: data.searchTerm || 'space biology',
        organism: data.organism,
        assayType: data.assayType,
        dateFrom: data.dateFrom,
        dateTo: data.dateTo,
        projectType: data.projectType,
      });
      
      // eslint-disable-next-line no-console
      console.log(`[processor] Fetched ${datasets.length} datasets from OSDR`);

      let inserted = 0;
      for (const d of datasets) {
        try {
          // Use simpler upsert logic with title+source as key
          const res = await Dataset.updateOne(
            { title: d.title, source: d.source },
            { 
              $set: { 
                source: d.source, 
                type: d.type, 
                title: d.title,
                organism: d.organism,
                assay_type: d.assay_type,
                description: d.description,
              } 
            },
            { upsert: true }
          );
          
          if (res.upsertedCount && res.upsertedCount > 0) {
            inserted += 1;
            // eslint-disable-next-line no-console
            console.log(`[processor] Inserted: ${d.title}`);
          } else {
            // eslint-disable-next-line no-console
            console.log(`[processor] Updated: ${d.title}`);
          }
        } catch (dbErr: any) {
          // eslint-disable-next-line no-console
          console.error(`[processor] DB error for dataset ${d.title}:`, dbErr.message);
        }
      }

      const result = { requested: limit, processed: datasets.length, inserted };
      // eslint-disable-next-line no-console
      console.log(`[processor] Job completed:`, result);
      
      return result;
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('[processor] Job failed:', err.message);
      throw err;
    }
  });
}
