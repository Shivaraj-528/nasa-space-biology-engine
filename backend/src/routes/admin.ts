import { Router } from 'express';
import { authenticate, requireRoles } from '../middleware/auth';
import { genelabIngestQueue } from '../queues';

const router = Router();

// POST /api/v1/admin/ingest/genelab
router.post(
  '/admin/ingest/genelab',
  authenticate,
  requireRoles('administrator'),
  async (req, res) => {
    // Support both query params and body params for flexibility
    const limit = Number(req.body.limit || req.query.limit || 5);
    const searchTerm = req.body.searchTerm || req.query.searchTerm;
    const organism = req.body.organism || req.query.organism;
    const assayType = req.body.assayType || req.query.assayType;
    const dateFrom = req.body.dateFrom || req.query.dateFrom;
    const dateTo = req.body.dateTo || req.query.dateTo;
    const projectType = req.body.projectType || req.query.projectType;

    const jobData = {
      limit,
      searchTerm,
      organism,
      assayType,
      dateFrom,
      dateTo,
      projectType,
    };

    // Remove undefined values
    Object.keys(jobData).forEach(key => {
      if (jobData[key as keyof typeof jobData] === undefined) {
        delete jobData[key as keyof typeof jobData];
      }
    });

    const job = await genelabIngestQueue.add(jobData);
    return res.status(202).json({ jobId: job.id });
  }
);

// GET /api/v1/admin/ingest/:id
router.get(
  '/admin/ingest/:id',
  authenticate,
  requireRoles('administrator'),
  async (req, res) => {
    const id = req.params.id;
    const job = await genelabIngestQueue.getJob(id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    const state = await job.getState();
    const result = job.returnvalue;
    return res.json({ id: job.id, state, result });
  }
);

export default router;
