// backend/routes/permissions.js
import express from "express";
import { query } from "../config/database.js";
const router = express.Router();

// --- Permissions ---
/**
 * @swagger
 * /permissions:
 *   get:
 *     summary: List permissions
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     description: Get all permissions (paginated)
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
 *         description: List of permissions with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 permissions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Permission'
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
    const [rows] = await query("SELECT * FROM permissions");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /permissions/{id}:
 *   get:
 *     summary: Get permission by ID
 *     tags: [Permissions]
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
 *         description: Permission found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Permission'
 *       404:
 *         description: Permission not found
 */
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await query("SELECT * FROM permissions WHERE id = ?", [
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
 * /permissions:
 *   post:
 *     summary: Create permission
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     description: Create a new permission
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
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Permission created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Permission'
 *       400:
 *         description: Validation error
 */
router.post("/", async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const [result] = await query(
      "INSERT INTO permissions (id, name, description, status) VALUES (UUID(), ?, ?, ?)",
      [name, description, status],
    );
    res.status(201).json({ id: result.insertId, name, description, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /permissions/{id}:
 *   put:
 *     summary: Update permission by ID
 *     tags: [Permissions]
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
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Permission updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Permission'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Permission not found
 */
router.put("/:id", async (req, res) => {
  try {
    const { name, description, status } = req.body;
    await query(
      "UPDATE permissions SET name = ?, description = ?, status = ? WHERE id = ?",
      [name, description, status, req.params.id],
    );
    res.json({ id: req.params.id, name, description, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /permissions/{id}:
 *   delete:
 *     summary: Delete permission by ID
 *     tags: [Permissions]
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
 *         description: Permission deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Permission not found
 */
router.delete("/:id", async (req, res) => {
  try {
    await query("DELETE FROM permissions WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
