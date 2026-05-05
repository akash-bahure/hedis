CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_name VARCHAR(200) NOT NULL UNIQUE,
  short_code VARCHAR(50) NOT NULL UNIQUE,
  region VARCHAR(50) NOT NULL CHECK (region IN ('North', 'South', 'East', 'West')),
  plan_tier VARCHAR(50) DEFAULT 'Professional' CHECK (plan_tier IN ('Basic', 'Professional', 'Enterprise')),
  status VARCHAR(50) DEFAULT 'Onboarding' CHECK (status IN ('Onboarding', 'Active', 'Inactive')),
  contract_type VARCHAR(100) NOT NULL CHECK (contract_type IN ('HEDIS Hybrid', 'HEDIS Administrative', 'HEDIS Electronic', 'Multi-Measure')),
  measure_year VARCHAR(50) NOT NULL CHECK (measure_year IN ('MY2024', 'MY2025', 'MY2026', 'MY2027')),
  total_charts INTEGER NOT NULL,
  start_date DATE NOT NULL,
  due_date DATE NOT NULL,
  primary_contact_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(20),
  abstractors_assigned INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);