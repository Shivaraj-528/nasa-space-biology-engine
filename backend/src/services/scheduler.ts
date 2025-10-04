import cron from 'node-cron';
import { genelabIngestQueue } from '../queues';

export function startScheduledJobs() {
  // Daily data refresh at 2 AM UTC
  cron.schedule('0 2 * * *', async () => {
    try {
      // eslint-disable-next-line no-console
      console.log('[scheduler] Starting daily OSDR data refresh');
      
      // Queue multiple ingestion jobs with different search terms
      const searchTerms = [
        'space biology',
        'microgravity',
        'spaceflight',
        'ISS',
        'radiation biology'
      ];
      
      for (const term of searchTerms) {
        await genelabIngestQueue.add({ 
          limit: 10, 
          searchTerm: term 
        });
      }
      
      // eslint-disable-next-line no-console
      console.log(`[scheduler] Queued ${searchTerms.length} ingestion jobs`);
    } catch (error) {
      console.error('[scheduler] Daily refresh failed:', error);
    }
  });

  // Weekly comprehensive refresh on Sundays at 3 AM UTC
  cron.schedule('0 3 * * 0', async () => {
    try {
      // eslint-disable-next-line no-console
      console.log('[scheduler] Starting weekly comprehensive refresh');
      
      // Larger batch with organism-specific searches
      const organisms = [
        'Mus musculus',
        'Arabidopsis thaliana',
        'Bacillus subtilis',
        'Homo sapiens',
        'Drosophila melanogaster'
      ];
      
      for (const organism of organisms) {
        await genelabIngestQueue.add({ 
          limit: 20, 
          searchTerm: 'space',
          organism 
        });
      }
      
      // eslint-disable-next-line no-console
      console.log(`[scheduler] Queued ${organisms.length} organism-specific jobs`);
    } catch (error) {
      console.error('[scheduler] Weekly refresh failed:', error);
    }
  });

  // eslint-disable-next-line no-console
  console.log('[scheduler] Scheduled jobs registered: daily at 2 AM UTC, weekly on Sundays at 3 AM UTC');
}

export function stopScheduledJobs() {
  cron.getTasks().forEach(task => task.stop());
  // eslint-disable-next-line no-console
  console.log('[scheduler] All scheduled jobs stopped');
}
