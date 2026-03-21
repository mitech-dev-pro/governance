import express from "express";
import { query } from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";
const router = express.Router();

/**
 * @swagger
 * /user_roles:
 *   post:
 *     summary: Assign a role to a user
 *     tags: [UserRoles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - role_id
 *             properties:
 *               user_id:
 *                 type: integer
 *                  example: 1
 *               role_id:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Role assigned
 *       400:
 *         description: Validation error
 */
router.post("/", authenticateToken, async (req, res) => {
  const { user_id, role_id } = req.body;
  if (!user_id || !role_id) {
    return res.status(400).json({ error: "user_id and role_id are required" });
  }
  try {
    await query("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)", [
      user_id,
      role_id,
    ]);
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
