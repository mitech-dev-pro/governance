// backend/routes/permissions.js
import express from "express";
import { query } from "../config/database.js";
import { body, param, validationResult } from "express-validator";
const router = express.Router();

// Get all permissions (with pagination)
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const [permissions] = await query(
      "SELECT id, name, description FROM permissions ORDER BY name LIMIT ? OFFSET ?",
      [Number(limit), Number(offset)],
    );
    const [countRows] = await query(
      "SELECT COUNT(*) as count FROM permissions",
    );
    const total = countRows[0].count;
    res.json({
      permissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get permission by ID
router.get("/:id", [param("id").notEmpty().isInt()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { id } = req.params;
    const [rows] = await query(
      "SELECT id, name, description FROM permissions WHERE id = ?",
      [id],
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Permission not found" });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create permission
router.post(
  "/",
  [
    body("name").notEmpty().isString().isLength({ max: 50 }),
    body("description").optional().isString().isLength({ max: 255 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { name, description } = req.body;
      const [result] = await query(
        "INSERT INTO permissions (name, description) VALUES (?, ?)",
        [name, description],
      );
      const [rows] = await query(
        "SELECT id, name, description FROM permissions WHERE id = ?",
        [result.insertId],
      );
      res.status(201).json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Update permission
router.put(
  "/:id",
  [
    param("id").notEmpty().isInt(),
    body("name").optional().isString().isLength({ max: 50 }),
    body("description").optional().isString().isLength({ max: 255 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { id } = req.params;
      const updates = req.body;
      const allowedFields = ["name", "description"];
      const setClause = [];
      const values = [];
      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key)) {
          setClause.push(`${key} = ?`);
          values.push(value);
        }
      }
      if (setClause.length === 0) {
        return res.status(400).json({ error: "No valid fields to update" });
      }
      values.push(id);
      const sql = `UPDATE permissions SET ${setClause.join(", ")} WHERE id = ?`;
      const [result] = await query(sql, values);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Permission not found" });
      }
      const [rows] = await query(
        "SELECT id, name, description FROM permissions WHERE id = ?",
        [id],
      );
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Delete permission
router.delete("/:id", [param("id").notEmpty().isInt()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { id } = req.params;
    const [result] = await query("DELETE FROM permissions WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Permission not found" });
    }
    res.json({ message: "Permission deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
// ---
// Endpoints:
// GET    /api/v1/permissions           - List permissions (with pagination)
// GET    /api/v1/permissions/:id       - Get permission by ID
// POST   /api/v1/permissions           - Create permission
// PUT    /api/v1/permissions/:id       - Update permission
// DELETE /api/v1/permissions/:id       - Delete permission
// ---
