import { Router } from 'express';
import pool from '../db/pool.js';
import { sendIntakeCompleted } from '../utils/email.js';

const router = Router();

async function getInternalUser(clerkId) {
  const { rows: [user] } = await pool.query(
    `SELECT id, role FROM users WHERE clerk_id=$1`, [clerkId]
  );
  return user || null;
}

function generateDogCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const p1 = Array.from({length:3}, () => chars[Math.floor(Math.random()*chars.length)]).join('');
  const p2 = Array.from({length:3}, () => chars[Math.floor(Math.random()*chars.length)]).join('');
  return `${p1}-${p2}`;
}

async function uniqueDogCode(pool) {
  let code, attempts = 0;
  do {
    code = generateDogCode();
    const { rows: [ex] } = await pool.query(`SELECT id FROM dogs WHERE dog_code=$1`, [code]);
    if (!ex) return code;
  } while (++attempts < 10);
  return code;
}

// GET /api/dogs
router.get('/', async (req, res, next) => {
  try {
    const user = await getInternalUser(req.auth.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const column = user.role === 'trainer' ? 'trainer_id' : 'owner_id';
    const { rows } = await pool.query(
      `SELECT d.*, u.full_name AS owner_name
       FROM dogs d JOIN users u ON u.id=d.owner_id
       WHERE d.${column}=$1 AND d.is_active=TRUE ORDER BY d.name`,
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
       FROM dogs d JOIN users u ON u.id=d.owner_id WHERE d.id=$1`,
      [req.params.id]
    );
    if (!dog) return res.status(404).json({ error: 'Dog not found' });
    const { rows: metrics } = await pool.query(
      `SELECT * FROM behavior_metrics WHERE dog_id=$1 AND is_active=TRUE ORDER BY name`,
      [req.params.id]
    );
    res.json({ ...dog, metrics });
  } catch (err) { next(err); }
});

// POST /api/dogs — trainer adds a dog
router.post('/', async (req, res, next) => {
  try {
    const user = await getInternalUser(req.auth.userId);
    if (!user || user.role !== 'trainer') return res.status(403).json({ error: 'Trainers only' });
    const { name, breed, date_of_birth, owner_id, notes, photo_url } = req.body;
    const dog_code = await uniqueDogCode(pool);
    const { rows: [dog] } = await pool.query(
      `INSERT INTO dogs (name, breed, date_of_birth, owner_id, trainer_id, notes, photo_url, dog_code)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [name, breed||null, date_of_birth||null, owner_id, user.id, notes||null, photo_url||null, dog_code]
    );
    res.status(201).json(dog);
  } catch (err) { next(err); }
});

// POST /api/dogs/client-add — client adds or claims a dog
router.post('/client-add', async (req, res, next) => {
  try {
    const user = await getInternalUser(req.auth.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { name, breed, invite_code, dog_code } = req.body;

    // If dog_code provided — claim existing dog
    if (dog_code) {
      const { rows: [existing] } = await pool.query(
        `SELECT * FROM dogs WHERE dog_code=$1`, [dog_code.trim().toUpperCase()]
      );
      if (!existing) return res.status(404).json({ error: 'Dog code not found. Check with your trainer.' });

      // Link this client as the owner
      const { rows: [updated] } = await pool.query(
        `UPDATE dogs SET owner_id=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
        [user.id, existing.id]
      );

      // Also ensure trainer_clients relationship exists
      if (existing.trainer_id) {
        await pool.query(
          `INSERT INTO trainer_clients (trainer_id, client_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
          [existing.trainer_id, user.id]
        );
      }
      return res.json({ ...updated, claimed: true });
    }

    // Otherwise create a new dog
    if (!name?.trim()) return res.status(400).json({ error: 'Dog name required' });

    let trainer_id = null;
    if (invite_code) {
      const { rows: [trainer] } = await pool.query(
        `SELECT id FROM users WHERE invite_code=$1 AND role='trainer'`,
        [invite_code.toUpperCase()]
      );
      if (trainer) {
        trainer_id = trainer.id;
        await pool.query(
          `INSERT INTO trainer_clients (trainer_id, client_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
          [trainer_id, user.id]
        );
      }
    } else {
      const { rows: [rel] } = await pool.query(
        `SELECT trainer_id FROM trainer_clients WHERE client_id=$1 LIMIT 1`, [user.id]
      );
      if (rel) trainer_id = rel.trainer_id;
    }

    const dog_code_new = await uniqueDogCode(pool);
    const { rows: [dog] } = await pool.query(
      `INSERT INTO dogs (name, breed, owner_id, trainer_id, dog_code)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [name.trim(), breed?.trim()||null, user.id, trainer_id, dog_code_new]
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

// PATCH /api/dogs/:id/intake
router.patch('/:id/intake', async (req, res, next) => {
  try {
    const { intake_data } = req.body;
    const { rows: [dog] } = await pool.query(
      `UPDATE dogs SET intake_data=$1::jsonb, intake_completed_at=NOW(), updated_at=NOW()
       WHERE id=$2 RETURNING *`,
      [JSON.stringify(intake_data), req.params.id]
    );
    if (!dog) return res.status(404).json({ error: 'Dog not found' });

    // Notify trainer
    try {
      const { rows: [trainerRow] } = await pool.query(
        `SELECT u.email, u.full_name FROM users u JOIN dogs d ON d.trainer_id=u.id WHERE d.id=$1`,
        [req.params.id]
      );
      const { rows: [ownerRow] } = await pool.query(
        `SELECT full_name FROM users WHERE id=$1`, [dog.owner_id]
      );
      if (trainerRow?.email) {
        sendIntakeCompleted({
          trainerEmail: trainerRow.email, trainerName: trainerRow.full_name,
          clientName: ownerRow?.full_name, dogName: dog.name
        });
      }
    } catch (e) { console.error('Intake email failed:', e.message); }

    res.json(dog);
  } catch (err) { next(err); }
});

export default router;
