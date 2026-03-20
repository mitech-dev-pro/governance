import express from "express";
import { query } from "../config/database.js";
const router = express.Router();

// --- Control Monitoring ---
router.get("/", async (req, res) => {
  /**
   * @swagger
   * /control-monitoring:
   *   get:
   *     summary: List control monitoring records
   *     tags: [ControlMonitoring]
   *     security:
   *       - bearerAuth: []
   *     description: Get all control monitoring records
   *     responses:
   *       200:
   *         description: List of control monitoring records
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   */
  try {
    const [rows] = await query("SELECT * FROM control_monitoring");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  /**
   * @swagger
   * /control-monitoring/{id}:
   *   get:
   *     summary: Get control monitoring record by ID
   *     tags: [ControlMonitoring]
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
   *         description: Control monitoring record found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *       404:
   *         description: Control monitoring record not found
   */
  try {
    const [rows] = await query(
      "SELECT * FROM control_monitoring WHERE id = ?",
      [req.params.id],
    );
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  /**
   * @swagger
   * /control-monitoring:
   *   post:
   *     summary: Create control monitoring record
   *     tags: [ControlMonitoring]
   *     security:
   *       - bearerAuth: []
   *     description: Create a new control monitoring record
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - control_id
   *               - monitoring_type
   *               - frequency
   *               - status
   *             properties:
   *               control_id:
   *                 type: string
   *               monitoring_type:
   *                 type: string
   *               frequency:
   *                 type: string
   *               status:
   *                 type: string
   *     responses:
   *       201:
   *         description: Control monitoring record created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *       400:
   *         description: Validation error
   */
  try {
    const { control_id, monitoring_type, frequency, status } = req.body;
    const [result] = await query(
      "INSERT INTO control_monitoring (id, control_id, monitoring_type, frequency, status) VALUES (UUID(), ?, ?, ?, ?)",
      [control_id, monitoring_type, frequency, status],
    );
    res.status(201).json({
      id: result.insertId,
      control_id,
      monitoring_type,
      frequency,
      status,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  /**
   * @swagger
   * /control-monitoring/{id}:
   *   put:
   *     summary: Update control monitoring record by ID
   *     tags: [ControlMonitoring]
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
   *               control_id:
   *                 type: string
   *               monitoring_type:
   *                 type: string
   *               frequency:
   *                 type: string
   *               status:
   *                 type: string
   *     responses:
   *       200:
   *         description: Control monitoring record updated
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *       400:
   *         description: Validation error
   *       404:
   *         description: Control monitoring record not found
   */
  try {
    const { control_id, monitoring_type, frequency, status } = req.body;
    await query(
      "UPDATE control_monitoring SET control_id = ?, monitoring_type = ?, frequency = ?, status = ? WHERE id = ?",
      [control_id, monitoring_type, frequency, status, req.params.id],
    );
    res.json({
      id: req.params.id,
      control_id,
      monitoring_type,
      frequency,
      status,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  /**
   * @swagger
   * /control-monitoring/{id}:
   *   delete:
   *     summary: Delete control monitoring record by ID
   *     tags: [ControlMonitoring]
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
   *         description: Control monitoring record deleted
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *       404:
   *         description: Control monitoring record not found
   */
  try {
    await query("DELETE FROM control_monitoring WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
