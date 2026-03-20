import express from "express";
import { query } from "../config/database.js";
const router = express.Router();

// --- Workflow Automation ---
/**
 * @swagger
 * /workflow-automation:
 *   get:
 *     summary: Get all workflow automations
 *     tags:
 *       - Workflow Automation
 *     responses:
 *       200:
 *         description: List of workflow automations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WorkflowAutomation'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get("/", async (req, res) => {
  try {
    const [rows] = await query("SELECT * FROM workflow_automation");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /workflow-automation/{id}:
 *   get:
 *     summary: Get a workflow automation by ID
 *     tags:
 *       - Workflow Automation
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workflow automation ID
 *     responses:
 *       200:
 *         description: Workflow automation found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkflowAutomation'
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await query(
      "SELECT * FROM workflow_automation WHERE id = ?",
      [req.params.id],
    );
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /workflow-automation:
 *   post:
 *     summary: Create a new workflow automation
 *     tags:
 *       - Workflow Automation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WorkflowAutomationInput'
 *     responses:
 *       201:
 *         description: Workflow automation created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkflowAutomation'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post("/", async (req, res) => {
  try {
    const { name, config, status } = req.body;
    const [result] = await query(
      "INSERT INTO workflow_automation (id, name, config, status) VALUES (UUID(), ?, ?, ?)",
      [name, config, status],
    );
    res.status(201).json({ id: result.insertId, name, config, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /workflow-automation/{id}:
 *   put:
 *     summary: Update a workflow automation
 *     tags:
 *       - Workflow Automation
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workflow automation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WorkflowAutomationInput'
 *     responses:
 *       200:
 *         description: Workflow automation updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkflowAutomation'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.put("/:id", async (req, res) => {
  try {
    const { name, config, status } = req.body;
    await query(
      "UPDATE workflow_automation SET name = ?, config = ?, status = ? WHERE id = ?",
      [name, config, status, req.params.id],
    );
    res.json({ id: req.params.id, name, config, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /workflow-automation/{id}:
 *   delete:
 *     summary: Delete a workflow automation
 *     tags:
 *       - Workflow Automation
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workflow automation ID
 *     responses:
 *       200:
 *         description: Workflow automation deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.delete("/:id", async (req, res) => {
  try {
    await query("DELETE FROM workflow_automation WHERE id = ?", [
      req.params.id,
    ]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
