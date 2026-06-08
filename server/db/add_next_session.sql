ALTER TABLE sessions ADD COLUMN IF NOT EXISTS next_session_date DATE;
ALTER TABLE session_reports ADD COLUMN IF NOT EXISTS next_session DATE;
