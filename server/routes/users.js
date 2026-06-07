import { Router } from 'express';
import pool from '../db/pool.js';

const router = Router();

router.get('/me', async (req, res, next) => {
  try {
    const { rows: [user] } = await pool.query(
      `SELECT * FROM users WHERE clerk_id = $1`, [req.auth.userId]
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { email, full_name, role } = req.body;
    const { rows: [user] } = await pool.query(
      `INSERT INTO users (clerk_id, email, full_name, role)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (clerk_id) DO UPDATE SET email=$2, full_name=$3
       RETURNING *`,
      [req.auth.userId, email, full_name, role]
    );
    res.status(201).json(user);
  } catch (err) { next(err); }
});

router.post('/find-or-invite', async (req, res, next) => {
  try {
    const { email, full_name } = req.body;
    const { rows: [existing] } = await pool.query(
      `SELECT * FROM users WHERE email = $1`, [email]
    );
    if (existing) {
      // Update name if we now have it
      if (full_name && existing.full_name !== full_name) {
        const { rows: [updated] } = await pool.query(
          `UPDATE users SET full_name = $1 WHERE id = $2 RETURNING *`,
          [full_name, existing.id]
        );
        return res.json(updated);
      }
      return res.json(existing);
    }
    const { rows: [user] } = await pool.query(
      `INSERT INTO users (clerk_id, email, full_name, role)
       VALUES ($1,$2,$3,'client') RETURNING *`,
      [`pending_${email}`, email, full_name || email.split('@')[0]]
    );
    res.status(201).json(user);
  } catch (err) { next(err); }
});

export default router;
