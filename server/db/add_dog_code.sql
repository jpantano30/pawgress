ALTER TABLE dogs ADD COLUMN IF NOT EXISTS dog_code TEXT UNIQUE;

-- Generate codes for existing dogs
UPDATE dogs SET dog_code = UPPER(
  SUBSTRING(MD5(id::text), 1, 3) || '-' || SUBSTRING(MD5(name || id::text), 1, 3)
) WHERE dog_code IS NULL;
