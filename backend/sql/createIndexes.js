import { query } from "../config/database.js";
import logger from "../utils/logger.js";

const indexes = [
  ["governance_items", "idx_governance_status", "status"],
  ["governance_items", "idx_governance_iso_clause", "iso27001_clause"],
  ["governance_items", "idx_governance_created_at", "created_at"],
  ["governance_items", "idx_governance_priority", "priority"],
  ["governance_items", "idx_governance_owner", "owner_id"],

  ["assets", "idx_assets_owner", "owner_id"],
  ["assets", "idx_assets_classification", "classification_id"],
  ["assets", "idx_assets_created_at", "created_at"],
  ["assets", "idx_assets_type", "type_id"],

  ["risks", "idx_risks_status", "status"],
  ["risks", "idx_risks_created_at", "created_at"],
  ["risks", "idx_risks_treatment", "treatment_strategy"],

  ["audits", "idx_audits_status", "status"],
  ["audits", "idx_audits_created_at", "created_at"],
  ["audits", "idx_audits_type", "type"],

  ["audit_findings", "idx_findings_audit", "audit_id"],
  ["audit_findings", "idx_findings_status", "status"],
  ["audit_findings", "idx_findings_created_at", "created_at"],

  ["activity_logs", "idx_activity_logs_user", "user_id"],
  ["activity_logs", "idx_activity_logs_created", "created_at"],
];

export async function createIndexes() {
  for (const [tableName, indexName, columnName] of indexes) {
    const [rows] = await query(
      `
      SELECT COUNT(1) AS count
      FROM information_schema.statistics
      WHERE table_schema = DATABASE()
        AND table_name = ?
        AND index_name = ?
      `,
      [tableName, indexName],
    );

    if (rows[0].count === 0) {
      await query(`CREATE INDEX ${indexName} ON ${tableName} (${columnName})`);
      logger.info(`Created index ${indexName} on ${tableName}(${columnName})`);
    }
  }
}
