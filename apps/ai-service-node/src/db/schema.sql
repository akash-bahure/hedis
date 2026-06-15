CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS hedis_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT NOT NULL,
  measure_code TEXT NOT NULL,
  measure_name TEXT,
  eligible BOOLEAN,
  denominator BOOLEAN,
  numerator BOOLEAN,
  exclusion BOOLEAN,
  status TEXT,
  confidence FLOAT,
  reasoning TEXT,
  evidence JSONB,
  detailed_response JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ensure column exists for existing tables
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hedis_evaluations' AND column_name='detailed_response') THEN
    ALTER TABLE hedis_evaluations ADD COLUMN detailed_response JSONB;
  END IF;
END $$;

-- Index for faster retrieval by patient
CREATE INDEX IF NOT EXISTS idx_hedis_eval_patient ON hedis_evaluations(patient_id);


