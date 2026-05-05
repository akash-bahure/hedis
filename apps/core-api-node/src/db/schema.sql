CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  subdomain TEXT UNIQUE,
  schema_name TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);