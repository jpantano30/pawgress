-- Cue/trick tracker
CREATE TABLE IF NOT EXISTS dog_cues (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id        UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  trainer_id    UUID REFERENCES users(id),
  name          TEXT NOT NULL,
  category      TEXT DEFAULT 'Obedience',
  fluency       INTEGER DEFAULT 1 CHECK (fluency BETWEEN 1 AND 5),
  -- 1=Introduced, 2=Learning, 3=Reliable, 4=Proofed, 5=Mastered
  notes         TEXT,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dog_cues_dog ON dog_cues(dog_id);
