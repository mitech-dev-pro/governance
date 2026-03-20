import express from "express";
import { query } from "../config/database.js";
const router = express.Router();

// --- Audits ---
/**
 * @swagger
 * /audits:
 *   get:
 *     summary: List audits
 *     tags: [Audits]
 *     security:
 *       - bearerAuth: []
 *     description: Get all audits (paginated)
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Results per page
 *     responses:
 *       200:
 *         description: List of audits with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 audits:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Audit'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     total: { type: integer }
 *                     totalPages: { type: integer }
 */
router.get("/", async (req, res) => {
  try {
    const [rows] = await query("SELECT * FROM audits");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /audits/{id}:
 *   get:
 *     summary: Get audit by ID
 *     tags: [Audits]
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
 *         description: Audit found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Audit'
 *       404:
 *         description: Audit not found
 */
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await query("SELECT * FROM audits WHERE id = ?", [
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
 * /audits:
 *   post:
 *     summary: Create audit
 *     tags: [Audits]
 *     security:
 *       - bearerAuth: []
 *     description: Create a new audit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               scope:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Audit created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Audit'
 *       400:
 *         description: Validation error
 */
router.post("/", async (req, res) => {
  try {
    const { name, type, scope, status } = req.body;
    const [result] = await query(
      "INSERT INTO audits (name, type, scope, status) VALUES (?, ?, ?, ?)",
      [name, type, scope, status],
    );
    res.status(201).json({ id: result.insertId, name, type, scope, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /audits/{id}:
 *   put:
 *     summary: Update audit by ID
 *     tags: [Audits]
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
 *               scope:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Audit updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Audit'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Audit not found
 */
router.put("/:id", async (req, res) => {
  try {
    const { name, type, scope, status } = req.body;
    await query(
      "UPDATE audits SET name = ?, type = ?, scope = ?, status = ? WHERE id = ?",
      [name, type, scope, status, req.params.id],
    );
    res.json({ id: req.params.id, name, type, scope, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /audits/{id}:
 *   delete:
 *     summary: Delete audit by ID
 *     tags: [Audits]
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
 *         description: Audit deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Audit not found
 */
router.delete("/:id", async (req, res) => {
  try {
    await query("DELETE FROM audits WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
