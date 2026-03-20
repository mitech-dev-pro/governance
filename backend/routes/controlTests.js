import express from "express";
import { query } from "../config/database.js";
const router = express.Router();

// --- Control Tests ---
router.get("/", async (req, res) => {
  try {
    const [rows] = await query("SELECT * FROM control_tests");
    /**
     * @swagger
     * /control-tests:
     *   get:
     *     summary: List control tests
     *     tags: [ControlTests]
     *     security:
     *       - bearerAuth: []
     *     description: Get all control tests
     *     responses:
     *       200:
     *         description: List of control tests
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
    const [rows] = await query("SELECT * FROM control_tests WHERE id = ?", [
      req.params.id,
      /**
       * @swagger
       * /control-tests/{id}:
       *   get:
       *     summary: Get control test by ID
       *     tags: [ControlTests]
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
       *         description: Control test found
       *         content:
       *           application/json:
       *             schema:
       *               type: object
       *       404:
       *         description: Control test not found
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
    const { control_id, test_type, frequency, result, status } = req.body;
    /**
     * @swagger
     * /control-tests:
     *   post:
     *     summary: Create control test
     *     tags: [ControlTests]
     *     security:
     *       - bearerAuth: []
     *     description: Create a new control test
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - control_id
     *               - test_type
     *               - frequency
     *               - result
     *               - status
     *             properties:
     *               control_id:
     *                 type: string
     *               test_type:
     *                 type: string
     *               frequency:
     *                 type: string
     *               result:
     *                 type: string
     *               status:
     *                 type: string
     *     responses:
     *       201:
     *         description: Control test created
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *       400:
     *         description: Validation error
     */
    const [resultInsert] = await query(
      "INSERT INTO control_tests (id, control_id, test_type, frequency, result, status) VALUES (UUID(), ?, ?, ?, ?, ?)",
      [control_id, test_type, frequency, result, status],
    );
    res.status(201).json({
      id: resultInsert.insertId,
      control_id,
      test_type,
      frequency,
      result,
      status,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { control_id, test_type, frequency, result, status } = req.body;
    /**
     * @swagger
     * /control-tests/{id}:
     *   put:
     *     summary: Update control test by ID
     *     tags: [ControlTests]
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
     *               control_id:
     *                 type: string
     *               test_type:
     *                 type: string
     *               frequency:
     *                 type: string
     *               result:
     *                 type: string
     *               status:
     *                 type: string
     *     responses:
     *       200:
     *         description: Control test updated
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *       400:
     *         description: Validation error
     *       404:
     *         description: Control test not found
     */
    await query(
      "UPDATE control_tests SET control_id = ?, test_type = ?, frequency = ?, result = ?, status = ? WHERE id = ?",
      [control_id, test_type, frequency, result, status, req.params.id],
    );
    res.json({
      id: req.params.id,
      control_id,
      test_type,
      frequency,
      result,
      status,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await query("DELETE FROM control_tests WHERE id = ?", [req.params.id]);
    /**
     * @swagger
     * /control-tests/{id}:
     *   delete:
     *     summary: Delete control test by ID
     *     tags: [ControlTests]
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
     *         description: Control test deleted
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *       404:
     *         description: Control test not found
     */
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
