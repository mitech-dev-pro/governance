import express from "express";
import { query } from "../config/database.js";
const router = express.Router();

// --- Integrations ---
router.get("/", async (req, res) => {
  try {
    const [rows] = await query("SELECT * FROM integrations");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [rows] = await query("SELECT * FROM integrations WHERE id = ?", [
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
    const { name, type, config, status } = req.body;
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
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
