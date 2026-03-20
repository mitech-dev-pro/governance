import express from "express";
import { query } from "../config/database.js";
const router = express.Router();

// --- SOA ---
/**
 * @swagger
 * /soa:
 *   get:
 *     summary: Get all SOA records
 *     tags:
 *       - SOA
 *     responses:
 *       200:
 *         description: List of SOA records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SOA'
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
    const [rows] = await query("SELECT * FROM soa");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /soa/{id}:
 *   get:
 *     summary: Get an SOA record by ID
 *     tags:
 *       - SOA
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: SOA record ID
 *     responses:
 *       200:
 *         description: SOA record found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SOA'
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
    const [rows] = await query("SELECT * FROM soa WHERE id = ?", [
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
 * /soa:
 *   post:
 *     summary: Create a new SOA record
 *     tags:
 *       - SOA
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SOAInput'
 *     responses:
 *       201:
 *         description: SOA record created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SOA'
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
    const { name, version, controls, status } = req.body;
    const [result] = await query(
      "INSERT INTO soa (id, name, version, controls, status) VALUES (UUID(), ?, ?, ?, ?)",
      [name, version, controls, status],
    );
    res
      .status(201)
      .json({ id: result.insertId, name, version, controls, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /soa/{id}:
 *   put:
 *     summary: Update an SOA record
 *     tags:
 *       - SOA
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: SOA record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SOAInput'
 *     responses:
 *       200:
 *         description: SOA record updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SOA'
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
    const { name, version, controls, status } = req.body;
    await query(
      "UPDATE soa SET name = ?, version = ?, controls = ?, status = ? WHERE id = ?",
      [name, version, controls, status, req.params.id],
    );
    res.json({ id: req.params.id, name, version, controls, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /soa/{id}:
 *   delete:
 *     summary: Delete an SOA record
 *     tags:
 *       - SOA
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: SOA record ID
 *     responses:
 *       200:
 *         description: SOA record deleted
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
    await query("DELETE FROM soa WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
