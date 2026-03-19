// backend/routes/users.js
import express from "express";
import { query } from "../config/database.js";
const router = express.Router();

// --- Users ---
router.get("/", async (req, res) => {
  /**
   * @swagger
   * /users:
   *   get:
   *     summary: List users
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     description: Get all users (admin only, paginated)
   *     parameters:
   *       - name: page
   *         in: query
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Page number
   *       - name: limit
   *         in: query
   *         schema:
   *           type: integer
   *           default: 20
   *         description: Results per page
   *     responses:
   *       200:
   *         description: List of users
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/User'
   */

  try {
    const [rows] = await query("SELECT * FROM users");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  /**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
       - name: id
         in: path
         required: true
         schema:
           type: string
     responses:
       200:
         description: User found
         content:
           application/json:
             schema:
               $ref: '#/components/schemas/User'
       404:
         description: User not found
 */

  try {
    const [rows] = await query("SELECT * FROM users WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  /**
   * @swagger
   * /users:
   *   post:
   *     summary: Create user
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     description: Create a new user (admin only)
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *               - role
   *               - first_name
   *               - last_name
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *                 minLength: 8
   *               role:
   *                 type: string
   *                 enum: [admin, manager, user]
   *               first_name:
   *                 type: string
   *               last_name:
   *                 type: string
   *     responses:
   *       201:
   *         description: User created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       400:
   *         description: Validation error
   */

  try {
    const { username, email, password, role, status } = req.body;
    const [result] = await query(
      "INSERT INTO users (id, username, email, password, role, status) VALUES (UUID(), ?, ?, ?, ?, ?)",
      [username, email, password, role, status],
    );
    res
      .status(201)
      .json({ id: result.insertId, username, email, role, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               role:
 *                 type: string
 *                 enum: [admin, manager, user]
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found
 */
router.put("/:id", async (req, res) => {
  try {
    const { username, email, password, role, status } = req.body;
    await query(
      "UPDATE users SET username = ?, email = ?, password = ?, role = ?, status = ? WHERE id = ?",
      [username, email, password, role, status, req.params.id],
    );
    res.json({ id: req.params.id, username, email, role, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: User not found
 */
router.delete("/:id", async (req, res) => {
  try {
    await query("DELETE FROM users WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
