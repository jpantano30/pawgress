import { Router } from 'express';
import pool from '../db/pool.js';

const router = Router();

async function getInternalUser(clerkId) {
  const { rows: [user] } = await pool.query(
    `SELECT id, role FROM users WHERE clerk_id=$1`, [clerkId]
  );
  return user || null;
}

// GET /api/reports?dog_id=xxx
router.get('/', async (req, res, next) => {
  try {
    const user = await getInternalUser(req.auth.userId);
    const { dog_id } = req.query;

    const statusClause = user?.role === 'client' ? `AND status='published'` : '';
    const { rows } = await pool.query(
      `SELECT * FROM session_reports
       WHERE dog_id=$1 ${statusClause}
       ORDER BY report_date DESC, updated_at DESC`,
      [dog_id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/reports/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { rows: [report] } = await pool.query(
      `SELECT * FROM session_reports WHERE id=$1`, [req.params.id]
    );
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (err) { next(err); }
});

// POST /api/reports — create new report (trainers only)
router.post('/', async (req, res, next) => {
  try {
    const user = await getInternalUser(req.auth.userId);
    if (!user || user.role !== 'trainer') return res.status(403).json({ error: 'Trainers only' });

    const { dog_id, title, report_date, sections, overall_notes, homework, next_session } = req.body;
    const { rows: [report] } = await pool.query(
      `INSERT INTO session_reports
        (dog_id, trainer_id, title, report_date, sections, overall_notes, homework, next_session, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'draft') RETURNING *`,
      [
        dog_id, user.id,
        title || 'Session Report',
        report_date || new Date().toISOString().split('T')[0],
        JSON.stringify(sections || []),
        overall_notes || null,
        homework || null,
        next_session || null
      ]
    );
    res.status(201).json(report);
  } catch (err) { next(err); }
});

// PATCH /api/reports/:id — autosave or publish
router.patch('/:id', async (req, res, next) => {
  try {
    const user = await getInternalUser(req.auth.userId);
    if (!user || user.role !== 'trainer') return res.status(403).json({ error: 'Trainers only' });

    const { title, report_date, sections, overall_notes, homework, next_session, status } = req.body;
    const { rows: [report] } = await pool.query(
      `UPDATE session_reports SET
        title=COALESCE($1,title),
        report_date=COALESCE($2,report_date),
        sections=COALESCE($3::jsonb,sections),
        overall_notes=COALESCE($4,overall_notes),
        homework=COALESCE($5,homework),
        next_session=COALESCE($6,next_session),
        status=COALESCE($7,status),
        updated_at=NOW()
       WHERE id=$8 AND trainer_id=$9 RETURNING *`,
      [
        title,
        report_date,
        sections ? JSON.stringify(sections) : null,
        overall_notes,
        homework,
        next_session,
        status,
        req.params.id,
        user.id
      ]
    );
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (err) { next(err); }
});

// DELETE /api/reports/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const user = await getInternalUser(req.auth.userId);
    if (!user || user.role !== 'trainer') return res.status(403).json({ error: 'Trainers only' });
    await pool.query(
      `DELETE FROM session_reports WHERE id=$1 AND trainer_id=$2`,
      [req.params.id, user.id]
    );
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
