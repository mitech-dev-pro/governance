// backend/routes/roles.js
import express from "express";
import { query } from "../config/database.js";
import { body, param, validationResult } from "express-validator";
const router = express.Router();

// Get all roles (with pagination)
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const [roles] = await query(
      "SELECT id, name, description FROM roles ORDER BY name LIMIT ? OFFSET ?",
      [Number(limit), Number(offset)],
    );
    const [countRows] = await query("SELECT COUNT(*) as count FROM roles");
    const total = countRows[0].count;
    res.json({
      roles,
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

// Get role by ID
router.get("/:id", [param("id").notEmpty().isInt()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { id } = req.params;
    const [rows] = await query(
      "SELECT id, name, description FROM roles WHERE id = ?",
      [id],
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Role not found" });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create role
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
        "INSERT INTO roles (name, description) VALUES (?, ?)",
        [name, description],
      );
      const [rows] = await query(
        "SELECT id, name, description FROM roles WHERE id = ?",
        [result.insertId],
      );
      res.status(201).json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Update role
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
      const sql = `UPDATE roles SET ${setClause.join(", ")} WHERE id = ?`;
      const [result] = await query(sql, values);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Role not found" });
      }
      const [rows] = await query(
        "SELECT id, name, description FROM roles WHERE id = ?",
        [id],
      );
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Delete role
router.delete("/:id", [param("id").notEmpty().isInt()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { id } = req.params;
    const [result] = await query("DELETE FROM roles WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Role not found" });
    }
    res.json({ message: "Role deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
// ---
// Endpoints:
// GET    /api/v1/roles           - List roles (with pagination)
// GET    /api/v1/roles/:id       - Get role by ID
// POST   /api/v1/roles           - Create role
// PUT    /api/v1/roles/:id       - Update role
// DELETE /api/v1/roles/:id       - Delete role
// ---
