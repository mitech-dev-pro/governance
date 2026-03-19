import express from "express";
import { query } from "../config/database.js";
const router = express.Router();

// --- Risks ---
/**
 * @swagger
 * /risks:
 *   get:
 *     summary: List risks
 *     tags: [Risks]
 *     security:
 *       - bearerAuth: []
 *     description: Get all risks (paginated)
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
 *         description: List of risks with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 risks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Risk'
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
    const [rows] = await query("SELECT * FROM risks");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /risks/{id}:
 *   get:
 *     summary: Get risk by ID
 *     tags: [Risks]
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
 *         description: Risk found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Risk'
 *       404:
 *         description: Risk not found
 */
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await query("SELECT * FROM risks WHERE id = ?", [
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
 * /risks:
 *   post:
 *     summary: Create risk
 *     tags: [Risks]
 *     security:
 *       - bearerAuth: []
 *     description: Create a new risk
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
 *               owner:
 *                 type: string
 *               likelihood:
 *                 type: string
 *               impact:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Risk created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Risk'
 *       400:
 *         description: Validation error
 */
router.post("/", async (req, res) => {
  try {
    const { name, type, owner, likelihood, impact, status } = req.body;
    const [result] = await query(
      "INSERT INTO risks (id, name, type, owner, likelihood, impact, status) VALUES (UUID(), ?, ?, ?, ?, ?, ?)",
      [name, type, owner, likelihood, impact, status],
    );
    res.status(201).json({
      id: result.insertId,
      name,
      type,
      owner,
      likelihood,
      impact,
      status,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /risks/{id}:
 *   put:
 *     summary: Update risk by ID
 *     tags: [Risks]
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
 *               owner:
 *                 type: string
 *               likelihood:
 *                 type: string
 *               impact:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Risk updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Risk'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Risk not found
 */
router.put("/:id", async (req, res) => {
  try {
    const { name, type, owner, likelihood, impact, status } = req.body;
    await query(
      "UPDATE risks SET name = ?, type = ?, owner = ?, likelihood = ?, impact = ?, status = ? WHERE id = ?",
      [name, type, owner, likelihood, impact, status, req.params.id],
    );
    res.json({
      id: req.params.id,
      name,
      type,
      owner,
      likelihood,
      impact,
      status,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /risks/{id}:
 *   delete:
 *     summary: Delete risk by ID
 *     tags: [Risks]
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
 *         description: Risk deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Risk not found
 */
router.delete("/:id", async (req, res) => {
  try {
    await query("DELETE FROM risks WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
