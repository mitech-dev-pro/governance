import express from "express";
import { query } from "../config/database.js";
const router = express.Router();

// --- Training Programs ---
/**
 * @swagger
 * /training/programs:
 *   get:
 *     summary: List training programs
 *     tags: [Training]
 *     security:
 *       - bearerAuth: []
 *     description: Get all training programs
 *     responses:
 *       200:
 *         description: List of training programs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get("/programs", async (req, res) => {
  try {
    const [rows] = await query("SELECT * FROM training_programs");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/programs/:id", async (req, res) => {
  try {
    /**
     * @swagger
     * /training/programs/{id}:
     *   get:
     *     summary: Get training program by ID
     *     tags: [Training]
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
     *         description: Training program found
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *       404:
     *         description: Training program not found
     */
    const [rows] = await query("SELECT * FROM training_programs WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/programs", async (req, res) => {
  try {
    /**
     * @swagger
     * /training/programs:
     *   post:
     *     summary: Create training program
     *     tags: [Training]
     *     security:
     *       - bearerAuth: []
     *     description: Create a new training program
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - name
     *               - description
     *             properties:
     *               name:
     *                 type: string
     *               description:
     *                 type: string
     *     responses:
     *       201:
     *         description: Training program created
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *       400:
     *         description: Validation error
     */
    const { name, description } = req.body;
    const [result] = await query(
      "INSERT INTO training_programs (id, name, description) VALUES (UUID(), ?, ?)",
      [name, description],
    );
    res.status(201).json({ id: result.insertId, name, description });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/programs/:id", async (req, res) => {
  try {
    /**
     * @swagger
     * /training/programs/{id}:
     *   put:
     *     summary: Update training program by ID
     *     tags: [Training]
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
     *         description: Training program updated
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *       400:
     *         description: Validation error
     *       404:
     *         description: Training program not found
     */
    const { name, description } = req.body;
    await query(
      "UPDATE training_programs SET name = ?, description = ? WHERE id = ?",
      [name, description, req.params.id],
    );
    res.json({ id: req.params.id, name, description });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/programs/:id", async (req, res) => {
  try {
    /**
     * @swagger
     * /training/programs/{id}:
     *   delete:
     *     summary: Delete training program by ID
     *     tags: [Training]
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
     *         description: Training program deleted
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *       404:
     *         description: Training program not found
     */
    await query("DELETE FROM training_programs WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- User Training Records (sub-entity) ---
router.get("/programs/:programId/records", async (req, res) => {
  try {
    /**
     * @swagger
     * /training/programs/{programId}/records:
     *   get:
     *     summary: List user training records for a program
     *     tags: [Training]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - name: programId
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: List of user training records
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     */
    const [rows] = await query(
      "SELECT * FROM user_training_records WHERE program_id = ?",
      [req.params.programId],
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/programs/:programId/records", async (req, res) => {
  try {
    /**
     * @swagger
     * /training/programs/{programId}/records:
     *   post:
     *     summary: Create user training record for a program
     *     tags: [Training]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - name: programId
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
     *               - user_id
     *               - completion_date
     *               - status
     *             properties:
     *               user_id:
     *                 type: string
     *               completion_date:
     *                 type: string
     *                 format: date
     *               status:
     *                 type: string
     *     responses:
     *       201:
     *         description: User training record created
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *       400:
     *         description: Validation error
     */
    const { user_id, completion_date, status } = req.body;
    const [result] = await query(
      "INSERT INTO user_training_records (id, user_id, program_id, completion_date, status) VALUES (UUID(), ?, ?, ?, ?)",
      [user_id, req.params.programId, completion_date, status],
    );
    res.status(201).json({
      id: result.insertId,
      user_id,
      program_id: req.params.programId,
      completion_date,
      status,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/records/:id", async (req, res) => {
  try {
    /**
     * @swagger
     * /training/records/{id}:
     *   delete:
     *     summary: Delete user training record by ID
     *     tags: [Training]
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
     *         description: User training record deleted
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *       404:
     *         description: User training record not found
     */
    await query("DELETE FROM user_training_records WHERE id = ?", [
      req.params.id,
    ]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Awareness Campaigns ---
router.get("/campaigns", async (req, res) => {
  try {
    /**
     * @swagger
     * /training/campaigns:
     *   get:
     *     summary: List awareness campaigns
     *     tags: [Training]
     *     security:
     *       - bearerAuth: []
     *     description: Get all awareness campaigns
     *     responses:
     *       200:
     *         description: List of awareness campaigns
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     */
    const [rows] = await query("SELECT * FROM awareness_campaigns");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/campaigns", async (req, res) => {
  try {
    /**
     * @swagger
     * /training/campaigns:
     *   post:
     *     summary: Create awareness campaign
     *     tags: [Training]
     *     security:
     *       - bearerAuth: []
     *     description: Create a new awareness campaign
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - name
     *               - description
     *               - start_date
     *               - end_date
     *             properties:
     *               name:
     *                 type: string
     *               description:
     *                 type: string
     *               start_date:
     *                 type: string
     *                 format: date
     *               end_date:
     *                 type: string
     *                 format: date
     *     responses:
     *       201:
     *         description: Awareness campaign created
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *       400:
     *         description: Validation error
     */
    const { name, description, start_date, end_date } = req.body;
    const [result] = await query(
      "INSERT INTO awareness_campaigns (id, name, description, start_date, end_date) VALUES (UUID(), ?, ?, ?, ?)",
      [name, description, start_date, end_date],
    );
    res
      .status(201)
      .json({ id: result.insertId, name, description, start_date, end_date });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/campaigns/:id", async (req, res) => {
  try {
    /**
     * @swagger
     * /training/campaigns/{id}:
     *   delete:
     *     summary: Delete awareness campaign by ID
     *     tags: [Training]
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
     *         description: Awareness campaign deleted
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *       404:
     *         description: Awareness campaign not found
     */
    await query("DELETE FROM awareness_campaigns WHERE id = ?", [
      req.params.id,
    ]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
