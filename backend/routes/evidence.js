import express from "express";
import { query } from "../config/database.js";
const router = express.Router();

// --- Evidence ---
router.get("/", async (req, res) => {
  try {
    const [rows] = await query("SELECT * FROM evidence");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
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
    res
      .status(201)
      .json({
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
  try {
    await query("DELETE FROM evidence WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
