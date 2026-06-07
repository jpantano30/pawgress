import { Router } from 'express';
import pool from '../db/pool.js';

const router = Router();

async function getInternalUser(clerkId) {
  const { rows: [user] } = await pool.query(
    `SELECT id, role FROM users WHERE clerk_id = $1`, [clerkId]
  );
  return user || null;
}

// GET /api/sessions?dog_id=xxx
router.get('/', async (req, res, next) => {
  try {
    const { dog_id } = req.query;
    const user = await getInternalUser(req.auth.userId);
    const publishedClause = user?.role === 'client' ? 'AND s.is_published = TRUE' : '';

    const { rows } = await pool.query(
      `SELECT s.*,
         json_agg(
           json_build_object(
             'metric_id', bs.metric_id,
             'metric_name', bm.name,
             'score', bs.score,
             'color', bm.color
           ) ORDER BY bm.name
         ) FILTER (WHERE bs.id IS NOT NULL) AS scores
       FROM sessions s
       LEFT JOIN behavior_scores bs ON bs.session_id = s.id
       LEFT JOIN behavior_metrics bm ON bm.id = bs.metric_id
       WHERE s.dog_id = $1 ${publishedClause}
       GROUP BY s.id
       ORDER BY s.session_date DESC`,
      [dog_id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /api/sessions
router.post('/', async (req, res, next) => {
  try {
    const user = await getInternalUser(req.auth.userId);
    if (!user || user.role !== 'trainer') return res.status(403).json({ error: 'Trainers only' });

    const {
      dog_id, session_date, duration_mins, location,
      overall_rating, summary, homework, is_published, scores = []
    } = req.body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows: [session] } = await client.query(
        `INSERT INTO sessions
           (dog_id, trainer_id, session_date, duration_mins, location,
            overall_rating, summary, homework, is_published)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [dog_id, user.id, session_date, duration_mins, location,
         overall_rating, summary, homework, is_published ?? true]
      );
      for (const { metric_id, score } of scores) {
        await client.query(
          `INSERT INTO behavior_scores (session_id, metric_id, score) VALUES ($1,$2,$3)`,
          [session.id, metric_id, score]
        );
      }
      await client.query('COMMIT');
      res.status(201).json(session);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) { next(err); }
});

export default router;
