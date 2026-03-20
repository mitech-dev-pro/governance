import express from "express";
import { query } from "../config/database.js";
const router = express.Router();

// --- Compliance Frameworks ---
/**
 * @swagger
 * /compliance/frameworks:
 *   get:
 *     summary: List compliance frameworks
 *     tags: [Compliance]
 *     security:
 *       - bearerAuth: []
 *     description: Get all compliance frameworks
 *     responses:
 *       200:
 *         description: List of compliance frameworks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get("/frameworks", async (req, res) => {
  try {
    const [rows] = await query("SELECT * FROM compliance_frameworks");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /compliance/frameworks/{id}:
 *   get:
 *     summary: Get compliance framework by ID
 *     tags: [Compliance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Compliance framework found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Compliance framework not found
 */
router.get("/frameworks/:id", async (req, res) => {
  try {
    const [rows] = await query(
      "SELECT * FROM compliance_frameworks WHERE id = ?",
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
 * /compliance/frameworks:
 *   post:
 *     summary: Create compliance framework
 *     tags: [Compliance]
 *     security:
 *       - bearerAuth: []
 *     description: Create a new compliance framework
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
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Compliance framework created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Validation error
 */
router.post("/frameworks", async (req, res) => {
  try {
    const { name, description } = req.body;
    const [result] = await query(
      "INSERT INTO compliance_frameworks (name, description) VALUES (?, ?)",
      [name, description],
    );
    res.status(201).json({ id: result.insertId, name, description });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /compliance/frameworks/{id}:
 *   put:
 *     summary: Update compliance framework by ID
 *     tags: [Compliance]
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
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Compliance framework updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Validation error
 *       404:
 *         description: Compliance framework not found
 */
router.put("/frameworks/:id", async (req, res) => {
  try {
    const { name, description } = req.body;
    await query(
      "UPDATE compliance_frameworks SET name = ?, description = ? WHERE id = ?",
      [name, description, req.params.id],
    );
    res.json({ id: req.params.id, name, description });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /compliance/frameworks/{id}:
 *   delete:
 *     summary: Delete compliance framework by ID
 *     tags: [Compliance]
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
 *         description: Compliance framework deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Compliance framework not found
 */
router.delete("/frameworks/:id", async (req, res) => {
  try {
    await query("DELETE FROM compliance_frameworks WHERE id = ?", [
      req.params.id,
    ]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Control Mappings (sub-entity of frameworks/controls) ---
/**
 * @swagger
 * /compliance/frameworks/{frameworkId}/mappings:
 *   get:
 *     summary: List control mappings for a framework
 *     tags: [Compliance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: frameworkId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of control mappings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get("/frameworks/:frameworkId/mappings", async (req, res) => {
  try {
    const [rows] = await query(
      "SELECT * FROM control_mappings WHERE framework_id = ?",
      [req.params.frameworkId],
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /compliance/frameworks/{frameworkId}/mappings:
 *   post:
 *     summary: Create control mapping for a framework
 *     tags: [Compliance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: frameworkId
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
 *               - control_id
 *             properties:
 *               control_id:
 *                 type: string
 *               mapping_notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Control mapping created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Validation error
 */
router.post("/frameworks/:frameworkId/mappings", async (req, res) => {
  try {
    const { control_id, mapping_notes } = req.body;
    const [result] = await query(
      "INSERT INTO control_mappings (framework_id, control_id, mapping_notes) VALUES (?, ?, ?)",
      [req.params.frameworkId, control_id, mapping_notes],
    );
    res.status(201).json({
      id: result.insertId,
      framework_id: req.params.frameworkId,
      control_id,
      mapping_notes,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /compliance/mappings/{id}:
 *   delete:
 *     summary: Delete control mapping by ID
 *     tags: [Compliance]
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
 *         description: Control mapping deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Control mapping not found
 */
router.delete("/mappings/:id", async (req, res) => {
  try {
    await query("DELETE FROM control_mappings WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Gap Assessments (sub-entity of frameworks) ---
/**
 * @swagger
 * /compliance/frameworks/{frameworkId}/gap-assessments:
 *   get:
 *     summary: List gap assessments for a framework
 *     tags: [Compliance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: frameworkId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of gap assessments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get("/frameworks/:frameworkId/gap-assessments", async (req, res) => {
  try {
    const [rows] = await query(
      "SELECT * FROM gap_assessments WHERE framework_id = ?",
      [req.params.frameworkId],
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /compliance/frameworks/{frameworkId}/gap-assessments:
 *   post:
 *     summary: Create gap assessment for a framework
 *     tags: [Compliance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: frameworkId
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
 *               - gap_description
 *             properties:
 *               gap_description:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Gap assessment created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Validation error
 */
router.post("/frameworks/:frameworkId/gap-assessments", async (req, res) => {
  try {
    const { gap_description, status } = req.body;
    const [result] = await query(
      "INSERT INTO gap_assessments (framework_id, gap_description, status) VALUES (?, ?, ?)",
      [req.params.frameworkId, gap_description, status],
    );
    res.status(201).json({
      id: result.insertId,
      framework_id: req.params.frameworkId,
      gap_description,
      status,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /compliance/gap-assessments/{id}:
 *   delete:
 *     summary: Delete gap assessment by ID
 *     tags: [Compliance]
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
 *         description: Gap assessment deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Gap assessment not found
 */
router.delete("/gap-assessments/:id", async (req, res) => {
  try {
    await query("DELETE FROM gap_assessments WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
