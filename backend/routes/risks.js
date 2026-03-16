import express from "express";
import { query } from "../config/database.js";
const router = express.Router();

// Get all risks with filters
router.get("/", async (req, res) => {
  try {
    const { status, level, owner, search, page = 1, limit = 20 } = req.query;

    let sql = `
      SELECT r.*,
        u.first_name as owner_first_name, u.last_name as owner_last_name,
        a.name as asset_name, a.asset_tag
      FROM risks r
      LEFT JOIN users u ON r.owner_id = u.id
      LEFT JOIN assets a ON r.asset_id = a.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ` AND r.status = ?`;
      params.push(status);
    }
    if (level) {
      sql += ` AND r.risk_level = ?`;
      params.push(level);
    }
    if (owner) {
      sql += ` AND r.owner_id = ?`;
      params.push(owner);
    }
    if (search) {
      sql += ` AND (r.title LIKE ? OR r.description LIKE ? OR r.risk_id LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const offset = (page - 1) * limit;
    sql += ` ORDER BY r.risk_score DESC, r.created_at DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const [risks] = await query(sql, params);

    // Get risk matrix summary
    const [risk_matrix] = await query(`
      SELECT 
        likelihood,
        impact,
        COUNT(*) as count
      FROM risks
      WHERE status != 'closed'
      GROUP BY likelihood, impact
      ORDER BY likelihood, impact
    `);

    res.json({
      risks,
      risk_matrix,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create risk
router.post("/", async (req, res) => {
  try {
    const {
      risk_id,
      title,
      description,
      category,
      owner_id,
      asset_id,
      threat,
      vulnerability,
      existing_controls,
      likelihood,
      impact,
      treatment_strategy,
      target_date,
    } = req.body;

    const [result] = await query(
      `
      INSERT INTO risks 
      (risk_id, title, description, category, owner_id, asset_id, threat, vulnerability,
       existing_controls, likelihood, impact, treatment_strategy, target_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        risk_id,
        title,
        description,
        category,
        owner_id,
        asset_id,
        threat,
        vulnerability,
        existing_controls,
        likelihood,
        impact,
        treatment_strategy,
        target_date,
      ],
    );

    // Get the inserted risk
    const [rows] = await query(`SELECT * FROM risks WHERE id = ?`, [
      result.insertId,
    ]);

    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get risk with treatments
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [riskRows] = await query(
      `
      SELECT r.*,
        u.first_name as owner_first_name, u.last_name as owner_last_name,
        a.name as asset_name
      FROM risks r
      LEFT JOIN users u ON r.owner_id = u.id
      LEFT JOIN assets a ON r.asset_id = a.id
      WHERE r.id = ?
    `,
      [id],
    );

    if (riskRows.length === 0) {
      return res.status(404).json({ error: "Risk not found" });
    }

    const [treatmentsRows] = await query(
      `
      SELECT rt.*,
        u.first_name as owner_first_name, u.last_name as owner_last_name
      FROM risk_treatments rt
      LEFT JOIN users u ON rt.owner_id = u.id
      WHERE rt.risk_id = ?
      ORDER BY rt.created_at DESC
    `,
      [id],
    );

    res.json({
      ...riskRows[0],
      treatments: treatmentsRows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update risk (including residual risk)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      residual_likelihood,
      residual_impact,
      treatment_strategy,
      target_date,
    } = req.body;

    const [result] = await query(
      `
      UPDATE risks 
      SET status = IFNULL(?, status),
          residual_likelihood = IFNULL(?, residual_likelihood),
          residual_impact = IFNULL(?, residual_impact),
          treatment_strategy = IFNULL(?, treatment_strategy),
          target_date = IFNULL(?, target_date),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [
        status,
        residual_likelihood,
        residual_impact,
        treatment_strategy,
        target_date,
        id,
      ],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Risk not found" });
    }

    // Get the updated risk
    const [rows] = await query(`SELECT * FROM risks WHERE id = ?`, [id]);

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
