import express from "express";
import { query } from "../config/database.js";
const router = express.Router();

// --- Reports ---
/**
 * @swagger
 * /reports:
 *   get:
 *     summary: List reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     description: Get all reports (paginated)
 *     responses:
 *       200:
 *         description: List of reports
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get("/", async (req, res) => {
  try {
    const [rows] = await query("SELECT * FROM reports");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /reports/{id}:
 *   get:
 *     summary: Get report by ID
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Report not found
 */
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await query("SELECT * FROM reports WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /reports:
 *   post:
 *     summary: Create report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     description: Create a new report
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               content:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Report created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Validation error
 */
router.post("/", async (req, res) => {
  try {
    const { name, type, content, status } = req.body;
    const [result] = await query(
      "INSERT INTO reports (id, name, type, content, status) VALUES (UUID(), ?, ?, ?, ?)",
      [name, type, content, status],
    );
    res.status(201).json({ id: result.insertId, name, type, content, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /reports/{id}:
 *   put:
 *     summary: Update report by ID
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               content:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Report updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Validation error
 *       404:
 *         description: Report not found
 */
router.put("/:id", async (req, res) => {
  try {
    const { name, type, content, status } = req.body;
    await query(
      "UPDATE reports SET name = ?, type = ?, content = ?, status = ? WHERE id = ?",
      [name, type, content, status, req.params.id],
    );
    res.json({ id: req.params.id, name, type, content, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /reports/{id}:
 *   delete:
 *     summary: Delete report by ID
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Report not found
 */
router.delete("/:id", async (req, res) => {
  try {
    await query("DELETE FROM reports WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Risk Report
/**
 * @swagger
 * /reports/risk-report:
 *   get:
 *     summary: Get risk report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     description: Returns a risk report with risk details and treatment counts.
 *     responses:
 *       200:
 *         description: Array of risk report entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
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
/**
 * @swagger
 * /reports/asset-compliance:
 *   get:
 *     summary: Get asset compliance report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     description: Returns an asset compliance report with linked and open risks.
 *     responses:
 *       200:
 *         description: Array of asset compliance report entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
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
/**
 * @swagger
 * /reports/iso-compliance:
 *   get:
 *     summary: Get ISO 27001 compliance status
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     description: Returns ISO 27001 compliance status report.
 *     responses:
 *       200:
 *         description: ISO 27001 compliance status object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
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
