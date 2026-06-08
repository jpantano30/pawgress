-- Client intake form responses stored as JSONB for flexibility
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS intake_data JSONB;
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS intake_completed_at TIMESTAMPTZ;
