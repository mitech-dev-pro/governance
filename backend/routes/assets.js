import express from "express";
import { query } from "../config/database.js";
import { body, param, validationResult } from "express-validator";
const router = express.Router();

// Get all assets with filters
router.get("/", async (req, res) => {
  try {
    const {
      type,
      classification,
      status,
      criticality,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    let sql = `
      SELECT a.*,
        u1.first_name as owner_first_name, u1.last_name as owner_last_name,
        u2.first_name as custodian_first_name, u2.last_name as custodian_last_name
      FROM assets a
      LEFT JOIN users u1 ON a.owner_id = u1.id
      LEFT JOIN users u2 ON a.custodian_id = u2.id
      WHERE 1=1
    `;
    const params = [];

    if (type) {
      sql += ` AND a.type = ?`;
      params.push(type);
    }
    if (classification) {
      sql += ` AND a.classification = ?`;
      params.push(classification);
    }
    if (status) {
      sql += ` AND a.status = ?`;
      params.push(status);
    }
    if (criticality) {
      sql += ` AND a.criticality = ?`;
      params.push(criticality);
    }
    if (search) {
      sql += ` AND (a.name LIKE ? OR a.asset_tag LIKE ? OR a.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const offset = (page - 1) * limit;
    sql += ` ORDER BY a.created_at DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const [assets] = await query(sql, params);

    // Get summary stats
    const [statsRows] = await query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN criticality = 'critical' THEN 1 ELSE 0 END) as critical,
        SUM(CASE WHEN classification = 'restricted' THEN 1 ELSE 0 END) as restricted
      FROM assets
    `);

    res.json({
      assets,
      summary: statsRows[0],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: statsRows[0].total,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create asset
router.post(
  "/",
  [
    body("asset_tag").notEmpty().isString().isLength({ max: 100 }),
    body("name").notEmpty().isString().isLength({ max: 255 }),
    body("type").notEmpty().isString().isLength({ max: 50 }),
    body("classification").optional().isString().isLength({ max: 50 }),
    body("status").optional().isString().isLength({ max: 50 }),
    body("criticality").optional().isString().isLength({ max: 20 }),
    body("owner_id").optional().isString().isLength({ max: 36 }),
    body("custodian_id").optional().isString().isLength({ max: 36 }),
    body("acquisition_date").optional().isISO8601(),
    body("cost").optional().isDecimal(),
    body("category").optional().isString().isLength({ max: 100 }),
    body("location").optional().isString().isLength({ max: 255 }),
    body("description").optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const {
        asset_tag,
        name,
        description,
        type,
        category,
        location,
        owner_id,
        custodian_id,
        classification,
        status,
        acquisition_date,
        cost,
        criticality,
      } = req.body;
      const [result] = await query(
        `INSERT INTO assets 
        (asset_tag, name, description, type, category, location, owner_id, custodian_id, 
         classification, status, acquisition_date, cost, criticality)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          asset_tag,
          name,
          description,
          type,
          category,
          location,
          owner_id,
          custodian_id,
          classification,
          status,
          acquisition_date,
          cost,
          criticality,
        ],
      );
      const [rows] = await query(`SELECT * FROM assets WHERE id = ?`, [
        result.insertId,
      ]);
      res.status(201).json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get asset by ID with dependencies
router.get(
  "/:id",
  [param("id").notEmpty().isString().isLength({ max: 36 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { id } = req.params;
      const [assetRows] = await query(
        `SELECT a.*,
          u1.first_name as owner_first_name, u1.last_name as owner_last_name,
          u2.first_name as custodian_first_name, u2.last_name as custodian_last_name
        FROM assets a
        LEFT JOIN users u1 ON a.owner_id = u1.id
        LEFT JOIN users u2 ON a.custodian_id = u2.id
        WHERE a.id = ?`,
        [id],
      );
      if (assetRows.length === 0) {
        return res.status(404).json({ error: "Asset not found" });
      }
      const [depsRows] = await query(
        `SELECT ad.*, a.name as asset_name, a.asset_tag
         FROM asset_dependencies ad
         JOIN assets a ON ad.child_asset_id = a.id
         WHERE ad.parent_asset_id = ?`,
        [id],
      );
      const [risksRows] = await query(
        `SELECT id, risk_id, title, risk_level, status
         FROM risks
         WHERE asset_id = ?`,
        [id],
      );
      res.json({
        ...assetRows[0],
        dependencies: depsRows,
        linked_risks: risksRows,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

export default router;
