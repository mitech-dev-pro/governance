import express from "express";
import { query } from "../config/database.js";
const router = express.Router();

// --- SOA ---
router.get("/", async (req, res) => {
  try {
    const [rows] = await query("SELECT * FROM soa");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

router.delete("/:id", async (req, res) => {
  try {
    await query("DELETE FROM soa WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
