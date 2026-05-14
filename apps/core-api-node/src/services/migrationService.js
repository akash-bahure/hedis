async function runMigrations(client, schema) {
  // Create users table

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

      -- Internal UUID
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

      -- Client Display ID
      client_id VARCHAR(20) UNIQUE NOT NULL,

      org_name VARCHAR(200) NOT NULL UNIQUE,

      short_code VARCHAR(50) NOT NULL UNIQUE,

      region VARCHAR(50) NOT NULL CHECK (
        region IN (
          'West',
          'South',
          'Northeast',
          'Southeast',
          'Midwest',
          'Mountain'
        )
      ),

      plan_tier VARCHAR(50) DEFAULT 'Professional' CHECK (
        plan_tier IN (
          'Basic',
          'Professional',
          'Enterprise'
        )
      ),

      status VARCHAR(50) DEFAULT 'Onboarding' CHECK (
        status IN (
          'Active',
          'Inactive',
          'Onboarding',
          'At Risk'
        )
      ),

      contract_type VARCHAR(100) NOT NULL CHECK (
        contract_type IN (
          'HEDIS Hybrid',
          'HEDIS Administrative',
          'HEDIS Electronic',
          'Multi-Measure'
        )
      ),

      measure_year VARCHAR(50) NOT NULL CHECK (
        measure_year IN (
          'MY2024',
          'MY2025',
          'MY2026',
          'MY2027'
        )
      ),

      total_charts INTEGER NOT NULL,

      completed_charts INTEGER DEFAULT 0,

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

  // Create departments table
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${schema}.departments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create users  table with extensive fields and UUID
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${schema}.users  (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      full_name VARCHAR(255),
      credentials VARCHAR(255),
      email VARCHAR(254) UNIQUE NOT NULL,
      phone VARCHAR(20),
      mobile_phone VARCHAR(20),
      department_id UUID REFERENCES ${schema}.departments(id) ON DELETE SET NULL,
      job_title VARCHAR(150),
      address_line_1 TEXT,
      address_line_2 TEXT,
      country VARCHAR(100),
      city VARCHAR(100),
      state VARCHAR(100),
      zip_code VARCHAR(20),
      location VARCHAR(255),
      bio TEXT,
      organization_id UUID,
      user_role_id UUID REFERENCES ${schema}.user_roles(id) ON DELETE SET NULL,
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
      preferences JSONB DEFAULT '{}'::jsonb,
      certifications JSONB DEFAULT '[]'::jsonb,
      notifications JSONB DEFAULT '{}'::jsonb,
      security JSONB DEFAULT '{}'::jsonb,
      reset_token TEXT,
      reset_token_expiry TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await client.query(`
  INSERT INTO ${schema}.user_roles 
    (name, description, level, system_role, active)
  VALUES
    (
      'Operations/Program Manager',
      'Default System Role',
      1,
      TRUE,
      TRUE
    ),
    (
      'Chart Abstractor',
      'Default System Role',
      2,
      TRUE,
      TRUE
    ),
    (
      'Quality Analyst',
      'Default System Role',
      3,
      TRUE,
      TRUE
    )
  ON CONFLICT DO NOTHING;
`);

  // Ensure new fields are added to existing schemas without wiping data
  try {
    await client.query(`
      ALTER TABLE ${schema}.users
        ADD COLUMN IF NOT EXISTS credentials VARCHAR(255),
        ADD COLUMN IF NOT EXISTS mobile_phone VARCHAR(20),
        ADD COLUMN IF NOT EXISTS location VARCHAR(255),
        ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb,
        ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS notifications JSONB DEFAULT '{}'::jsonb,
        ADD COLUMN IF NOT EXISTS security JSONB DEFAULT '{}'::jsonb;
    `);
  } catch (err) {
    // Columns might already exist or other harmless error
  }

  await client.query(`
   CREATE TABLE IF NOT EXISTS ${schema}.projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_name VARCHAR(255) NOT NULL,
      client_id UUID REFERENCES ${schema}.clients(id) ON DELETE CASCADE,
      project_type VARCHAR(100) CHECK (
        project_type IN (
          'Inpatient',
          'Outpatient',
          'ED Visit',
          'HCC'
        )
      ),
      specialty VARCHAR(100) CHECK (
        specialty IN (
          'Multi-Speciality',
          'Cardiology',
          'Orthopedics',
          'Emergency Med.',
          'Radiology',
          'Oncology',
          'Cardiothoracic',
          'Pediatrics'
        )
      ),
      priority VARCHAR(50) DEFAULT 'High' CHECK (priority IN ('High', 'Medium', 'Low')),
      notes TEXT,
      status VARCHAR(50) DEFAULT 'Draft' CHECK (
        status IN (
          'Active',
          'Completed',
          'At Risk',
          'On Hold',
          'Draft'
        )
      ),
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      project_manager_id UUID REFERENCES ${schema}.users(id) ON DELETE SET NULL,
      total_charts INTEGER DEFAULT 0,
      completed_charts INTEGER DEFAULT 0,
      pending_charts INTEGER DEFAULT 0,
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

  await client.query(`
    ALTER TABLE ${schema}.users 
    ADD COLUMN IF NOT EXISTS invite_token TEXT,
    ADD COLUMN IF NOT EXISTS invite_token_expiry TIMESTAMP,
    ADD COLUMN IF NOT EXISTS invite_used BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS reset_token TEXT,
    ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS ${schema}.user_projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES ${schema}.users(id) ON DELETE CASCADE,
      project_id UUID REFERENCES ${schema}.projects(id) ON DELETE CASCADE,
      assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, project_id)
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS ${schema}.user_project_access (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES ${schema}.users(id) ON DELETE CASCADE,
      project_id UUID REFERENCES ${schema}.projects(id) ON DELETE CASCADE,
      access_level VARCHAR(20) DEFAULT 'None' CHECK (access_level IN ('Full', 'Edit', 'View', 'None')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, project_id)
    );
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${schema}.user_shifts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES ${schema}.users(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      shift VARCHAR(20) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, date)
    );
  `);
}

module.exports = { runMigrations };
