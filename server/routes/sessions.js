import { Router } from 'express';
import pool from '../db/pool.js';
import { sendSessionPublished, sendHomeworkAssigned } from '../utils/email.js';

const router = Router();

async function getInternalUser(clerkId) {
  const { rows: [user] } = await pool.query(`SELECT id, role FROM users WHERE clerk_id=$1`, [clerkId]);
  return user || null;
}

router.get('/stats', async (req, res, next) => {
  try {
    const user = await getInternalUser(req.auth.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { rows: [stats] } = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE DATE_TRUNC('month',session_date)=DATE_TRUNC('month',CURRENT_DATE)) AS sessions_this_month,
        ROUND(AVG(overall_rating)::numeric,1) AS avg_rating,
        COUNT(*) FILTER (WHERE is_published=FALSE) AS drafts
      FROM sessions WHERE trainer_id=$1`, [user.id]
    );
    res.json(stats);
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const { dog_id } = req.query;
    const user = await getInternalUser(req.auth.userId);
    const publishedClause = user?.role === 'client' ? 'AND s.is_published=TRUE' : '';
    const { rows } = await pool.query(`
      SELECT s.*,
        json_agg(json_build_object('metric_id',bs.metric_id,'metric_name',bm.name,'score',bs.score,'color',bm.color) ORDER BY bm.name)
        FILTER (WHERE bs.id IS NOT NULL) AS scores
      FROM sessions s
      LEFT JOIN behavior_scores bs ON bs.session_id=s.id
      LEFT JOIN behavior_metrics bm ON bm.id=bs.metric_id
      WHERE s.dog_id=$1 ${publishedClause}
      GROUP BY s.id ORDER BY s.session_date DESC`, [dog_id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const user = await getInternalUser(req.auth.userId);
    if (!user || user.role !== 'trainer') return res.status(403).json({ error: 'Trainers only' });

    const { dog_id, session_date, duration_mins, location, overall_rating, summary, homework, is_published, scores=[] } = req.body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows: [session] } = await client.query(`
        INSERT INTO sessions (dog_id,trainer_id,session_date,duration_mins,location,overall_rating,summary,homework,is_published)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [dog_id, user.id, session_date, duration_mins||null, location||null, overall_rating, summary||null, homework||null, is_published??true]
      );
      for (const { metric_id, score } of scores) {
        await client.query(`INSERT INTO behavior_scores (session_id,metric_id,score) VALUES ($1,$2,$3)`, [session.id, metric_id, score]);
      }
      await client.query('COMMIT');

      // Send email if published
      if (is_published) {
        const { rows: [dogRow] } = await pool.query(
          `SELECT d.name AS dog_name, u.email AS client_email, u.full_name AS client_name
           FROM dogs d JOIN users u ON u.id=d.owner_id WHERE d.id=$1`, [dog_id]
        );
        const { rows: [trainerRow] } = await pool.query(`SELECT full_name FROM users WHERE id=$1`, [user.id]);
        if (dogRow?.client_email) {
          sendSessionPublished({
            clientEmail: dogRow.client_email, clientName: dogRow.client_name,
            dogName: dogRow.dog_name, trainerName: trainerRow?.full_name,
            sessionDate: session_date, homework
          });
          if (homework) {
            sendHomeworkAssigned({ clientEmail: dogRow.client_email, clientName: dogRow.client_name, dogName: dogRow.dog_name, homework });
          }
        }
      }
      res.status(201).json(session);
    } catch (err) { await client.query('ROLLBACK'); throw err; }
    finally { client.release(); }
  } catch (err) { next(err); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const user = await getInternalUser(req.auth.userId);
    if (!user || user.role !== 'trainer') return res.status(403).json({ error: 'Trainers only' });

    const { session_date, duration_mins, location, overall_rating, summary, homework, is_published, scores } = req.body;

    // Check if we're newly publishing
    const { rows: [existing] } = await pool.query(`SELECT is_published, dog_id FROM sessions WHERE id=$1`, [req.params.id]);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows: [session] } = await client.query(`
        UPDATE sessions SET
          session_date=COALESCE($1,session_date), duration_mins=$2, location=$3,
          overall_rating=COALESCE($4,overall_rating), summary=$5, homework=$6,
          is_published=COALESCE($7,is_published), updated_at=NOW()
        WHERE id=$8 AND trainer_id=$9 RETURNING *`,
        [session_date, duration_mins||null, location||null, overall_rating, summary||null, homework||null, is_published, req.params.id, user.id]
      );
      if (!session) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Session not found' }); }

      if (scores !== undefined) {
        await client.query(`DELETE FROM behavior_scores WHERE session_id=$1`, [req.params.id]);
        for (const { metric_id, score } of scores) {
          await client.query(`INSERT INTO behavior_scores (session_id,metric_id,score) VALUES ($1,$2,$3)`, [req.params.id, metric_id, score]);
        }
      }
      await client.query('COMMIT');

      // Email if newly published
      if (is_published && !existing?.is_published) {
        const { rows: [dogRow] } = await pool.query(
          `SELECT d.name AS dog_name, u.email AS client_email, u.full_name AS client_name
           FROM dogs d JOIN users u ON u.id=d.owner_id WHERE d.id=$1`, [existing.dog_id]
        );
        const { rows: [trainerRow] } = await pool.query(`SELECT full_name FROM users WHERE id=$1`, [user.id]);
        if (dogRow?.client_email) {
          sendSessionPublished({
            clientEmail: dogRow.client_email, clientName: dogRow.client_name,
            dogName: dogRow.dog_name, trainerName: trainerRow?.full_name,
            sessionDate: session.session_date, homework: session.homework
          });
        }
      }
      res.json(session);
    } catch (err) { await client.query('ROLLBACK'); throw err; }
    finally { client.release(); }
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const user = await getInternalUser(req.auth.userId);
    if (!user || user.role !== 'trainer') return res.status(403).json({ error: 'Trainers only' });
    await pool.query(`DELETE FROM sessions WHERE id=$1 AND trainer_id=$2`, [req.params.id, user.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
