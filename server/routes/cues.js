import { Router } from 'express';
import pool from '../db/pool.js';

const router = Router();

async function getInternalUser(clerkId) {
  const { rows: [user] } = await pool.query(
    `SELECT id, role FROM users WHERE clerk_id=$1`, [clerkId]
  );
  return user || null;
}

router.get('/', async (req, res, next) => {
  try {
    const { dog_id } = req.query;
    const { rows } = await pool.query(
      `SELECT * FROM dog_cues WHERE dog_id=$1 AND is_active=TRUE ORDER BY category, name`,
      [dog_id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const user = await getInternalUser(req.auth.userId);
    if (!user) return res.status(403).json({ error: 'Not authorized' });
    const { dog_id, name, category, fluency, notes } = req.body;
    const { rows: [cue] } = await pool.query(
      `INSERT INTO dog_cues (dog_id, trainer_id, name, category, fluency, notes)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [dog_id, user.id, name, category||'Obedience', fluency||1, notes||null]
    );
    res.status(201).json(cue);
  } catch (err) { next(err); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const { fluency, notes, name, category } = req.body;
    const { rows: [cue] } = await pool.query(
      `UPDATE dog_cues SET
        fluency=COALESCE($1,fluency), notes=COALESCE($2,notes),
        name=COALESCE($3,name), category=COALESCE($4,category),
        updated_at=NOW()
       WHERE id=$5 RETURNING *`,
      [fluency, notes, name, category, req.params.id]
    );
    res.json(cue);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await pool.query(`UPDATE dog_cues SET is_active=FALSE WHERE id=$1`, [req.params.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
