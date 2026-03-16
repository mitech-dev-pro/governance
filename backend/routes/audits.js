import express from "express";
import { query } from "../config/database.js";
const router = express.Router();

// Get all audits
router.get("/", async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;

    let sql = `
      SELECT a.*,
        u.first_name as lead_auditor_first_name, u.last_name as lead_auditor_last_name,
        (SELECT COUNT(*) FROM audit_findings af WHERE af.audit_id = a.id AND af.status = 'open') as open_findings
      FROM audits a
      LEFT JOIN users u ON a.lead_auditor_id = u.id
      WHERE 1=1
    `;
    const params = [];

    let countSql = `SELECT COUNT(*) as count FROM audits a WHERE 1=1`;
    const countParams = [];

    if (status) {
      sql += ` AND a.status = ?`;
      params.push(status);
      countSql += ` AND a.status = ?`;
      countParams.push(status);
    }
    if (type) {
      sql += ` AND a.type = ?`;
      params.push(type);
      countSql += ` AND a.type = ?`;
      countParams.push(type);
    }

    const offset = (page - 1) * limit;
    sql += ` ORDER BY a.start_date DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const [rows] = await query(sql, params);
    const [countRows] = await query(countSql, countParams);
    const total = countRows[0].count;
    res.json({
      audits: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create audit
router.post("/", async (req, res) => {
  try {
    const {
      audit_id,
      title,
      type,
      scope,
      criteria,
      lead_auditor_id,
      start_date,
      end_date,
    } = req.body;

    const [result] = await query(
      `
      INSERT INTO audits 
      (audit_id, title, type, scope, criteria, lead_auditor_id, start_date, end_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        audit_id,
        title,
        type,
        scope,
        criteria,
        lead_auditor_id,
        start_date,
        end_date,
      ],
    );

    // Get the inserted audit
    const [rows] = await query(`SELECT * FROM audits WHERE id = ?`, [
      result.insertId,
    ]);

    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get audit with findings
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [auditRows] = await query(
      `
      SELECT a.*,
        u.first_name as lead_auditor_first_name, u.last_name as lead_auditor_last_name
      FROM audits a
      LEFT JOIN users u ON a.lead_auditor_id = u.id
      WHERE a.id = ?
    `,
      [id],
    );

    if (auditRows.length === 0) {
      return res.status(404).json({ error: "Audit not found" });
    }

    const [findingsRows] = await query(
      `
      SELECT af.*,
        u.first_name as responsible_first_name, u.last_name as responsible_last_name,
        gi.title as governance_item_title
      FROM audit_findings af
      LEFT JOIN users u ON af.responsible_id = u.id
      LEFT JOIN governance_items gi ON af.governance_item_id = gi.id
      WHERE af.audit_id = ?
      ORDER BY 
        FIELD(af.type, 'nonconformity_major', 'nonconformity_minor', 'observation'),
        af.created_at DESC
    `,
      [id],
    );

    res.json({
      ...auditRows[0],
      findings: findingsRows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add finding to audit
router.post("/:id/findings", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      finding_number,
      title,
      description,
      type,
      iso27001_clause,
      governance_item_id,
      severity,
      root_cause,
      corrective_action,
      preventive_action,
      responsible_id,
      due_date,
    } = req.body;

    const [result] = await query(
      `
      INSERT INTO audit_findings 
      (audit_id, finding_number, title, description, type, iso27001_clause,
       governance_item_id, severity, root_cause, corrective_action,
       preventive_action, responsible_id, due_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        id,
        finding_number,
        title,
        description,
        type,
        iso27001_clause,
        governance_item_id,
        severity,
        root_cause,
        corrective_action,
        preventive_action,
        responsible_id,
        due_date,
      ],
    );

    // Get the inserted finding
    const [rows] = await query(`SELECT * FROM audit_findings WHERE id = ?`, [
      result.insertId,
    ]);

    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
