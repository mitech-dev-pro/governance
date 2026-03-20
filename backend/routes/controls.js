import express from "express";
import { query } from "../config/database.js";
const router = express.Router();

// --- Controls ---
router.get("/", async (req, res) => {
  /**
   * @swagger
   * /controls:
   *   get:
   *     summary: List controls
   *     tags: [Controls]
   *     security:
   *       - bearerAuth: []
   *     description: Get all controls
   *     responses:
   *       200:
   *         description: List of controls
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   */
  try {
    const [rows] = await query("SELECT * FROM controls");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  /**
   * @swagger
   * /controls/{id}:
   *   get:
   *     summary: Get control by ID
   *     tags: [Controls]
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
   *         description: Control found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *       404:
   *         description: Control not found
   */
  try {
    const [rows] = await query("SELECT * FROM controls WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  /**
   * @swagger
   * /controls:
   *   post:
   *     summary: Create control
   *     tags: [Controls]
   *     security:
   *       - bearerAuth: []
   *     description: Create a new control
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - control_code
   *               - name
   *               - description
   *               - type
   *               - status
   *               - owner_id
   *             properties:
   *               control_code:
   *                 type: string
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *               type:
   *                 type: string
   *               status:
   *                 type: string
   *               owner_id:
   *                 type: string
   *     responses:
   *       201:
   *         description: Control created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *       400:
   *         description: Validation error
   */
  try {
    const { control_code, name, description, type, status, owner_id } =
      req.body;
    const [result] = await query(
      "INSERT INTO controls (control_code, name, description, type, status, owner_id) VALUES (?, ?, ?, ?, ?, ?)",
      [control_code, name, description, type, status, owner_id],
    );
    res.status(201).json({
      id: result.insertId,
      control_code,
      name,
      description,
      type,
      status,
      owner_id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  /**
   * @swagger
   * /controls/{id}:
   *   put:
   *     summary: Update control by ID
   *     tags: [Controls]
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
   *               control_code:
   *                 type: string
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *               type:
   *                 type: string
   *               status:
   *                 type: string
   *               owner_id:
   *                 type: string
   *     responses:
   *       200:
   *         description: Control updated
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *       400:
   *         description: Validation error
   *       404:
   *         description: Control not found
   */
  try {
    const { control_code, name, description, type, status, owner_id } =
      req.body;
    await query(
      "UPDATE controls SET control_code = ?, name = ?, description = ?, type = ?, status = ?, owner_id = ? WHERE id = ?",
      [control_code, name, description, type, status, owner_id, req.params.id],
    );
    res.json({
      id: req.params.id,
      control_code,
      name,
      description,
      type,
      status,
      owner_id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  /**
   * @swagger
   * /controls/{id}:
   *   delete:
   *     summary: Delete control by ID
   *     tags: [Controls]
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
   *         description: Control deleted
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *       404:
   *         description: Control not found
   */
  try {
    await query("DELETE FROM controls WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Control Tests (sub-entity) ---
router.get("/:controlId/tests", async (req, res) => {
  /**
   * @swagger
   * /controls/{controlId}/tests:
   *   get:
   *     summary: List control tests for a control
   *     tags: [Controls]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: controlId
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: List of control tests
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   */
  try {
    const [rows] = await query(
      "SELECT * FROM control_tests WHERE control_id = ?",
      [req.params.controlId],
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:controlId/tests", async (req, res) => {
  /**
   * @swagger
   * /controls/{controlId}/tests:
   *   post:
   *     summary: Create control test for a control
   *     tags: [Controls]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: controlId
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
   *             required:
   *               - test_date
   *               - result
   *               - tester_id
   *             properties:
   *               test_date:
   *                 type: string
   *                 format: date
   *               result:
   *                 type: string
   *               tester_id:
   *                 type: string
   *               notes:
   *                 type: string
   *     responses:
   *       201:
   *         description: Control test created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *       400:
   *         description: Validation error
   */
  try {
    const { test_date, result, tester_id, notes } = req.body;
    const [resultDb] = await query(
      "INSERT INTO control_tests (id, control_id, test_date, result, tester_id, notes) VALUES (UUID(), ?, ?, ?, ?, ?)",
      [req.params.controlId, test_date, result, tester_id, notes],
    );
    res.status(201).json({
      id: resultDb.insertId,
      control_id: req.params.controlId,
      test_date,
      result,
      tester_id,
      notes,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/tests/:id", async (req, res) => {
  /**
   * @swagger
   * /controls/tests/{id}:
   *   delete:
   *     summary: Delete control test by ID
   *     tags: [Controls]
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
   *         description: Control test deleted
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *       404:
   *         description: Control test not found
   */
  try {
    await query("DELETE FROM control_tests WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Control Monitoring (sub-entity) ---
router.get("/:controlId/monitoring", async (req, res) => {
  /**
   * @swagger
   * /controls/{controlId}/monitoring:
   *   get:
   *     summary: List control monitoring records for a control
   *     tags: [Controls]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: controlId
   *         in: path
   *         required: true
   *         schema:
   *           type: string
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
    const [rows] = await query(
      "SELECT * FROM control_monitoring WHERE control_id = ?",
      [req.params.controlId],
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:controlId/monitoring", async (req, res) => {
  /**
   * @swagger
   * /controls/{controlId}/monitoring:
   *   post:
   *     summary: Create control monitoring record for a control
   *     tags: [Controls]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: controlId
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
   *             required:
   *               - monitoring_date
   *               - status
   *             properties:
   *               monitoring_date:
   *                 type: string
   *                 format: date
   *               status:
   *                 type: string
   *               notes:
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
    const { monitoring_date, status, notes } = req.body;
    const [resultDb] = await query(
      "INSERT INTO control_monitoring (id, control_id, monitoring_date, status, notes) VALUES (UUID(), ?, ?, ?, ?)",
      [req.params.controlId, monitoring_date, status, notes],
    );
    res.status(201).json({
      id: resultDb.insertId,
      control_id: req.params.controlId,
      monitoring_date,
      status,
      notes,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/monitoring/:id", async (req, res) => {
  /**
   * @swagger
   * /controls/monitoring/{id}:
   *   delete:
   *     summary: Delete control monitoring record by ID
   *     tags: [Controls]
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
