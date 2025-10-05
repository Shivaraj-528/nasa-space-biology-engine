import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import dataRouter from './routes/data';
import aiRouter from './routes/ai';
import healthRouter from './routes/health';
import authRouter from './routes/auth';
import adminRouter from './routes/admin';
import chatbotRouter from './routes/chatbot';
import datasetDetailRouter from './routes/datasetDetail';
import publicationsRouter from './routes/publications';
import { connectMongo, connectPostgres } from './config/db';
import { syncSqlModels } from './models/sql';
import { registerGenelabProcessor } from './queues/processor';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// API routes
app.use('/api/v1', authRouter);
app.use('/api/v1', dataRouter);
app.use('/api/v1', aiRouter);
app.use('/api/v1', healthRouter);
app.use('/api/v1', adminRouter);
app.use('/api/v1', chatbotRouter);
app.use('/api/v1', datasetDetailRouter);
app.use('/api/v1', publicationsRouter);

// Swagger docs
const swaggerPath = path.join(__dirname, '../swagger.yaml');
const swaggerDocument = YAML.load(swaggerPath);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Root route
app.get('/', (_req, res) => {
  res.json({ 
    message: 'NASA Space Biology Engine API', 
    version: '1.0.0',
    status: 'running',
    docs: '/api/docs',
    health: '/api/health'
  });
});

app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok', service: 'backend', time: new Date().toISOString() });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

async function start() {
  await Promise.all([connectMongo(), connectPostgres()]);
  await syncSqlModels();
  
  // Only register queue processors if not in production or if ENABLE_QUEUE_PROCESSING is true
  // In production, use a separate worker process via `npm run worker`
  const enableQueueProcessing = process.env.ENABLE_QUEUE_PROCESSING === 'true' || process.env.NODE_ENV !== 'production';
  if (enableQueueProcessing) {
    // eslint-disable-next-line no-console
    console.log('[server] Registering queue processors in main process');
    registerGenelabProcessor();
  } else {
    // eslint-disable-next-line no-console
    console.log('[server] Queue processing disabled. Use `npm run worker` to start a dedicated worker.');
  }
  
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend API listening on http://localhost:${PORT}`);
  });
}

start();
