import { Router } from 'express';
import pool from '../db/pool.js';

const router = Router();

async function getInternalUser(clerkId) {
  const { rows: [user] } = await pool.query(
    `SELECT id, role FROM users WHERE clerk_id=$1`, [clerkId]
  );
  return user || null;
}

// GET /api/homework?dog_id=xxx — get all homework logs for a dog
router.get('/', async (req, res, next) => {
  try {
    const { dog_id } = req.query;
    const { rows } = await pool.query(
      `SELECT hl.*, s.homework, s.session_date, s.next_session_date
       FROM homework_logs hl
       JOIN sessions s ON s.id = hl.session_id
       WHERE hl.dog_id = $1
       ORDER BY hl.logged_date DESC`,
      [dog_id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /api/homework — log a practice day
router.post('/', async (req, res, next) => {
  try {
    const user = await getInternalUser(req.auth.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { session_id, dog_id, logged_date, notes } = req.body;
    const { rows: [log] } = await pool.query(
      `INSERT INTO homework_logs (session_id, dog_id, client_id, logged_date, notes)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (session_id, client_id, logged_date) DO UPDATE SET notes=$5
       RETURNING *`,
      [session_id, dog_id, user.id, logged_date || new Date().toISOString().split('T')[0], notes||null]
    );
    res.status(201).json(log);
  } catch (err) { next(err); }
});

// DELETE /api/homework/:id — unlog a practice day
router.delete('/:id', async (req, res, next) => {
  try {
    const user = await getInternalUser(req.auth.userId);
    await pool.query(
      `DELETE FROM homework_logs WHERE id=$1 AND client_id=$2`,
      [req.params.id, user.id]
    );
    res.json({ success: true });
  } catch (err) { next(err); }
});

// GET /api/homework/stats?dog_id=xxx — streak + completion stats for trainer
router.get('/stats', async (req, res, next) => {
  try {
    const { dog_id } = req.query;
    const { rows } = await pool.query(
      `SELECT
        COUNT(DISTINCT logged_date) AS total_days_practiced,
        COUNT(DISTINCT session_id) AS sessions_with_practice,
        MAX(logged_date) AS last_practiced
       FROM homework_logs WHERE dog_id=$1`,
      [dog_id]
    );
    res.json(rows[0]);
  } catch (err) { next(err); }
});

export default router;
