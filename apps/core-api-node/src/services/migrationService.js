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
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      project_name VARCHAR(255) NOT NULL,
      client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
      project_type VARCHAR(100),
      specialty VARCHAR(100),
      priority VARCHAR(50) DEFAULT 'High' CHECK (priority IN ('High', 'Medium', 'Low')),
      notes TEXT,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      project_manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS ${schema}.user_roles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(150) NOT NULL,
      description TEXT,
      level INTEGER DEFAULT 0,
      active BOOLEAN DEFAULT TRUE,
      system_role BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create role_permissions table with UUID references
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${schema}.role_permissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      role_id UUID REFERENCES ${schema}.user_roles(id) ON DELETE CASCADE,
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

  // Create org_users  table with extensive fields and UUID
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${schema}.org_users  (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      full_name VARCHAR(255),
      email VARCHAR(254) UNIQUE NOT NULL,
      phone VARCHAR(15),
      department VARCHAR(75),
      job_title VARCHAR(150),
      address_line_1 TEXT,
      address_line_2 TEXT,
      country VARCHAR(100),
      city VARCHAR(100),
      state VARCHAR(100),
      zip_code VARCHAR(20),
      bio TEXT,
      organization_id UUID,
      user_role_id UUID REFERENCES ${schema}.user_roles(id),
      shift VARCHAR(20), -- Morning, Afternoon, Night, General, Off
      user_type VARCHAR(20), -- Local, Azure
      send_email BOOLEAN DEFAULT TRUE,
      two_fa_auth BOOLEAN DEFAULT FALSE,
      user_status VARCHAR(20) DEFAULT 'Active', -- Pending, Active, Inactive, Suspended
      last_login TIMESTAMP,
      is_superuser BOOLEAN DEFAULT FALSE,
      is_staff BOOLEAN DEFAULT FALSE,
      is_active BOOLEAN DEFAULT TRUE,
      last_password_changed DATE,
      employee_id VARCHAR(100),
      is_super_administrator BOOLEAN DEFAULT FALSE,
      project_access UUID[] DEFAULT ARRAY[]::UUID[],
      password TEXT, -- Adding for future auth if needed
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await client.query(`
    ALTER TABLE ${schema}.org_users 
    ADD COLUMN IF NOT EXISTS invite_token TEXT,
    ADD COLUMN IF NOT EXISTS invite_token_expiry TIMESTAMP,
    ADD COLUMN IF NOT EXISTS invite_used BOOLEAN DEFAULT FALSE;
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS ${schema}.user_projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES ${schema}.org_users(id) ON DELETE CASCADE,
      project_id UUID REFERENCES ${schema}.projects(id) ON DELETE CASCADE,
      assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, project_id)
    );
  `);
}

module.exports = { runMigrations };
