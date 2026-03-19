import express from "express";
import { query } from "../config/database.js";
const router = express.Router();

// --- Control Monitoring ---
router.get("/", async (req, res) => {
  try {
    const [rows] = await query("SELECT * FROM control_monitoring");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [rows] = await query(
      "SELECT * FROM control_monitoring WHERE id = ?",
      [req.params.id],
    );
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { control_id, monitoring_type, frequency, status } = req.body;
    const [result] = await query(
      "INSERT INTO control_monitoring (id, control_id, monitoring_type, frequency, status) VALUES (UUID(), ?, ?, ?, ?)",
      [control_id, monitoring_type, frequency, status],
    );
    res
      .status(201)
      .json({
        id: result.insertId,
        control_id,
        monitoring_type,
        frequency,
        status,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { control_id, monitoring_type, frequency, status } = req.body;
    await query(
      "UPDATE control_monitoring SET control_id = ?, monitoring_type = ?, frequency = ?, status = ? WHERE id = ?",
      [control_id, monitoring_type, frequency, status, req.params.id],
    );
    res.json({
      id: req.params.id,
      control_id,
      monitoring_type,
      frequency,
      status,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await query("DELETE FROM control_monitoring WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
