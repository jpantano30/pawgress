-- Add invite code to trainers
ALTER TABLE users ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE;

-- Generate invite codes for existing trainers
UPDATE users SET invite_code = UPPER(SUBSTRING(MD5(id::text), 1, 3) || '-' || SUBSTRING(MD5(clerk_id), 1, 3))
WHERE role = 'trainer' AND invite_code IS NULL;

-- Homework practice logs
CREATE TABLE IF NOT EXISTS homework_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  dog_id        UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  client_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  logged_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, client_id, logged_date)
);

-- Session reports (richer version of sessions for day training)
CREATE TABLE IF NOT EXISTS session_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id          UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  trainer_id      UUID NOT NULL REFERENCES users(id),
  report_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  title           TEXT NOT NULL DEFAULT 'Session Report',
  status          TEXT DEFAULT 'draft' CHECK (status IN ('draft','published')),
  -- Sections stored as JSON for flexibility
  sections        JSONB DEFAULT '[]',
  overall_notes   TEXT,
  homework        TEXT,
  next_session    DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_homework_logs_session ON homework_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_homework_logs_dog ON homework_logs(dog_id);
CREATE INDEX IF NOT EXISTS idx_reports_dog ON session_reports(dog_id);
CREATE INDEX IF NOT EXISTS idx_reports_trainer ON session_reports(trainer_id);
