import express from "express";
import { query } from "../config/database.js";
const router = express.Router();

// --- Workflow Automation ---
router.get("/", async (req, res) => {
  try {
    const [rows] = await query("SELECT * FROM workflow_automation");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [rows] = await query(
      "SELECT * FROM workflow_automation WHERE id = ?",
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
    const { name, config, status } = req.body;
    const [result] = await query(
      "INSERT INTO workflow_automation (id, name, config, status) VALUES (UUID(), ?, ?, ?)",
      [name, config, status],
    );
    res.status(201).json({ id: result.insertId, name, config, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, config, status } = req.body;
    await query(
      "UPDATE workflow_automation SET name = ?, config = ?, status = ? WHERE id = ?",
      [name, config, status, req.params.id],
    );
    res.json({ id: req.params.id, name, config, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await query("DELETE FROM workflow_automation WHERE id = ?", [
      req.params.id,
    ]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
