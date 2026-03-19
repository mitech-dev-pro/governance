-- ============================================================
-- ISMS / ISO 27001 Governance Dashboard
-- Startup-safe schema for Express + MySQL
-- 2. Triggers removed because updated_at already uses
--    ON UPDATE CURRENT_TIMESTAMP.
-- 3. Index section removed for safer Node startup execution.
-- ============================================================
CREATE TABLE IF NOT EXISTS
  asset_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
  );

CREATE TABLE IF NOT EXISTS
  asset_classifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
  );

CREATE TABLE IF NOT EXISTS
  users (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );

CREATE TABLE IF NOT EXISTS
  roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL,
    type_id INT,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );

CREATE TABLE IF NOT EXISTS
  permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );

CREATE TABLE IF NOT EXISTS
  departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );

CREATE TABLE IF NOT EXISTS
  user_roles (
    user_id CHAR(36) NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE
  );

CREATE TABLE IF NOT EXISTS
  role_permissions (
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions (id) ON DELETE CASCADE
  );

CREATE TABLE IF NOT EXISTS
  governance_items (
    id CHAR(36) PRIMARY KEY,
    item_code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'draft',
    owner_id CHAR(36),
    reviewer_id CHAR(36),
    approved_by CHAR(36),
    approved_date DATE,
    review_date DATE,
    next_review_date DATE,
    iso27001_clause VARCHAR(20),
    priority VARCHAR(20) DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users (id),
    FOREIGN KEY (reviewer_id) REFERENCES users (id),
    FOREIGN KEY (approved_by) REFERENCES users (id)
  );

CREATE TABLE IF NOT EXISTS
  assets (
    id CHAR(36) PRIMARY KEY,
    asset_tag VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type_id INT,
    classification_id INT,
    category VARCHAR(100),
    location VARCHAR(255),
    owner_id CHAR(36),
    custodian_id CHAR(36),
    status VARCHAR(50) DEFAULT 'active',
    acquisition_date DATE,
    disposal_date DATE,
    cost DECIMAL(12, 2),
    serial_number VARCHAR(255),
    ip_address VARCHAR(50),
    mac_address VARCHAR(50),
    operating_system VARCHAR(100),
    criticality VARCHAR(20) DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users (id),
    FOREIGN KEY (custodian_id) REFERENCES users (id),
    FOREIGN KEY (type_id) REFERENCES asset_types (id),
    FOREIGN KEY (classification_id) REFERENCES asset_classifications (id)
  );

CREATE TABLE IF NOT EXISTS
  audits (
    id CHAR(36) PRIMARY KEY,
    audit_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    scope TEXT,
    criteria TEXT,
    lead_auditor_id CHAR(36),
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'planned',
    summary TEXT,
    overall_result VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_auditor_id) REFERENCES users (id)
  );

CREATE TABLE IF NOT EXISTS
  controls (
    id CHAR(36) PRIMARY KEY,
    control_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'draft',
    owner_id CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users (id)
  );

CREATE TABLE IF NOT EXISTS
  control_tests (
    id CHAR(36) PRIMARY KEY,
    control_id CHAR(36),
    test_date DATE,
    result VARCHAR(50),
    tester_id CHAR(36),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (control_id) REFERENCES controls (id),
    FOREIGN KEY (tester_id) REFERENCES users (id)
  );

CREATE TABLE IF NOT EXISTS
  control_monitoring (
    id CHAR(36) PRIMARY KEY,
    control_id CHAR(36),
    monitoring_date DATE,
    status VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (control_id) REFERENCES controls (id)
  );

CREATE TABLE IF NOT EXISTS
  soa (
    id CHAR(36) PRIMARY KEY,
    control_id CHAR(36),
    applicability VARCHAR(50),
    implementation_status VARCHAR(50),
    justification TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (control_id) REFERENCES controls (id)
  );

CREATE TABLE IF NOT EXISTS
  incidents (
    id CHAR(36) PRIMARY KEY,
    incident_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'open',
    reported_by CHAR(36),
    reported_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (reported_by) REFERENCES users (id)
  );

CREATE TABLE IF NOT EXISTS
  incident_responses (
    id CHAR(36) PRIMARY KEY,
    incident_id CHAR(36),
    response TEXT,
    responder_id CHAR(36),
    response_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES incidents (id),
    FOREIGN KEY (responder_id) REFERENCES users (id)
  );

CREATE TABLE IF NOT EXISTS
  incident_investigations (
    id CHAR(36) PRIMARY KEY,
    incident_id CHAR(36),
    investigation TEXT,
    investigator_id CHAR(36),
    investigation_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES incidents (id),
    FOREIGN KEY (investigator_id) REFERENCES users (id)
  );

CREATE TABLE IF NOT EXISTS
  incident_lessons (
    id CHAR(36) PRIMARY KEY,
    incident_id CHAR(36),
    lesson_learned TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES incidents (id)
  );

CREATE TABLE IF NOT EXISTS
  vendors (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_info VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE IF NOT EXISTS
  vendor_risk_assessments (
    id CHAR(36) PRIMARY KEY,
    vendor_id CHAR(36),
    assessment_date DATE,
    risk_level VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors (id)
  );

CREATE TABLE IF NOT EXISTS
  vendor_questionnaires (
    id CHAR(36) PRIMARY KEY,
    vendor_id CHAR(36),
    questionnaire TEXT,
    response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors (id)
  );

CREATE TABLE IF NOT EXISTS
  compliance_frameworks (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE IF NOT EXISTS
  control_mappings (
    id CHAR(36) PRIMARY KEY,
    framework_id CHAR(36),
    control_id CHAR(36),
    mapping_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (framework_id) REFERENCES compliance_frameworks (id),
    FOREIGN KEY (control_id) REFERENCES controls (id)
  );

CREATE TABLE IF NOT EXISTS
  gap_assessments (
    id CHAR(36) PRIMARY KEY,
    framework_id CHAR(36),
    gap_description TEXT,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (framework_id) REFERENCES compliance_frameworks (id)
  );

CREATE TABLE IF NOT EXISTS
  training_programs (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE IF NOT EXISTS
  user_training_records (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    program_id CHAR(36),
    completion_date DATE,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (program_id) REFERENCES training_programs (id)
  );

CREATE TABLE IF NOT EXISTS
  awareness_campaigns (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE IF NOT EXISTS
  evidence (
    id CHAR(36) PRIMARY KEY,
    type VARCHAR(50),
    description TEXT,
    related_type VARCHAR(50),
    related_id CHAR(36),
    file_path VARCHAR(500),
    uploaded_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users (id)
  );

CREATE TABLE IF NOT EXISTS
  workflow_automation (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    config JSON,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE IF NOT EXISTS
  integrations (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50),
    config JSON,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE IF NOT EXISTS
  governance_versions (
    id CHAR(36) PRIMARY KEY,
    item_id CHAR(36),
    version_number INTEGER NOT NULL,
    content MEDIUMTEXT NOT NULL,
    change_log TEXT,
    created_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES governance_items (id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users (id)
  );

CREATE TABLE IF NOT EXISTS
  asset_dependencies (
    id CHAR(36) PRIMARY KEY,
    parent_asset_id CHAR(36),
    child_asset_id CHAR(36),
    relationship_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (parent_asset_id, child_asset_id),
    FOREIGN KEY (parent_asset_id) REFERENCES assets (id) ON DELETE CASCADE,
    FOREIGN KEY (child_asset_id) REFERENCES assets (id) ON DELETE CASCADE
  );

CREATE TABLE IF NOT EXISTS
  risks (
    id CHAR(36) PRIMARY KEY,
    risk_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    owner_id CHAR(36),
    asset_id CHAR(36),
    threat TEXT,
    vulnerability TEXT,
    existing_controls TEXT,
    likelihood INTEGER,
    impact INTEGER,
    status VARCHAR(50) DEFAULT 'identified',
    treatment_strategy VARCHAR(50) DEFAULT NULL,
    residual_likelihood INTEGER,
    residual_impact INTEGER,
    target_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users (id),
    FOREIGN KEY (asset_id) REFERENCES assets (id)
  );

CREATE TABLE IF NOT EXISTS
  risk_treatments (
    id CHAR(36) PRIMARY KEY,
    risk_id CHAR(36),
    description TEXT NOT NULL,
    owner_id CHAR(36),
    status VARCHAR(50) DEFAULT 'planned',
    priority VARCHAR(20) DEFAULT 'medium',
    start_date DATE,
    due_date DATE,
    completed_date DATE,
    resources_required TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (risk_id) REFERENCES risks (id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES users (id)
  );

CREATE TABLE IF NOT EXISTS
  audit_findings (
    id CHAR(36) PRIMARY KEY,
    audit_id CHAR(36),
    finding_number VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    iso27001_clause VARCHAR(20),
    governance_item_id CHAR(36),
    severity VARCHAR(20),
    status VARCHAR(50) DEFAULT 'open',
    root_cause TEXT,
    corrective_action TEXT,
    preventive_action TEXT,
    responsible_id CHAR(36),
    due_date DATE,
    closure_date DATE,
    evidence TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (audit_id) REFERENCES audits (id) ON DELETE CASCADE,
    FOREIGN KEY (governance_item_id) REFERENCES governance_items (id),
    FOREIGN KEY (responsible_id) REFERENCES users (id)
  );

CREATE TABLE IF NOT EXISTS
  documents (
    id CHAR(36) PRIMARY KEY,
    document_number VARCHAR(100) UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(500),
    file_type VARCHAR(50),
    file_size INTEGER,
    category VARCHAR(100),
    related_type VARCHAR(50),
    related_id CHAR(36),
    uploaded_by CHAR(36),
    version INTEGER DEFAULT 1,
    is_confidential BOOLEAN DEFAULT false,
    retention_until DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users (id)
  );

CREATE TABLE IF NOT EXISTS
  activity_logs (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id CHAR(36),
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

CREATE TABLE IF NOT EXISTS
  user_dashboard_config (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    widget_id VARCHAR(100) NOT NULL,
    position_x INTEGER,
    position_y INTEGER,
    width INTEGER DEFAULT 4,
    height INTEGER DEFAULT 4,
    config JSON,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (user_id, widget_id),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  );

INSERT IGNORE INTO
  roles (name, type, description)
VALUES
  ('admin', 'system', 'Administrator'),
  ('user', 'system', 'Standard User');

INSERT IGNORE INTO
  permissions (name, description)
VALUES
  ('manage_users', 'Manage users'),
  ('view_dashboard', 'View dashboard');

INSERT IGNORE INTO
  departments (name, description)
VALUES
  ('IT', 'Information Technology'),
  ('HR', 'Human Resources');

INSERT IGNORE INTO
  users (
    id,
    email,
    password_hash,
    first_name,
    last_name,
    department,
    is_active
  )
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'admin@example.com',
    '$Unique77*',
    'Admin',
    'User',
    'IT',
    true
  );

INSERT IGNORE INTO
  user_roles (user_id, role_id)
VALUES
  ('00000000-0000-0000-0000-000000000001', 1);

INSERT IGNORE INTO
  role_permissions (role_id, permission_id)
VALUES
  (1, 1),
  (1, 2);