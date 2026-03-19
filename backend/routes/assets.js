import express from "express";
import { query } from "../config/database.js";
const router = express.Router();

// --- Assets ---
/**
 * @swagger
 * /assets:
 *   get:
 *     summary: List assets
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     description: Get all assets (paginated)
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
 *         description: List of assets with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 assets:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Asset'
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
    const [rows] = await query("SELECT * FROM assets");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /assets/{id}:
 *   get:
 *     summary: Get asset by ID
 *     tags: [Assets]
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
 *         description: Asset found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Asset'
 *       404:
 *         description: Asset not found
 */
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await query("SELECT * FROM assets WHERE id = ?", [
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
 * /assets:
 *   post:
 *     summary: Create asset
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     description: Create a new asset
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
 *               value:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Asset created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Asset'
 *       400:
 *         description: Validation error
 */
router.post("/", async (req, res) => {
  try {
    const { name, type, owner, value, status } = req.body;
    const [result] = await query(
      "INSERT INTO assets (id, name, type, owner, value, status) VALUES (UUID(), ?, ?, ?, ?, ?)",
      [name, type, owner, value, status],
    );
    res
      .status(201)
      .json({ id: result.insertId, name, type, owner, value, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /assets/{id}:
 *   put:
 *     summary: Update asset by ID
 *     tags: [Assets]
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
 *               value:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Asset updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Asset'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Asset not found
 */
router.put("/:id", async (req, res) => {
  try {
    const { name, type, owner, value, status } = req.body;
    await query(
      "UPDATE assets SET name = ?, type = ?, owner = ?, value = ?, status = ? WHERE id = ?",
      [name, type, owner, value, status, req.params.id],
    );
    res.json({ id: req.params.id, name, type, owner, value, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /assets/{id}:
 *   delete:
 *     summary: Delete asset by ID
 *     tags: [Assets]
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
 *         description: Asset deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Asset not found
 */
router.delete("/:id", async (req, res) => {
  try {
    await query("DELETE FROM assets WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
