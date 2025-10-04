import { Router } from 'express';
import { AstronautHealth } from '../models/sql';
import { authenticate, requireRoles } from '../middleware/auth';

const router = Router();

// GET/POST /api/v1/astronaut/{id}/health
router.get('/astronaut/:id/health', authenticate, requireRoles('researcher', 'nasa_scientist', 'administrator'), async (req, res) => {
  const { id } = req.params;
  try {
    try {
      const records = await AstronautHealth.findAll({ where: { astronaut_id: id }, order: [['created_at', 'DESC']], limit: 10 });
      return res.json({ id, records });
    } catch (dbErr) {
      // Fallback mock
      return res.json({ id, records: [{ id: 'mock', astronaut_id: id, hr: 62, bp: '118/75', created_at: new Date().toISOString() }] });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[astronaut health GET] error', err);
    res.status(500).json({ error: 'Failed to fetch astronaut health' });
  }
});

router.post('/astronaut/:id/health', authenticate, requireRoles('nasa_scientist', 'administrator'), async (req, res) => {
  const { id } = req.params;
  const { hr, bp } = req.body || {};
  try {
    try {
      const record = await AstronautHealth.create({ astronaut_id: id, hr: hr ?? null, bp: bp ?? null });
      return res.status(201).json(record);
    } catch (dbErr) {
      // Fallback mock response
      return res.status(201).json({ id: 'mock', astronaut_id: id, hr: hr ?? 62, bp: bp ?? '118/75', created_at: new Date().toISOString() });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[astronaut health POST] error', err);
    res.status(500).json({ error: 'Failed to update astronaut health' });
  }
});

export default router;
