// backend/routes/departments.js
import express from "express";
import { query } from "../config/database.js";
import { body, param, validationResult } from "express-validator";
const router = express.Router();

// Get all departments (with pagination)
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const [departments] = await query(
      "SELECT id, name, description FROM departments ORDER BY name LIMIT ? OFFSET ?",
      [Number(limit), Number(offset)],
    );
    const [countRows] = await query(
      "SELECT COUNT(*) as count FROM departments",
    );
    const total = countRows[0].count;
    res.json({
      departments,
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

// Get department by ID
router.get("/:id", [param("id").notEmpty().isInt()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { id } = req.params;
    const [rows] = await query(
      "SELECT id, name, description FROM departments WHERE id = ?",
      [id],
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Department not found" });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create department
router.post(
  "/",
  [
    body("name").notEmpty().isString().isLength({ max: 100 }),
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
        "INSERT INTO departments (name, description) VALUES (?, ?)",
        [name, description],
      );
      const [rows] = await query(
        "SELECT id, name, description FROM departments WHERE id = ?",
        [result.insertId],
      );
      res.status(201).json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Update department
router.put(
  "/:id",
  [
    param("id").notEmpty().isInt(),
    body("name").optional().isString().isLength({ max: 100 }),
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
      const sql = `UPDATE departments SET ${setClause.join(", ")} WHERE id = ?`;
      const [result] = await query(sql, values);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Department not found" });
      }
      const [rows] = await query(
        "SELECT id, name, description FROM departments WHERE id = ?",
        [id],
      );
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Delete department
router.delete("/:id", [param("id").notEmpty().isInt()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { id } = req.params;
    const [result] = await query("DELETE FROM departments WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Department not found" });
    }
    res.json({ message: "Department deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
// ---
// Endpoints:
// GET    /api/departments           - List departments (with pagination)
// GET    /api/departments/:id       - Get department by ID
// POST   /api/departments           - Create department
// PUT    /api/departments/:id       - Update department
// DELETE /api/departments/:id       - Delete department
// ---
