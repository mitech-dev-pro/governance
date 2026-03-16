// backend/utils/seed.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { randomUUID } from "crypto";
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
    const adminId = "00000000-0000-0000-0000-000000000001";
    const [userRows] = await pool.query("SELECT * FROM users WHERE id = ?", [
      adminId,
    ]);
    if (userRows.length === 0) {
      await pool.query(
        "INSERT INTO users (id, email, password_hash, first_name, last_name, department, is_active) VALUES (?, ?, ?, ?, ?, ?, ?) ",
        [
          adminId,
          "admin@example.com",
          "$2a$10$PLACEHOLDERHASH",
          "Admin",
          "User",
          "IT",
          true,
        ],
      );
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
    const adminId = "00000000-0000-0000-0000-000000000001";
    // Governance Items
    const govItemId = randomUUID();
    await pool.query(
      "INSERT IGNORE INTO governance_items (id, item_code, title, description, type, category, status, owner_id, reviewer_id, approved_by, approved_date, review_date, next_review_date, iso27001_clause, priority) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        govItemId,
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
    // Governance Versions
    const govVerId = randomUUID();
    await pool.query(
      "INSERT IGNORE INTO governance_versions (id, item_id, version_number, content, change_log, created_by) VALUES (?, ?, ?, ?, ?, ?)",
      [govVerId, govItemId, 1, "Initial version.", "Created.", adminId],
    );
    // Assets
    const assetId = randomUUID();
    await pool.query(
      "INSERT IGNORE INTO assets (id, asset_tag, name, description, type, category, location, owner_id, custodian_id, classification, status, acquisition_date, cost, serial_number, ip_address, mac_address, operating_system, criticality) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        assetId,
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
    // Asset Dependencies
    const depId = randomUUID();
    await pool.query(
      "INSERT IGNORE INTO asset_dependencies (id, parent_asset_id, child_asset_id, relationship_type) VALUES (?, ?, ?, ?)",
      [depId, assetId, assetId, "self"],
    );
    // Risks
    const riskId = randomUUID();
    await pool.query(
      "INSERT IGNORE INTO risks (id, risk_id, title, description, category, owner_id, asset_id, threat, vulnerability, existing_controls, likelihood, impact, status, treatment_strategy, residual_likelihood, residual_impact, target_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        riskId,
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
    // Risk Treatments
    const treatId = randomUUID();
    await pool.query(
      "INSERT IGNORE INTO risk_treatments (id, risk_id, description, owner_id, status, priority, start_date, due_date, completed_date, resources_required) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        treatId,
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
    const auditId = randomUUID();
    await pool.query(
      "INSERT IGNORE INTO audits (id, audit_id, title, type, scope, criteria, lead_auditor_id, start_date, end_date, status, summary, overall_result) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        auditId,
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
    // Audit Findings
    const findingId = randomUUID();
    await pool.query(
      "INSERT IGNORE INTO audit_findings (id, audit_id, finding_number, title, description, type, iso27001_clause, governance_item_id, severity, status, root_cause, corrective_action, preventive_action, responsible_id, due_date, closure_date, evidence) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        findingId,
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
    const docId = randomUUID();
    await pool.query(
      "INSERT IGNORE INTO documents (id, document_number, title, description, file_path, file_type, file_size, category, related_type, related_id, uploaded_by, version, is_confidential, retention_until) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        docId,
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
    const logId = randomUUID();
    await pool.query(
      "INSERT IGNORE INTO activity_logs (id, user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        logId,
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
    const dashId = randomUUID();
    await pool.query(
      "INSERT IGNORE INTO user_dashboard_config (id, user_id, widget_id, position_x, position_y, width, height, config, is_visible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [dashId, adminId, "widget-1", 0, 0, 4, 4, '{"type":"chart"}', true],
    );
    console.log("Seed data for all tables loaded successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Seed error (all tables):", err);
    process.exit(1);
  }
}

seed().then(seedAll);
