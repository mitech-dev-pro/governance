import express from "express";
import { query } from "../config/database.js";
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
 *               role_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Role assigned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Validation error
 */
router.post("/", async (req, res) => {
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
