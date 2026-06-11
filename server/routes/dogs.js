import { Router } from 'express';
import { sendIntakeCompleted } from '../utils/email.js';
import pool from '../db/pool.js';

const router = Router();

async function getInternalUser(clerkId) {
  const { rows: [user] } = await pool.query(
    `SELECT id, role FROM users WHERE clerk_id = $1`, [clerkId]
  );
  return user || null;
}

// GET /api/dogs
router.get('/', async (req, res, next) => {
  try {
    const user = await getInternalUser(req.auth.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const column = user.role === 'trainer' ? 'trainer_id' : 'owner_id';
    const { rows } = await pool.query(
      `SELECT d.*, u.full_name AS owner_name
       FROM dogs d JOIN users u ON u.id = d.owner_id
       WHERE d.${column} = $1 AND d.is_active = TRUE ORDER BY d.name`,
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
       WHERE d.id = $1`, [req.params.id]
    );
    if (!dog) return res.status(404).json({ error: 'Dog not found' });
    const { rows: metrics } = await pool.query(
      `SELECT * FROM behavior_metrics WHERE dog_id=$1 AND is_active=TRUE ORDER BY name`,
      [req.params.id]
    );
    res.json({ ...dog, metrics });
  } catch (err) { next(err); }
});

// POST /api/dogs — trainer adds a dog for a client
router.post('/', async (req, res, next) => {
  try {
    const user = await getInternalUser(req.auth.userId);
    if (!user || user.role !== 'trainer') return res.status(403).json({ error: 'Trainers only' });
    const { name, breed, date_of_birth, owner_id, notes, photo_url } = req.body;
    const { rows: [dog] } = await pool.query(
      `INSERT INTO dogs (name, breed, date_of_birth, owner_id, trainer_id, notes, photo_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name, breed||null, date_of_birth||null, owner_id, user.id, notes||null, photo_url||null]
    );
    res.status(201).json(dog);
  } catch (err) { next(err); }
});

// POST /api/dogs/client-add — client adds their own dog
router.post('/client-add', async (req, res, next) => {
  try {
    const user = await getInternalUser(req.auth.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { name, breed, invite_code } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Dog name required' });

    // Find trainer if invite code provided
    let trainer_id = null;
    if (invite_code) {
      const { rows: [trainer] } = await pool.query(
        `SELECT id FROM users WHERE invite_code=$1 AND role='trainer'`,
        [invite_code.toUpperCase()]
      );
      if (trainer) {
        trainer_id = trainer.id;
        // Ensure trainer_clients relationship exists
        await pool.query(
          `INSERT INTO trainer_clients (trainer_id, client_id)
           VALUES ($1,$2) ON CONFLICT DO NOTHING`,
          [trainer_id, user.id]
        );
      }
    } else {
      // Check if client already connected to a trainer
      const { rows: [rel] } = await pool.query(
        `SELECT trainer_id FROM trainer_clients WHERE client_id=$1 LIMIT 1`,
        [user.id]
      );
      if (rel) trainer_id = rel.trainer_id;
    }

    const { rows: [dog] } = await pool.query(
      `INSERT INTO dogs (name, breed, owner_id, trainer_id)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [name.trim(), breed?.trim()||null, user.id, trainer_id]
    );
    res.status(201).json(dog);
  } catch (err) { next(err); }
});

// PATCH /api/dogs/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const user = await getInternalUser(req.auth.userId);
    if (!user || user.role !== 'trainer') return res.status(403).json({ error: 'Trainers only' });
    const { name, breed, notes, photo_url, is_active } = req.body;
    const { rows: [dog] } = await pool.query(
      `UPDATE dogs SET
        name=COALESCE($1,name), breed=COALESCE($2,breed),
        notes=COALESCE($3,notes), photo_url=COALESCE($4,photo_url),
        is_active=COALESCE($5,is_active), updated_at=NOW()
       WHERE id=$6 AND trainer_id=$7 RETURNING *`,
      [name, breed, notes, photo_url, is_active, req.params.id, user.id]
    );
    if (!dog) return res.status(404).json({ error: 'Dog not found' });
    res.json(dog);
  } catch (err) { next(err); }
});

export default router;

// PATCH /api/dogs/:id/intake — save intake form (client or trainer)
router.patch('/:id/intake', async (req, res, next) => {
  try {
    const { intake_data } = req.body;
    const { rows: [dog] } = await pool.query(
      `UPDATE dogs SET
        intake_data = $1::jsonb,
        intake_completed_at = NOW(),
        updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [JSON.stringify(intake_data), req.params.id]
    );
    if (!dog) return res.status(404).json({ error: 'Dog not found' });
    res.json(dog);
  } catch (err) { next(err); }
});
