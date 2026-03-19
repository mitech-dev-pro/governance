import express from "express";
import { query } from "../config/database.js";
const router = express.Router();

// --- Control Tests ---
router.get("/", async (req, res) => {
  try {
    const [rows] = await query("SELECT * FROM control_tests");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [rows] = await query("SELECT * FROM control_tests WHERE id = ?", [
      req.params.id,
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
    const [resultInsert] = await query(
      "INSERT INTO control_tests (id, control_id, test_type, frequency, result, status) VALUES (UUID(), ?, ?, ?, ?, ?)",
      [control_id, test_type, frequency, result, status],
    );
    res
      .status(201)
      .json({
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
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
