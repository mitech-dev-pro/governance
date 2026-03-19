import express from "express";
import { query } from "../config/database.js";
const router = express.Router();

// --- Dashboard ---
/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: List dashboard configs
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     description: Get all dashboard configs (paginated)
 *     responses:
 *       200:
 *         description: List of dashboard configs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get("/", async (req, res) => {
  try {
    const [rows] = await query("SELECT * FROM dashboard");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /dashboard/{id}:
 *   get:
 *     summary: Get dashboard config by ID
 *     tags: [Dashboard]
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
 *         description: Dashboard config found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Dashboard config not found
 */
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await query("SELECT * FROM dashboard WHERE id = ?", [
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
 * /dashboard:
 *   post:
 *     summary: Create dashboard config
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     description: Create a new dashboard config
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
 *               config:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Dashboard config created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Validation error
 */
router.post("/", async (req, res) => {
  try {
    const { name, config, status } = req.body;
    const [result] = await query(
      "INSERT INTO dashboard (id, name, config, status) VALUES (UUID(), ?, ?, ?)",
      [name, config, status],
    );
    res.status(201).json({ id: result.insertId, name, config, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /dashboard/{id}:
 *   put:
 *     summary: Update dashboard config by ID
 *     tags: [Dashboard]
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
 *               config:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Dashboard config updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Validation error
 *       404:
 *         description: Dashboard config not found
 */
router.put("/:id", async (req, res) => {
  try {
    const { name, config, status } = req.body;
    await query(
      "UPDATE dashboard SET name = ?, config = ?, status = ? WHERE id = ?",
      [name, config, status, req.params.id],
    );
    res.json({ id: req.params.id, name, config, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /dashboard/{id}:
 *   delete:
 *     summary: Delete dashboard config by ID
 *     tags: [Dashboard]
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
 *         description: Dashboard config deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Dashboard config not found
 */
router.delete("/:id", async (req, res) => {
  try {
    await query("DELETE FROM dashboard WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get dashboard statistics
/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     description: Returns various statistics for dashboard widgets.
 *     responses:
 *       200:
 *         description: Dashboard statistics object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
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
/**
 * @swagger
 * /dashboard/risk-distribution:
 *   get:
 *     summary: Get risk distribution by level
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     description: Returns risk distribution grouped by risk level.
 *     responses:
 *       200:
 *         description: Array of risk levels and counts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
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
/**
 * @swagger
 * /dashboard/recent-activity:
 *   get:
 *     summary: Get recent activity
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     description: Returns recent activity logs for the dashboard.
 *     responses:
 *       200:
 *         description: Array of recent activity log entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
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
/**
 * @swagger
 * /dashboard/compliance-overview:
 *   get:
 *     summary: Get compliance overview
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     description: Returns compliance overview statistics for dashboard.
 *     responses:
 *       200:
 *         description: Compliance overview statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
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
