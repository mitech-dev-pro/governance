import express from "express";
import { query } from "../config/database.js";
const router = express.Router();

// --- Controls ---
router.get("/", async (req, res) => {
  try {
    const [rows] = await query("SELECT * FROM controls");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [rows] = await query("SELECT * FROM controls WHERE id = ?", [
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
    const { control_code, name, description, type, status, owner_id } =
      req.body;
    const [result] = await query(
      "INSERT INTO controls (id, control_code, name, description, type, status, owner_id) VALUES (UUID(), ?, ?, ?, ?, ?, ?)",
      [control_code, name, description, type, status, owner_id],
    );
    res
      .status(201)
      .json({
        id: result.insertId,
        control_code,
        name,
        description,
        type,
        status,
        owner_id,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { control_code, name, description, type, status, owner_id } =
      req.body;
    await query(
      "UPDATE controls SET control_code = ?, name = ?, description = ?, type = ?, status = ?, owner_id = ? WHERE id = ?",
      [control_code, name, description, type, status, owner_id, req.params.id],
    );
    res.json({
      id: req.params.id,
      control_code,
      name,
      description,
      type,
      status,
      owner_id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await query("DELETE FROM controls WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Control Tests (sub-entity) ---
router.get("/:controlId/tests", async (req, res) => {
  try {
    const [rows] = await query(
      "SELECT * FROM control_tests WHERE control_id = ?",
      [req.params.controlId],
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:controlId/tests", async (req, res) => {
  try {
    const { test_date, result, tester_id, notes } = req.body;
    const [resultDb] = await query(
      "INSERT INTO control_tests (id, control_id, test_date, result, tester_id, notes) VALUES (UUID(), ?, ?, ?, ?, ?)",
      [req.params.controlId, test_date, result, tester_id, notes],
    );
    res
      .status(201)
      .json({
        id: resultDb.insertId,
        control_id: req.params.controlId,
        test_date,
        result,
        tester_id,
        notes,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/tests/:id", async (req, res) => {
  try {
    await query("DELETE FROM control_tests WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Control Monitoring (sub-entity) ---
router.get("/:controlId/monitoring", async (req, res) => {
  try {
    const [rows] = await query(
      "SELECT * FROM control_monitoring WHERE control_id = ?",
      [req.params.controlId],
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:controlId/monitoring", async (req, res) => {
  try {
    const { monitoring_date, status, notes } = req.body;
    const [resultDb] = await query(
      "INSERT INTO control_monitoring (id, control_id, monitoring_date, status, notes) VALUES (UUID(), ?, ?, ?, ?)",
      [req.params.controlId, monitoring_date, status, notes],
    );
    res
      .status(201)
      .json({
        id: resultDb.insertId,
        control_id: req.params.controlId,
        monitoring_date,
        status,
        notes,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/monitoring/:id", async (req, res) => {
  try {
    await query("DELETE FROM control_monitoring WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
