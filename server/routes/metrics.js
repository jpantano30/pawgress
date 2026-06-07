import { Router } from 'express';
import pool from '../db/pool.js';

const router = Router();

async function getInternalUser(clerkId) {
  const { rows: [user] } = await pool.query(
    `SELECT id, role FROM users WHERE clerk_id = $1`, [clerkId]
  );
  return user || null;
}

router.get('/', async (req, res, next) => {
  try {
    const { dog_id } = req.query;
    const { rows } = await pool.query(
      `SELECT * FROM behavior_metrics WHERE dog_id = $1 AND is_active = TRUE ORDER BY name`,
      [dog_id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const user = await getInternalUser(req.auth.userId);
    if (!user || user.role !== 'trainer') return res.status(403).json({ error: 'Trainers only' });

    const { dog_id, name, description, scale_min, scale_max, lower_is_better, color } = req.body;
    const { rows: [metric] } = await pool.query(
      `INSERT INTO behavior_metrics
         (dog_id, trainer_id, name, description, scale_min, scale_max, lower_is_better, color)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [dog_id, user.id, name, description || null, scale_min ?? 1, scale_max ?? 10,
       lower_is_better ?? false, color ?? '#6366f1']
    );
    res.status(201).json(metric);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const user = await getInternalUser(req.auth.userId);
    if (!user || user.role !== 'trainer') return res.status(403).json({ error: 'Trainers only' });
    await pool.query(
      `UPDATE behavior_metrics SET is_active = FALSE WHERE id = $1 AND trainer_id = $2`,
      [req.params.id, user.id]
    );
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
