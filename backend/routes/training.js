import express from "express";
import { query } from "../config/database.js";
const router = express.Router();

// --- Training Programs ---
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
    await query("DELETE FROM training_programs WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- User Training Records (sub-entity) ---
router.get("/programs/:programId/records", async (req, res) => {
  try {
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
    const { user_id, completion_date, status } = req.body;
    const [result] = await query(
      "INSERT INTO user_training_records (id, user_id, program_id, completion_date, status) VALUES (UUID(), ?, ?, ?, ?)",
      [user_id, req.params.programId, completion_date, status],
    );
    res
      .status(201)
      .json({
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
    const [rows] = await query("SELECT * FROM awareness_campaigns");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/campaigns", async (req, res) => {
  try {
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
    await query("DELETE FROM awareness_campaigns WHERE id = ?", [
      req.params.id,
    ]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
