import express from "express";
import { query } from "../config/database.js";
const router = express.Router();

// --- Integrations ---
router.get("/", async (req, res) => {
  try {
    const [rows] = await query("SELECT * FROM integrations");
    /**
     * @swagger
     * /integrations:
     *   get:
     *     summary: List integrations
     *     tags: [Integrations]
     *     security:
     *       - bearerAuth: []
     *     description: Get all integrations
     *     responses:
     *       200:
     *         description: List of integrations
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     */
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [rows] = await query("SELECT * FROM integrations WHERE id = ?", [
      req.params.id,
      /**
       * @swagger
       * /integrations/{id}:
       *   get:
       *     summary: Get integration by ID
       *     tags: [Integrations]
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
       *         description: Integration found
       *         content:
       *           application/json:
       *             schema:
       *               type: object
       *       404:
       *         description: Integration not found
       */
    ]);
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, type, config, status } = req.body;
    /**
     * @swagger
     * /integrations:
     *   post:
     *     summary: Create integration
     *     tags: [Integrations]
     *     security:
     *       - bearerAuth: []
     *     description: Create a new integration
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - name
     *               - type
     *               - config
     *               - status
     *             properties:
     *               name:
     *                 type: string
     *               type:
     *                 type: string
     *               config:
     *                 type: string
     *               status:
     *                 type: string
     *     responses:
     *       201:
     *         description: Integration created
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *       400:
     *         description: Validation error
     */
    const [result] = await query(
      "INSERT INTO integrations (id, name, type, config, status) VALUES (UUID(), ?, ?, ?, ?)",
      [name, type, config, status],
    );
    res.status(201).json({ id: result.insertId, name, type, config, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, type, config, status } = req.body;
    /**
     * @swagger
     * /integrations/{id}:
     *   put:
     *     summary: Update integration by ID
     *     tags: [Integrations]
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
     *               config:
     *                 type: string
     *               status:
     *                 type: string
     *     responses:
     *       200:
     *         description: Integration updated
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *       400:
     *         description: Validation error
     *       404:
     *         description: Integration not found
     */
    await query(
      "UPDATE integrations SET name = ?, type = ?, config = ?, status = ? WHERE id = ?",
      [name, type, config, status, req.params.id],
    );
    res.json({ id: req.params.id, name, type, config, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await query("DELETE FROM integrations WHERE id = ?", [req.params.id]);
    /**
     * @swagger
     * /integrations/{id}:
     *   delete:
     *     summary: Delete integration by ID
     *     tags: [Integrations]
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
     *         description: Integration deleted
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *       404:
     *         description: Integration not found
     */
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
