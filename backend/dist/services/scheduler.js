"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startScheduledJobs = startScheduledJobs;
exports.stopScheduledJobs = stopScheduledJobs;
const node_cron_1 = __importDefault(require("node-cron"));
const queues_1 = require("../queues");
function startScheduledJobs() {
    // Daily data refresh at 2 AM UTC
    node_cron_1.default.schedule('0 2 * * *', async () => {
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
                await queues_1.genelabIngestQueue.add({
                    limit: 10,
                    searchTerm: term
                });
            }
            // eslint-disable-next-line no-console
            console.log(`[scheduler] Queued ${searchTerms.length} ingestion jobs`);
        }
        catch (error) {
            console.error('[scheduler] Daily refresh failed:', error);
        }
    });
    // Weekly comprehensive refresh on Sundays at 3 AM UTC
    node_cron_1.default.schedule('0 3 * * 0', async () => {
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
                await queues_1.genelabIngestQueue.add({
                    limit: 20,
                    searchTerm: 'space',
                    organism
                });
            }
            // eslint-disable-next-line no-console
            console.log(`[scheduler] Queued ${organisms.length} organism-specific jobs`);
        }
        catch (error) {
            console.error('[scheduler] Weekly refresh failed:', error);
        }
    });
    // eslint-disable-next-line no-console
    console.log('[scheduler] Scheduled jobs registered: daily at 2 AM UTC, weekly on Sundays at 3 AM UTC');
}
function stopScheduledJobs() {
    node_cron_1.default.getTasks().forEach(task => task.stop());
    // eslint-disable-next-line no-console
    console.log('[scheduler] All scheduled jobs stopped');
}
