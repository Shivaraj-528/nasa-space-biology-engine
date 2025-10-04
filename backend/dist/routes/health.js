"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sql_1 = require("../models/sql");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET/POST /api/v1/astronaut/{id}/health
router.get('/astronaut/:id/health', auth_1.authenticate, (0, auth_1.requireRoles)('researcher', 'nasa_scientist', 'administrator'), async (req, res) => {
    const { id } = req.params;
    try {
        try {
            const records = await sql_1.AstronautHealth.findAll({ where: { astronaut_id: id }, order: [['created_at', 'DESC']], limit: 10 });
            return res.json({ id, records });
        }
        catch (dbErr) {
            // Fallback mock
            return res.json({ id, records: [{ id: 'mock', astronaut_id: id, hr: 62, bp: '118/75', created_at: new Date().toISOString() }] });
        }
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error('[astronaut health GET] error', err);
        res.status(500).json({ error: 'Failed to fetch astronaut health' });
    }
});
router.post('/astronaut/:id/health', auth_1.authenticate, (0, auth_1.requireRoles)('nasa_scientist', 'administrator'), async (req, res) => {
    const { id } = req.params;
    const { hr, bp } = req.body || {};
    try {
        try {
            const record = await sql_1.AstronautHealth.create({ astronaut_id: id, hr: hr ?? null, bp: bp ?? null });
            return res.status(201).json(record);
        }
        catch (dbErr) {
            // Fallback mock response
            return res.status(201).json({ id: 'mock', astronaut_id: id, hr: hr ?? 62, bp: bp ?? '118/75', created_at: new Date().toISOString() });
        }
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error('[astronaut health POST] error', err);
        res.status(500).json({ error: 'Failed to update astronaut health' });
    }
});
exports.default = router;
