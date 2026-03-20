import express from "express";
import { query } from "../config/database.js";
const router = express.Router();

// --- Evidence ---
router.get("/", async (req, res) => {
  /**
   * @swagger
   * /evidence:
   *   get:
   *     summary: List evidence
   *     tags: [Evidence]
   *     security:
   *       - bearerAuth: []
   *     description: Get all evidence records
   *     responses:
   *       200:
   *         description: List of evidence
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   * */
  try {
    const [rows] = await query("SELECT * FROM evidence");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  /**
   * @swagger
   * /evidence/{id}:
   *   get:
   *     summary: Get evidence by ID
   *     tags: [Evidence]
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
   *         description: Evidence found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *       404:
   *         description: Evidence not found
   * */
  try {
    const [rows] = await query("SELECT * FROM evidence WHERE id = ?", [
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
   * /evidence:
   *   post:
   *     summary: Create evidence
   *     tags: [Evidence]
   *     security:
   *       - bearerAuth: []
   *     description: Create a new evidence record
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - type
   *               - description
   *               - related_type
   *               - related_id
   *               - file_path
   *               - uploaded_by
   *             properties:
   *               type:
   *                 type: string
   *               description:
   *                 type: string
   *               related_type:
   *                 type: string
   *               related_id:
   *                 type: string
   *               file_path:
   *                 type: string
   *               uploaded_by:
   *                 type: string
   *     responses:
   *       201:
   *         description: Evidence created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *       400:
   *         description: Validation error
   * */
  try {
    const {
      type,
      description,
      related_type,
      related_id,
      file_path,
      uploaded_by,
    } = req.body;
    const [result] = await query(
      "INSERT INTO evidence (id, type, description, related_type, related_id, file_path, uploaded_by) VALUES (UUID(), ?, ?, ?, ?, ?, ?)",
      [type, description, related_type, related_id, file_path, uploaded_by],
    );
    res.status(201).json({
      id: result.insertId,
      type,
      description,
      related_type,
      related_id,
      file_path,
      uploaded_by,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  /**
   * @swagger
   * /evidence/{id}:
   *   put:
   *     summary: Update evidence by ID
   *     tags: [Evidence]
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
   *               type:
   *                 type: string
   *               description:
   *                 type: string
   *               related_type:
   *                 type: string
   *               related_id:
   *                 type: string
   *               file_path:
   *                 type: string
   *               uploaded_by:
   *                 type: string
   *     responses:
   *       200:
   *         description: Evidence updated
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *       400:
   *         description: Validation error
   *       404:
   *         description: Evidence not found
   * */
  try {
    const {
      type,
      description,
      related_type,
      related_id,
      file_path,
      uploaded_by,
    } = req.body;
    await query(
      "UPDATE evidence SET type = ?, description = ?, related_type = ?, related_id = ?, file_path = ?, uploaded_by = ? WHERE id = ?",
      [
        type,
        description,
        related_type,
        related_id,
        file_path,
        uploaded_by,
        req.params.id,
      ],
    );
    res.json({
      id: req.params.id,
      type,
      description,
      related_type,
      related_id,
      file_path,
      uploaded_by,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  /**
   * @swagger
   * /evidence/{id}:
   *   delete:
   *     summary: Delete evidence by ID
   *     tags: [Evidence]
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
   *         description: Evidence deleted
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *       404:
   *         description: Evidence not found
   * */
  try {
    await query("DELETE FROM evidence WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
