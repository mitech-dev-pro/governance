-- ============================================================
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

-- ============================================================
-- STEP 2: Junction tables for roles & permissions
-- ============================================================
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

-- ============================================================
-- STEP 3: Core domain tables (reference users only)
-- ============================================================
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
    type VARCHAR(50) NOT NULL,
    category VARCHAR(100),
    location VARCHAR(255),
    owner_id CHAR(36),
    custodian_id CHAR(36),
    classification VARCHAR(50) DEFAULT 'internal',
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
    FOREIGN KEY (custodian_id) REFERENCES users (id)
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

-- ============================================================
-- STEP 4: Child tables (reference domain tables above)
-- ============================================================
CREATE TABLE IF NOT EXISTS
  governance_versions (
    id CHAR(36) PRIMARY KEY,
    item_id CHAR(36),
    version_number INTEGER NOT NULL,
    content TEXT NOT NULL,
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
    treatment_strategy VARCHAR(50),
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

CREATE TABLE
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

-- ============================================================
-- STEP 5: Indexes (all tables now exist)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_governance_status ON governance_items (status);

CREATE INDEX IF NOT EXISTS idx_governance_iso_clause ON governance_items (iso27001_clause);

CREATE INDEX IF NOT EXISTS idx_governance_created_at ON governance_items (created_at);

CREATE INDEX IF NOT EXISTS idx_governance_priority ON governance_items (priority);

CREATE INDEX IF NOT EXISTS idx_assets_owner ON assets (owner_id);

CREATE INDEX IF NOT EXISTS idx_assets_classification ON assets (classification);

CREATE INDEX IF NOT EXISTS idx_assets_created_at ON assets (created_at);

CREATE INDEX IF NOT EXISTS idx_assets_type ON assets (type);

CREATE INDEX IF NOT EXISTS idx_risks_status ON risks (status);

CREATE INDEX IF NOT EXISTS idx_risks_created_at ON risks (created_at);

CREATE INDEX IF NOT EXISTS idx_risks_priority ON risks (treatment_strategy);

CREATE INDEX IF NOT EXISTS idx_audits_status ON audits (status);

CREATE INDEX IF NOT EXISTS idx_audits_created_at ON audits (created_at);

CREATE INDEX IF NOT EXISTS idx_audits_type ON audits (type);

CREATE INDEX IF NOT EXISTS idx_findings_audit ON audit_findings (audit_id);

CREATE INDEX IF NOT EXISTS idx_findings_status ON audit_findings (status);

CREATE INDEX IF NOT EXISTS idx_findings_created_at ON audit_findings (created_at);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs (user_id);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs (created_at);

-- ============================================================
-- STEP 6: Triggers (all tables now exist)
-- ============================================================
DELIMITER $$
CREATE TRIGGER update_users_updated_at BEFORE
UPDATE ON users FOR EACH ROW BEGIN
SET
  NEW.updated_at = CURRENT_TIMESTAMP;

END $$
CREATE TRIGGER update_governance_updated_at BEFORE
UPDATE ON governance_items FOR EACH ROW BEGIN
SET
  NEW.updated_at = CURRENT_TIMESTAMP;

END $$
CREATE TRIGGER update_assets_updated_at BEFORE
UPDATE ON assets FOR EACH ROW BEGIN
SET
  NEW.updated_at = CURRENT_TIMESTAMP;

END $$
-- ============================================================
-- STEP 7: Seed Data (idempotent)
-- ============================================================
INSERT IGNORE INTO
  roles (name, description)
VALUES
  ('admin', 'Administrator'),
  ('user', 'Standard User');

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

-- Example admin user (password hash must be generated in backend, placeholder below)
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
    '$2a$10$PLACEHOLDERHASH',
    'Admin',
    'User',
    'IT',
    true
  );

-- Assign admin role to admin user
INSERT IGNORE INTO
  user_roles (user_id, role_id)
VALUES
  ('00000000-0000-0000-0000-000000000001', 1);

-- Assign permissions to admin role
INSERT IGNORE INTO
  role_permissions (role_id, permission_id)
VALUES
  (1, 1),
  (1, 2);