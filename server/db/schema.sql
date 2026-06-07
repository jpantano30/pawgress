-- ============================================
-- PAWGRESS DATABASE SCHEMA
-- PostgreSQL
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- USERS (managed by Clerk, mirrored here)
-- ============================================
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id      TEXT UNIQUE NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  full_name     TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('trainer', 'client')),
  avatar_url    TEXT,
  is_premium    BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRAINER <-> CLIENT RELATIONSHIPS
-- ============================================
CREATE TABLE trainer_clients (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status        TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trainer_id, client_id)
);

-- ============================================
-- DOGS
-- ============================================
CREATE TABLE dogs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trainer_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  breed           TEXT,
  date_of_birth   DATE,
  photo_url       TEXT,
  notes           TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BEHAVIOR METRICS (configurable per dog)
-- e.g. "Leash Reactivity", "Focus Duration", "Sit Stay"
-- ============================================
CREATE TABLE behavior_metrics (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id        UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  trainer_id    UUID NOT NULL REFERENCES users(id),
  name          TEXT NOT NULL,
  description   TEXT,
  scale_min     INTEGER DEFAULT 1,
  scale_max     INTEGER DEFAULT 10,
  lower_is_better BOOLEAN DEFAULT FALSE,  -- e.g. reactivity score: lower = better
  color         TEXT DEFAULT '#6366f1',
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRAINING SESSIONS
-- ============================================
CREATE TABLE sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id          UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  trainer_id      UUID NOT NULL REFERENCES users(id),
  session_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_mins   INTEGER,
  location        TEXT,
  overall_rating  INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
  trainer_notes   TEXT,
  homework        TEXT,        -- visible to client
  summary         TEXT,        -- client-facing summary
  is_published    BOOLEAN DEFAULT FALSE,  -- controls client visibility
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BEHAVIOR SCORES (logged per session per metric)
-- ============================================
CREATE TABLE behavior_scores (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  metric_id       UUID NOT NULL REFERENCES behavior_metrics(id) ON DELETE CASCADE,
  score           NUMERIC(4,1) NOT NULL,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, metric_id)
);

-- ============================================
-- SKILLS / CURRICULUM ITEMS (premium)
-- ============================================
CREATE TABLE skills (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id          UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  trainer_id      UUID NOT NULL REFERENCES users(id),
  name            TEXT NOT NULL,
  category        TEXT,   -- e.g. 'Obedience', 'Tricks', 'Reactivity'
  status          TEXT DEFAULT 'not_started'
                    CHECK (status IN ('not_started','in_progress','mastered')),
  target_date     DATE,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_dogs_owner         ON dogs(owner_id);
CREATE INDEX idx_dogs_trainer       ON dogs(trainer_id);
CREATE INDEX idx_sessions_dog       ON sessions(dog_id);
CREATE INDEX idx_sessions_trainer   ON sessions(trainer_id);
CREATE INDEX idx_sessions_date      ON sessions(session_date DESC);
CREATE INDEX idx_behavior_scores_session ON behavior_scores(session_id);
CREATE INDEX idx_behavior_scores_metric  ON behavior_scores(metric_id);
CREATE INDEX idx_metrics_dog        ON behavior_metrics(dog_id);
