#!/usr/bin/env node
import 'dotenv/config';
import { connectMongo, connectPostgres } from './src/config/db';
import { syncSqlModels } from './src/models/sql';
import { registerGenelabProcessor } from './src/queues/processor';
import { startScheduledJobs, stopScheduledJobs } from './src/services/scheduler';

async function startWorker() {
  try {
    // eslint-disable-next-line no-console
    console.log('[worker] Starting background worker...');
    
    // Connect to databases
    await Promise.all([connectMongo(), connectPostgres()]);
    await syncSqlModels();
    
    // Register queue processors
    registerGenelabProcessor();
    
    // Start scheduled jobs (cron)
    startScheduledJobs();
    
    // eslint-disable-next-line no-console
    console.log('[worker] Background worker ready and listening for jobs');
    
    // Keep the process alive
    process.on('SIGINT', () => {
      // eslint-disable-next-line no-console
      console.log('[worker] Received SIGINT, shutting down gracefully...');
      stopScheduledJobs();
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      // eslint-disable-next-line no-console
      console.log('[worker] Received SIGTERM, shutting down gracefully...');
      stopScheduledJobs();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('[worker] Failed to start:', error);
    process.exit(1);
  }
}

startWorker();
