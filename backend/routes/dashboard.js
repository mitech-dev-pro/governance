import express from "express";
import { query } from "../config/database.js";
const router = express.Router();

// Get dashboard statistics
router.get("/stats", async (req, res) => {
  try {
    // MySQL does not support FILTER or WITH, so use SUM with CASE
    const [rows] = await query(`
      SELECT
        -- Risks
        (SELECT COUNT(*) FROM risks WHERE status = 'identified') AS identified_risks,
        (SELECT COUNT(*) FROM risks WHERE status = 'mitigated') AS mitigated_risks,
        (SELECT COUNT(*) FROM risks WHERE risk_level = 'critical') AS critical_risks,
        (SELECT COUNT(*) FROM risks WHERE risk_level = 'high') AS high_risks,
        -- Assets
        (SELECT COUNT(*) FROM assets) AS total_assets,
        (SELECT COUNT(*) FROM assets WHERE status = 'active') AS active_assets,
        (SELECT COUNT(*) FROM assets WHERE classification = 'restricted') AS restricted_assets,
        -- Governance Items
        (SELECT COUNT(*) FROM governance_items) AS total_items,
        (SELECT COUNT(*) FROM governance_items WHERE status = 'active') AS active_items,
        (SELECT COUNT(*) FROM governance_items WHERE next_review_date < DATE_ADD(CURDATE(), INTERVAL 30 DAY)) AS due_for_review,
        -- Audits
        (SELECT COUNT(*) FROM audits WHERE status = 'in_progress') AS active_audits,
        (SELECT COUNT(*) FROM audits WHERE status = 'planned') AS planned_audits,
        -- Audit Findings
        (SELECT COUNT(*) FROM audit_findings WHERE status = 'open') AS open_findings,
        (SELECT COUNT(*) FROM audit_findings WHERE type = 'nonconformity_major' AND status = 'open') AS major_nonconformities
    `);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get risk distribution by level
router.get("/risk-distribution", async (req, res) => {
  try {
    const [rows] = await query(`
      SELECT risk_level, COUNT(*) as count
      FROM risks
      GROUP BY risk_level
      ORDER BY 
        FIELD(risk_level, 'critical', 'high', 'medium', 'low')
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent activity
router.get("/recent-activity", async (req, res) => {
  try {
    const [rows] = await query(`
      SELECT
        al.*,
        u.first_name,
        u.last_name,
        CASE 
          WHEN al.entity_type = 'risk' THEN r.title
          WHEN al.entity_type = 'asset' THEN a.name
          WHEN al.entity_type = 'governance' THEN g.title
          WHEN al.entity_type = 'audit' THEN au.title
        END as entity_name
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      LEFT JOIN risks r ON al.entity_type = 'risk' AND al.entity_id = r.id
      LEFT JOIN assets a ON al.entity_type = 'asset' AND al.entity_id = a.id
      LEFT JOIN governance_items g ON al.entity_type = 'governance' AND al.entity_id = g.id
      LEFT JOIN audits au ON al.entity_type = 'audit' AND al.entity_id = au.id
      ORDER BY al.created_at DESC
      LIMIT 20
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get compliance overview
router.get("/compliance-overview", async (req, res) => {
  try {
    const [rows] = await query(`
      SELECT 
        iso27001_clause,
        COUNT(*) as total_controls,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as implemented,
        SUM(CASE WHEN status = 'under_review' THEN 1 ELSE 0 END) as under_review,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as not_implemented
      FROM governance_items
      WHERE iso27001_clause IS NOT NULL
      GROUP BY iso27001_clause
      ORDER BY iso27001_clause
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
