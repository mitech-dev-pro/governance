import express from "express";
import { query } from "../config/database.js";
const router = express.Router();

// --- Governance ---
/**
 * @swagger
 * /governance:
 *   get:
 *     summary: List governance items
 *     tags: [Governance]
 *     security:
 *       - bearerAuth: []
 *     description: Get all governance items (paginated)
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
 *         description: List of governance items with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 governance:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/GovernanceItem'
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
    const [rows] = await query("SELECT * FROM governance");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /governance/{id}:
 *   get:
 *     summary: Get governance item by ID
 *     tags: [Governance]
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
 *         description: Governance item found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GovernanceItem'
 *       404:
 *         description: Governance item not found
 */
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await query("SELECT * FROM governance WHERE id = ?", [
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
 * /governance:
 *   post:
 *     summary: Create governance item
 *     tags: [Governance]
 *     security:
 *       - bearerAuth: []
 *     description: Create a new governance item
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
 *               owner:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Governance item created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GovernanceItem'
 *       400:
 *         description: Validation error
 */
router.post("/", async (req, res) => {
  try {
    const { name, description, owner, status } = req.body;
    const [result] = await query(
      "INSERT INTO governance (id, name, description, owner, status) VALUES (UUID(), ?, ?, ?, ?)",
      [name, description, owner, status],
    );
    res
      .status(201)
      .json({ id: result.insertId, name, description, owner, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /governance/{id}:
 *   put:
 *     summary: Update governance item by ID
 *     tags: [Governance]
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
 *               owner:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Governance item updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GovernanceItem'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Governance item not found
 */
router.put("/:id", async (req, res) => {
  try {
    const { name, description, owner, status } = req.body;
    await query(
      "UPDATE governance SET name = ?, description = ?, owner = ?, status = ? WHERE id = ?",
      [name, description, owner, status, req.params.id],
    );
    res.json({ id: req.params.id, name, description, owner, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /governance/{id}:
 *   delete:
 *     summary: Delete governance item by ID
 *     tags: [Governance]
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
 *         description: Governance item deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Governance item not found
 */
router.delete("/:id", async (req, res) => {
  try {
    await query("DELETE FROM governance WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
