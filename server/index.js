import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import dogsRouter from './routes/dogs.js';
import sessionsRouter from './routes/sessions.js';
import metricsRouter from './routes/metrics.js';
import usersRouter from './routes/users.js';
import homeworkRouter from './routes/homework.js';
import reportsRouter from './routes/reports.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// Auth middleware — decode Clerk JWT
app.use(async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }
    const token = authHeader.split(' ')[1];
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    req.auth = { userId: payload.sub };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

app.use('/api/users',    usersRouter);
app.use('/api/dogs',     dogsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/metrics',  metricsRouter);
app.use('/api/homework', homeworkRouter);
app.use('/api/reports',  reportsRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

app.listen(PORT, () => console.log(`Pawgress API running on :${PORT}`));
