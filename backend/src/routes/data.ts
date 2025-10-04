import { Router } from 'express';
import { Dataset } from '../models/Dataset';
import { Experiment } from '../models/sql';

const router = Router();

// GET/POST /api/v1/datasets
router.get('/datasets', async (req, res) => {
  try {
    const { source, type, q } = req.query as { source?: string; type?: string; q?: string };
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || '20', 10)));
    const filter: any = {};
    if (source) filter.source = source;
    if (type) filter.type = type;
    if (q) filter.title = { $regex: q, $options: 'i' };

    let items: any[] = [];
    let total = 0;
    try {
      total = await Dataset.countDocuments(filter);
      items = await Dataset.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
    } catch (dbErr) {
      // Graceful fallback to mock data if Mongo is unavailable
      items = [
        { _id: 'gl-001', source: 'GeneLab', type: 'genomics', title: 'ISS Plant Growth 2024' },
        { _id: 'nbisc-042', source: 'NBISC', type: 'specimen_data', title: 'Mouse Microgravity Study' },
      ];
      total = items.length;
    }

    res.json({ items, total, page, limit });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[datasets] error', err);
    res.status(500).json({ error: 'Failed to fetch datasets' });
  }
});

router.post('/datasets', async (req, res) => {
  try {
    const { source, type, title } = req.body || {};
    if (!source || !type || !title) return res.status(400).json({ error: 'source, type, and title are required' });
    const doc = await Dataset.create({ source, type, title });
    res.status(201).json({ id: doc._id, ...doc.toObject() });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[datasets POST] error', err);
    res.status(500).json({ error: 'Failed to create dataset' });
  }
});

// GET /api/v1/biological/{organism}/experiments
router.get('/biological/:organism/experiments', async (req, res) => {
  try {
    const { organism } = req.params;
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || '20', 10)));
    let items: any[] = [];
    let total = 0;
    try {
      total = await Experiment.count({ where: { organism } });
      items = await Experiment.findAll({ where: { organism }, offset: (page - 1) * limit, limit, order: [['created_at', 'DESC']] });
    } catch (dbErr) {
      // Fallback mock
      items = [
        { id: 'exp-1001', mission: 'ISS', type: 'transcriptomics', duration_days: 30, organism },
        { id: 'exp-1077', mission: 'Artemis III', type: 'proteomics', duration_days: 10, organism },
      ];
      total = items.length;
    }
    res.json({ organism, items, total, page, limit });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[experiments] error', err);
    res.status(500).json({ error: 'Failed to fetch experiments' });
  }
});

export default router;
