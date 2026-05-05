async function runMigrations(client, schema) {
  // Create users table
  await client.query(`
      CREATE TABLE IF NOT EXISTS ${schema}.users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

  // await client.query(`
  //   CREATE TABLE IF NOT EXISTS ${schema}.projects (
  //     id SERIAL PRIMARY KEY,
  //     name TEXT,
  //     created_at TIMESTAMP DEFAULT NOW()
  //   );
  // `);
  // 
  
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${schema}.clients (
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
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS ${schema}.user_roles (
      id SERIAL PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      description TEXT,
      level INTEGER DEFAULT 0,
      active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS ${schema}.role_permissions (
      id SERIAL PRIMARY KEY,
      role_id INTEGER REFERENCES ${schema}.user_roles(id) ON DELETE CASCADE,
      module VARCHAR(50) NOT NULL,
      can_view BOOLEAN DEFAULT FALSE,
      can_edit BOOLEAN DEFAULT FALSE,
      can_assign BOOLEAN DEFAULT FALSE,
      can_approve BOOLEAN DEFAULT FALSE,
      can_reject BOOLEAN DEFAULT FALSE,
      can_export BOOLEAN DEFAULT FALSE,
      can_override BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

module.exports = { runMigrations };
