import { Router } from 'express';
import pool from '../db/pool.js';

const router = Router();

function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part1 = Array.from({length:3}, () => chars[Math.floor(Math.random()*chars.length)]).join('');
  const part2 = Array.from({length:3}, () => chars[Math.floor(Math.random()*chars.length)]).join('');
  return `${part1}-${part2}`;
}

// GET /api/users/me
router.get('/me', async (req, res, next) => {
  try {
    const { rows: [user] } = await pool.query(
      `SELECT * FROM users WHERE clerk_id = $1`, [req.auth.userId]
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
});

// POST /api/users — create after signup
router.post('/', async (req, res, next) => {
  try {
    const { email, full_name, role } = req.body;
    const invite_code = role === 'trainer' ? generateInviteCode() : null;

    // Keep generating until unique
    let code = invite_code;
    if (code) {
      let attempts = 0;
      while (attempts < 10) {
        const { rows: [existing] } = await pool.query(
          `SELECT id FROM users WHERE invite_code = $1`, [code]
        );
        if (!existing) break;
        code = generateInviteCode();
        attempts++;
      }
    }

    const { rows: [user] } = await pool.query(
      `INSERT INTO users (clerk_id, email, full_name, role, invite_code)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (clerk_id) DO UPDATE SET email=$2, full_name=$3
       RETURNING *`,
      [req.auth.userId, email, full_name, role, code]
    );
    res.status(201).json(user);
  } catch (err) { next(err); }
});

// POST /api/users/connect — client enters trainer invite code
router.post('/connect', async (req, res, next) => {
  try {
    const { invite_code } = req.body;
    if (!invite_code) return res.status(400).json({ error: 'Invite code required' });

    // Find trainer by code
    const { rows: [trainer] } = await pool.query(
      `SELECT * FROM users WHERE invite_code = $1 AND role = 'trainer'`,
      [invite_code.toUpperCase()]
    );
    if (!trainer) return res.status(404).json({ error: 'Invalid invite code. Check with your trainer.' });

    // Get current client
    const { rows: [client] } = await pool.query(
      `SELECT * FROM users WHERE clerk_id = $1`, [req.auth.userId]
    );
    if (!client) return res.status(404).json({ error: 'Client account not found' });

    // Create trainer_clients relationship
    await pool.query(
      `INSERT INTO trainer_clients (trainer_id, client_id)
       VALUES ($1, $2)
       ON CONFLICT (trainer_id, client_id) DO NOTHING`,
      [trainer.id, client.id]
    );

    res.json({ success: true, trainer_name: trainer.full_name });
  } catch (err) { next(err); }
});

// POST /api/users/find-or-invite
router.post('/find-or-invite', async (req, res, next) => {
  try {
    const { email, full_name } = req.body;
    const { rows: [existing] } = await pool.query(
      `SELECT * FROM users WHERE email = $1`, [email]
    );
    if (existing) {
      if (full_name && existing.full_name !== full_name) {
        const { rows: [updated] } = await pool.query(
          `UPDATE users SET full_name=$1 WHERE id=$2 RETURNING *`,
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
