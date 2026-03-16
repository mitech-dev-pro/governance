import express from "express";
import { body, validationResult } from "express-validator";
import { query } from "../config/database.js";
import { logActivity } from "../utils/audit.js";
const router = express.Router();

// Get all governance items with filters
router.get("/", async (req, res) => {
  try {
    const { type, status, category, search, page = 1, limit = 20 } = req.query;
    let sql = `
      SELECT gi.*, 
        u1.first_name as owner_first_name, u1.last_name as owner_last_name,
        u2.first_name as reviewer_first_name, u2.last_name as reviewer_last_name
      FROM governance_items gi
      LEFT JOIN users u1 ON gi.owner_id = u1.id
      LEFT JOIN users u2 ON gi.reviewer_id = u2.id
      WHERE 1=1
    `;
    const params = [];

    if (type) {
      sql += ` AND gi.type = ?`;
      params.push(type);
    }
    if (status) {
      sql += ` AND gi.status = ?`;
      params.push(status);
    }
    if (category) {
      sql += ` AND gi.category = ?`;
      params.push(category);
    }
    if (search) {
      sql += ` AND (gi.title LIKE ? OR gi.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    // Pagination
    const offset = (page - 1) * limit;
    sql += ` ORDER BY gi.created_at DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const [items] = await query(sql, params);

    // Get total count
    let countSql = `SELECT COUNT(*) as count FROM governance_items WHERE 1=1`;
    const countParams = [];
    if (type) {
      countSql += ` AND type = ?`;
      countParams.push(type);
    }
    const [countRows] = await query(countSql, countParams);

    res.json({
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countRows[0].count,
        totalPages: Math.ceil(countRows[0].count / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create governance item
router.post(
  "/",
  [
    body("title").notEmpty().trim(),
    body("type").isIn(["policy", "procedure", "control", "guideline"]),
    body("item_code").notEmpty().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        item_code,
        title,
        description,
        type,
        category,
        owner_id,
        iso27001_clause,
        priority,
        review_date,
      } = req.body;

      const [result] = await query(
        `
      INSERT INTO governance_items 
      (item_code, title, description, type, category, owner_id, iso27001_clause, priority, review_date, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
        [
          item_code,
          title,
          description,
          type,
          category,
          owner_id,
          iso27001_clause,
          priority,
          review_date,
          req.user.id,
        ],
      );

      // Get the inserted item
      const [rows] = await query(
        `SELECT * FROM governance_items WHERE id = ?`,
        [result.insertId],
      );

      await logActivity(
        req.user.id,
        "CREATE",
        "governance",
        rows[0].id,
        null,
        rows[0],
      );

      res.status(201).json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Update governance item
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const allowedFields = [
      "title",
      "description",
      "status",
      "owner_id",
      "reviewer_id",
      "approved_by",
      "approved_date",
      "next_review_date",
      "priority",
    ];

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
    const sql = `UPDATE governance_items SET ${setClause.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

    const [result] = await query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Governance item not found" });
    }

    // Get the updated item
    const [rows] = await query(`SELECT * FROM governance_items WHERE id = ?`, [
      id,
    ]);

    await logActivity(req.user.id, "UPDATE", "governance", id, null, rows[0]);

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
