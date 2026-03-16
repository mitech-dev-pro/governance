// backend/routes/users.js
import express from "express";
import { query } from "../config/database.js";
import bcrypt from "bcryptjs";
import { body, validationResult } from "express-validator";
import { requireRole } from "../middleware/auth.js";
const router = express.Router();

// Get all users (with optional pagination)
router.get("/", requireRole(["admin"]), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const [users] = await query(
      "SELECT id, email, role, first_name, last_name, is_active FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [Number(limit), Number(offset)],
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
router.get("/:id", requireRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await query(
      "SELECT id, email, role, first_name, last_name, is_active FROM users WHERE id = ?",
      [id],
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new user (admin only)
router.post(
  "/",
  requireRole(["admin"]),
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
    body("role")
      .isIn(["admin", "manager", "user"])
      .withMessage("Role must be admin, manager, or user"),
    body("first_name").notEmpty().trim(),
    body("last_name").notEmpty().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { email, password, role, first_name, last_name } = req.body;
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      const [result] = await query(
        "INSERT INTO users (email, password, role, first_name, last_name, is_active) VALUES (?, ?, ?, ?, ?, 1)",
        [email, hashedPassword, role, first_name, last_name],
      );
      const [rows] = await query(
        "SELECT id, email, role, first_name, last_name, is_active FROM users WHERE id = ?",
        [result.insertId],
      );
      res.status(201).json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Update user by ID (admin only)
router.put(
  "/:id",
  requireRole(["admin"]),
  [
    body("email").optional().isEmail().withMessage("Valid email required"),
    body("role")
      .optional()
      .isIn(["admin", "manager", "user"])
      .withMessage("Role must be admin, manager, or user"),
    body("first_name").optional().notEmpty().trim(),
    body("last_name").optional().notEmpty().trim(),
    body("is_active").optional().isBoolean(),
    body("password")
      .optional()
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { id } = req.params;
      const updates = req.body;
      const allowedFields = [
        "email",
        "role",
        "first_name",
        "last_name",
        "is_active",
        "password",
      ];
      const setClause = [];
      const values = [];
      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key)) {
          if (key === "password") {
            // Hash password if updating
            const hashedPassword = await bcrypt.hash(value, 10);
            setClause.push("password = ?");
            values.push(hashedPassword);
          } else {
            setClause.push(`${key} = ?`);
            values.push(value);
          }
        }
      }
      if (setClause.length === 0) {
        return res.status(400).json({ error: "No valid fields to update" });
      }
      values.push(id);
      const sql = `UPDATE users SET ${setClause.join(", ")} WHERE id = ?`;
      const [result] = await query(sql, values);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      const [rows] = await query(
        "SELECT id, email, role, first_name, last_name, is_active FROM users WHERE id = ?",
        [id],
      );
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Delete user by ID (admin only)
router.delete("/:id", requireRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await query("DELETE FROM users WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
// ---
// Endpoints:
// GET    /api/users           - List users (with pagination)
// GET    /api/users/:id       - Get user by ID
// POST   /api/users           - Create user
// PUT    /api/users/:id       - Update user
// DELETE /api/users/:id       - Delete user
// ---
// Note: Password hashing, validation, and authorization checks should be added for production use.
