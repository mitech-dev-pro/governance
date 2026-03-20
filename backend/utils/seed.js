// backend/utils/seed.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function seed() {
  try {
    // Roles
    await pool.query(
      "INSERT IGNORE INTO roles (name, description) VALUES (?, ?), (?, ?)",
      ["admin", "Administrator", "user", "Standard User"],
    );
    // Permissions
    await pool.query(
      "INSERT IGNORE INTO permissions (name, description) VALUES (?, ?), (?, ?)",
      ["manage_users", "Manage users", "view_dashboard", "View dashboard"],
    );
    // Departments
    await pool.query(
      "INSERT IGNORE INTO departments (name, description) VALUES (?, ?), (?, ?) ",
      ["IT", "Information Technology", "HR", "Human Resources"],
    );
    // Admin user (replace hash with real hash for production)
    // Insert admin user if not exists
    let adminId;
    const [userRows] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      ["admin@example.com"],
    );
    if (userRows.length === 0) {
      const [result] = await pool.query(
        "INSERT INTO users (email, password_hash, first_name, last_name, department, is_active) VALUES (?, ?, ?, ?, ?, ?)",
        [
          "admin@example.com",
          "$2a$10$PLACEHOLDERHASH",
          "Admin",
          "User",
          "IT",
          true,
        ],
      );
      adminId = result.insertId;
    } else {
      adminId = userRows[0].id;
    }
    // Assign admin role to admin user
    await pool.query(
      "INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)",
      [adminId, 1],
    );
    // Assign permissions to admin role
    await pool.query(
      "INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?), (?, ?)",
      [1, 1, 1, 2],
    );
    console.log("Seed data loaded successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

// --- Additional seed for all tables ---
async function seedAll() {
  try {
    // Governance Items
    const [govItemResult] = await pool.query(
      "INSERT INTO governance_items (item_code, title, description, type, category, status, owner_id, reviewer_id, approved_by, approved_date, review_date, next_review_date, iso27001_clause, priority) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        "CTRL-001",
        "Access Control Policy",
        "Defines access control requirements.",
        "policy",
        "Security",
        "approved",
        adminId,
        adminId,
        adminId,
        "2024-01-01",
        "2024-01-01",
        "2025-01-01",
        "A.9",
        "high",
      ],
    );
    const govItemId = govItemResult.insertId;
    // Governance Versions
    await pool.query(
      "INSERT INTO governance_versions (item_id, version_number, content, change_log, created_by) VALUES (?, ?, ?, ?, ?)",
      [govItemId, 1, "Initial version.", "Created.", adminId],
    );
    // Assets
    const [assetResult] = await pool.query(
      "INSERT INTO assets (asset_tag, name, description, type, category, location, owner_id, custodian_id, classification, status, acquisition_date, cost, serial_number, ip_address, mac_address, operating_system, criticality) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        "ASSET-001",
        "Server 1",
        "Main application server.",
        "server",
        "IT",
        "Data Center",
        adminId,
        adminId,
        "internal",
        "active",
        "2023-01-01",
        5000.0,
        "SN123456",
        "192.168.1.10",
        "00:11:22:33:44:55",
        "Linux",
        "high",
      ],
    );
    const assetId = assetResult.insertId;
    // Asset Dependencies
    await pool.query(
      "INSERT INTO asset_dependencies (parent_asset_id, child_asset_id, relationship_type) VALUES (?, ?, ?)",
      [assetId, assetId, "self"],
    );
    // Risks
    const [riskResult] = await pool.query(
      "INSERT INTO risks (risk_id, title, description, category, owner_id, asset_id, threat, vulnerability, existing_controls, likelihood, impact, status, treatment_strategy, residual_likelihood, residual_impact, target_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        "RISK-001",
        "Unauthorized Access",
        "Risk of unauthorized access to server.",
        "IT",
        adminId,
        assetId,
        "External attacker",
        "Weak password",
        "Strong password policy",
        4,
        5,
        "identified",
        "mitigate",
        2,
        2,
        "2024-12-31",
      ],
    );
    const riskId = riskResult.insertId;
    // Risk Treatments
    await pool.query(
      "INSERT INTO risk_treatments (risk_id, description, owner_id, status, priority, start_date, due_date, completed_date, resources_required) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        riskId,
        "Implement MFA.",
        adminId,
        "planned",
        "high",
        "2024-01-01",
        "2024-06-01",
        null,
        "MFA solution",
      ],
    );
    // Audits
    const [auditResult] = await pool.query(
      "INSERT INTO audits (audit_id, title, type, scope, criteria, lead_auditor_id, start_date, end_date, status, summary, overall_result) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        "AUD-001",
        "Annual Security Audit",
        "internal",
        "All systems",
        "ISO 27001",
        adminId,
        "2024-02-01",
        "2024-02-10",
        "completed",
        "Audit completed.",
        "pass",
      ],
    );
    const auditId = auditResult.insertId;
    // Audit Findings
    await pool.query(
      "INSERT INTO audit_findings (audit_id, finding_number, title, description, type, iso27001_clause, governance_item_id, severity, status, root_cause, corrective_action, preventive_action, responsible_id, due_date, closure_date, evidence) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        auditId,
        "FND-001",
        "Password Policy Weak",
        "Password policy not enforced.",
        "nonconformity",
        "A.9",
        govItemId,
        "high",
        "open",
        "Lack of enforcement",
        "Enforce policy",
        "Review quarterly",
        adminId,
        "2024-03-01",
        null,
        "Audit report",
      ],
    );
    // Documents
    await pool.query(
      "INSERT INTO documents (document_number, title, description, file_path, file_type, file_size, category, related_type, related_id, uploaded_by, version, is_confidential, retention_until) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        "DOC-001",
        "Access Control Doc",
        "Access control policy document.",
        "/uploads/access_control.pdf",
        "application/pdf",
        12345,
        "policy",
        "governance_item",
        govItemId,
        adminId,
        1,
        false,
        "2026-01-01",
      ],
    );
    // Activity Logs
    await pool.query(
      "INSERT INTO activity_logs (user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ",
      [
        adminId,
        "create",
        "governance_item",
        govItemId,
        null,
        '{"title":"Access Control Policy"}',
        "127.0.0.1",
        "Mozilla/5.0",
      ],
    );
    // User Dashboard Config
    await pool.query(
      "INSERT INTO user_dashboard_config (user_id, widget_id, position_x, position_y, width, height, config, is_visible) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [adminId, "widget-1", 0, 0, 4, 4, '{"type":"chart"}', true],
    );
    console.log("Seed data for all tables loaded successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Seed error (all tables):", err);
    process.exit(1);
  }
}

seed().then(seedAll);
