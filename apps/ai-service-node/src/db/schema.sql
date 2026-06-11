CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT,
  measure TEXT,
  event_type TEXT,
  evidence TEXT,
  provider TEXT,
  event_date DATE,
  confidence FLOAT,
  source_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
