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
      employee_id VARCHAR(100) UNIQUE,
      member_since DATE DEFAULT CURRENT_DATE,
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
      'Admin',
      'Tenant Administrator Role',
      0,
      TRUE,
      TRUE
    ),
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
        ADD COLUMN IF NOT EXISTS employee_id VARCHAR(100),
        ADD COLUMN IF NOT EXISTS member_since DATE DEFAULT CURRENT_DATE,
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
      project_id VARCHAR(50) UNIQUE NOT NULL,
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
          'Pediatrics',
          'Neurology',
          'Gastroenterology'
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

  try {
    await client.query(`
      ALTER TABLE ${schema}.projects
        ADD COLUMN IF NOT EXISTS project_id VARCHAR(50) UNIQUE,
        ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Draft',
        ADD COLUMN IF NOT EXISTS specialty VARCHAR(100),
        ADD COLUMN IF NOT EXISTS notes TEXT,
        ADD COLUMN IF NOT EXISTS total_charts INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS completed_charts INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS pending_charts INTEGER DEFAULT 0;
    `);
  } catch (err) {
    // Columns might already exist or other harmless error
  }

  

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

  await client.query(`CREATE TABLE IF NOT EXISTS ${schema}.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Internal
  patient_id VARCHAR(50) UNIQUE NOT NULL,

  -- External System IDs
  external_patient_id UUID UNIQUE,
  external_project_id UUID,

  -- Patient Details
  first_name VARCHAR(150),
  last_name VARCHAR(150),
  dob DATE,
  gender VARCHAR(20),

  -- Dashboard Fields
  measure VARCHAR(100),
  plan VARCHAR(100),
  priority VARCHAR(50),
  stage VARCHAR(50) DEFAULT 'Unassigned',

  -- SLA
  due_date TIMESTAMP,

  -- Relationships
  project_id UUID REFERENCES ${schema}.projects(id),
  client_id UUID REFERENCES ${schema}.clients(id),


  -- Assignment
  assigned_to UUID REFERENCES ${schema}.users(id),
  abstractor_id UUID REFERENCES ${schema}.users(id),
  qa_id UUID REFERENCES ${schema}.users(id),


  -- Metadata
  last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`);

  await client.query(`CREATE TABLE IF NOT EXISTS ${schema}.patient_charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES ${schema}.patients(id) ON DELETE CASCADE,
  external_chart_id UUID UNIQUE,
  chart_id VARCHAR(100),
  status VARCHAR(100),
  encounter_type VARCHAR(100),
  specialty VARCHAR(100),
  facility VARCHAR(255),
  encounter_date DATE,
  admission_date DATE,
  discharge_date DATE,
  priority VARCHAR(50),
  chart_document JSONB,
  coding_notes TEXT,
  sla_deadline TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`);

  await client.query(`
  CREATE TABLE IF NOT EXISTS ${schema}.manual_chart_abstractions (

  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- RELATIONSHIPS
  patient_id UUID NOT NULL
  REFERENCES ${schema}.patients(id)
  ON DELETE CASCADE,

  patient_chart_id UUID NOT NULL
  REFERENCES ${schema}.patient_charts(id)
  ON DELETE CASCADE,

  created_by UUID
  REFERENCES ${schema}.users(id),

  assigned_qa UUID
  REFERENCES ${schema}.users(id),

  -- SERVICE DETAILS
  service_date DATE,

  screening_type VARCHAR(255),

  -- EVIDENCE TYPE
  evidence_type VARCHAR(255)
  CHECK (
    evidence_type IN (
      'Office Visit BP Reading',
      'Specialist Consult BP Reading',
      'Telehealth Visit BP Reading',
      'Home BP Monitoring Record',
      'Annual Wellness Visit',
      'Emergency Dept. Reading',
      'Urgent Care Reading'
    )
  ),

  -- BP VALUES
  systolic INTEGER,

  diastolic INTEGER,

  -- CPT CODE
  cpt_code VARCHAR(50)
  CHECK (
    cpt_code IN (
      '99211',
      '99212',
      '99213',
      '99214',
      '99215',
      '99397',
      'G0438',
      'G0439'
    )
  ),

  -- ICD-10
  icd_10_code VARCHAR(50)
  CHECK (
    icd_10_code IN (
      'I10',
      'I11.9',
      'I12.9',
      'N18.3',
      'E11.9'
    )
  ),

  -- SOURCE TYPE
  source_type VARCHAR(255)
  CHECK (
    source_type IN (
      'Electronic Health Record (EHR)',
      'Physician Office Chart Note',
      'Hospital Medical Record',
      'Specialist Consultation Note',
      'Telehealth Encounter Record',
      'Home BP Monitoring Report',
      'Patient-Reported Form'
    )
  ),

  evidence_source TEXT,

  uploaded_document JSONB,

  notes TEXT,

  -- WORKFLOW
  abstraction_status VARCHAR(100)
  DEFAULT 'Pending QA',

  qa_status VARCHAR(100)
  DEFAULT 'Pending',

  submitted_to_qa_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  reviewed_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`);

  await client.query(`
  ALTER TABLE ${schema}.patient_charts
  ADD COLUMN IF NOT EXISTS abstraction_status
  VARCHAR(100) DEFAULT 'Pending';
`);


await client.query(`
CREATE TABLE IF NOT EXISTS ${schema}.chart_assignments (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Chart Reference
    patient_chart_id UUID NOT NULL
    REFERENCES ${schema}.patient_charts(id)
    ON DELETE CASCADE,

    -- Assigned User
    assigned_to UUID NOT NULL
    REFERENCES ${schema}.users(id)
    ON DELETE CASCADE,

    -- Role of Assigned User
    assigned_role VARCHAR(100) NOT NULL
    CHECK (
      assigned_role IN (
        'Chart Abstractor',
        'Quality Analyst'
      )
    ),

    -- Priority
    priority VARCHAR(50) DEFAULT 'Medium'
    CHECK (
      priority IN (
        'Urgent',
        'High',
        'Medium',
        'Low'
      )
    ),

    -- Assignment Notes
    assignment_note TEXT,

    -- Workflow Status
    assignment_status VARCHAR(100) DEFAULT 'Assigned'
    CHECK (
      assignment_status IN (
        'Assigned',
        'In Progress',
        'Completed',
        'Rejected'
      )
    ),

    -- Metadata
    assigned_by UUID
    REFERENCES ${schema}.users(id),

    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`);

  await client.query(`
  CREATE TABLE IF NOT EXISTS ${schema}.user_otp_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL,
    otp VARCHAR(6) NOT NULL,
    device_type TEXT,
    device_id TEXT,
    verified BOOLEAN DEFAULT false,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`);

  await client.query(`
  CREATE TABLE IF NOT EXISTS ${schema}.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    user_name TEXT,
    event_type VARCHAR(100),
    details TEXT,
    ip_address VARCHAR(45),
    device TEXT,
    location TEXT,
    risk_level VARCHAR(20), -- 'Low', 'Medium', 'High', 'Critical'
    status VARCHAR(20),     -- 'Success', 'Failed', 'Warning'
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON ${schema}.audit_logs(event_type);
  CREATE INDEX IF NOT EXISTS idx_audit_logs_risk_level ON ${schema}.audit_logs(risk_level);
  CREATE INDEX IF NOT EXISTS idx_audit_logs_status ON ${schema}.audit_logs(status);
  CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON ${schema}.audit_logs(created_at DESC);
`);
}


module.exports = { runMigrations };
