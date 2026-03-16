import express from "express";
import { query } from "../config/database.js";
const router = express.Router();

// Risk Report
router.get("/risk-report", async (req, res) => {
  try {
    const [rows] = await query(`
      SELECT 
        r.risk_id,
        r.title,
        r.risk_level,
        r.risk_score,
        r.residual_risk_score,
        r.status,
        r.treatment_strategy,
        a.name as asset_name,
        CONCAT(u.first_name, ' ', u.last_name) as owner_name,
        COUNT(rt.id) as treatment_count
      FROM risks r
      LEFT JOIN assets a ON r.asset_id = a.id
      LEFT JOIN users u ON r.owner_id = u.id
      LEFT JOIN risk_treatments rt ON r.id = rt.risk_id
      GROUP BY r.id, a.name, u.first_name, u.last_name
      ORDER BY r.risk_score DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Asset Compliance Report
router.get("/asset-compliance", async (req, res) => {
  try {
    const [rows] = await query(`
      SELECT 
        a.asset_tag,
        a.name,
        a.type,
        a.classification,
        a.criticality,
        a.status,
        CONCAT(u.first_name, ' ', u.last_name) as owner_name,
        COUNT(r.id) as linked_risks,
        SUM(CASE WHEN r.status != 'mitigated' THEN 1 ELSE 0 END) as open_risks
      FROM assets a
      LEFT JOIN users u ON a.owner_id = u.id
      LEFT JOIN risks r ON a.id = r.asset_id
      GROUP BY a.id, u.first_name, u.last_name
      ORDER BY a.criticality DESC, a.classification DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ISO 27001 Compliance Status
router.get("/iso-compliance", async (req, res) => {
  try {
    const [details] = await query(`
      SELECT 
        iso27001_clause,
        COUNT(*) as total_controls,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as implemented,
        SUM(CASE WHEN status = 'under_review' THEN 1 ELSE 0 END) as under_review,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as not_implemented,
        SUM(CASE WHEN next_review_date < CURDATE() THEN 1 ELSE 0 END) as overdue_review,
        ROUND((SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as compliance_percentage
      FROM governance_items
      WHERE iso27001_clause IS NOT NULL
      GROUP BY iso27001_clause
      ORDER BY iso27001_clause
    `);

    const [summaryRows] = await query(`
      SELECT 
        ROUND(AVG(compliance_percentage), 2) as overall_compliance
      FROM (
        SELECT 
          iso27001_clause,
          ROUND((SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as compliance_percentage
        FROM governance_items
        WHERE iso27001_clause IS NOT NULL
        GROUP BY iso27001_clause
      ) subq
    `);

    res.json({
      details,
      summary: summaryRows[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
