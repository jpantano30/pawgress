import { Router } from 'express';
import pool from '../db/pool.js';

const router = Router();

// Helper: get internal user UUID from clerk_id
async function getInternalUserId(clerkId) {
  const { rows: [user] } = await pool.query(
    `SELECT id, role FROM users WHERE clerk_id = $1`, [clerkId]
  );
  return user || null;
}

// GET /api/dogs
router.get('/', async (req, res, next) => {
  try {
    const user = await getInternalUserId(req.auth.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const column = user.role === 'trainer' ? 'trainer_id' : 'owner_id';
    const { rows } = await pool.query(
      `SELECT d.*, u.full_name AS owner_name
       FROM dogs d
       JOIN users u ON u.id = d.owner_id
       WHERE d.${column} = $1 AND d.is_active = TRUE
       ORDER BY d.name`,
      [user.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/dogs/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { rows: [dog] } = await pool.query(
      `SELECT d.*, u.full_name AS owner_name
       FROM dogs d JOIN users u ON u.id = d.owner_id
       WHERE d.id = $1`,
      [req.params.id]
    );
    if (!dog) return res.status(404).json({ error: 'Dog not found' });

    const { rows: metrics } = await pool.query(
      `SELECT * FROM behavior_metrics WHERE dog_id = $1 AND is_active = TRUE ORDER BY name`,
      [req.params.id]
    );

    const { rows: recentSessions } = await pool.query(
      `SELECT s.*,
        json_agg(json_build_object('metric_id', bs.metric_id, 'score', bs.score) ORDER BY bs.metric_id)
          FILTER (WHERE bs.id IS NOT NULL) AS scores
       FROM sessions s
       LEFT JOIN behavior_scores bs ON bs.session_id = s.id
       WHERE s.dog_id = $1
       GROUP BY s.id
       ORDER BY s.session_date DESC
       LIMIT 10`,
      [req.params.id]
    );

    res.json({ ...dog, metrics, recentSessions });
  } catch (err) { next(err); }
});

// POST /api/dogs
router.post('/', async (req, res, next) => {
  try {
    const user = await getInternalUserId(req.auth.userId);
    if (!user || user.role !== 'trainer') return res.status(403).json({ error: 'Trainers only' });

    const { name, breed, date_of_birth, owner_id, notes, photo_url } = req.body;
    const { rows: [dog] } = await pool.query(
      `INSERT INTO dogs (name, breed, date_of_birth, owner_id, trainer_id, notes, photo_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name, breed || null, date_of_birth || null, owner_id, user.id, notes || null, photo_url || null]
    );
    res.status(201).json(dog);
  } catch (err) { next(err); }
});

// PATCH /api/dogs/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const user = await getInternalUserId(req.auth.userId);
    if (!user || user.role !== 'trainer') return res.status(403).json({ error: 'Trainers only' });

    const { name, breed, date_of_birth, notes, photo_url } = req.body;
    const { rows: [dog] } = await pool.query(
      `UPDATE dogs SET name=$1, breed=$2, date_of_birth=$3, notes=$4, photo_url=$5, updated_at=NOW()
       WHERE id=$6 AND trainer_id=$7 RETURNING *`,
      [name, breed, date_of_birth, notes, photo_url, req.params.id, user.id]
    );
    if (!dog) return res.status(404).json({ error: 'Dog not found' });
    res.json(dog);
  } catch (err) { next(err); }
});

export default router;
