import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { query } from "../config/database.js";
import { body, validationResult } from "express-validator";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

//Get current user endpoint
//Requires authentication (JWT).Extracts the user ID from the JWT.Looks up the user in the database.Returns the full user object (matching your User interface).
//  GET /api/v1/auth/me
/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user details
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get("/me", authenticateToken, async (req, res) => {
  try {
    // console.log("[auth/me] req.user object:", req.user);
    const userId = req.user.id;
    // console.log("[auth/me] userId from JWT:", userId);

    const [users] = await query(
      `
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.department,
        u.is_active,
        r.id AS role_id,
        r.name AS role_name,
        r.type AS role_type
      FROM users u
      LEFT JOIN user_roles ur ON ur.user_id = u.id
      LEFT JOIN roles r ON r.id = ur.role_id
      WHERE u.id = ?
      `,
      [userId],
    );

    // console.log("[auth/me] DB query result:", users);

    if (!users.length) {
      console.warn(`[auth/me] No user found for userId: ${userId}`);
      return res.status(404).json({ error: "User not found" });
    }

    const baseUser = {
      id: users[0].id,
      email: users[0].email,
      first_name: users[0].first_name,
      last_name: users[0].last_name,
      department: users[0].department,
      is_active: users[0].is_active,
      roles: users
        .filter((row) => row.role_id)
        .map((row) => ({
          id: row.role_id,
          name: row.role_name,
          type: row.role_type,
        })),
    };

    res.json(baseUser);
  } catch (err) {
    console.error("[auth/me] Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/v1/auth/login
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     description: Authenticate user and return JWT token and user object.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: JWT token and user object returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: <jwt-token>
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 */
router.post(
  "/login",
  [body("email").isEmail(), body("password").notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      const [users] = await query(
        "SELECT * FROM users WHERE email = ? AND is_active = true",
        [email],
      );
      if (!users.length) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const user = users[0];
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      // JWT payload
      const payload = { userId: user.id };
      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "8h" },
      );
      res.json({
        token,
        user, // returns the whole user object
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// (Optional) POST /api/v1/auth/register
// Uncomment to allow registration

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: User registration (optional)
 *     tags: [Auth]
 *     description: Register a new user. (Enable endpoint in code to use)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - first_name
 *               - last_name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               department:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already registered
 */
router.post(
  "/register",
  [
    body("email").isEmail(),
    body("password").isLength({ min: 8 }),
    body("first_name").notEmpty(),
    body("last_name").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password, first_name, last_name, department } = req.body;
    try {
      const [existing] = await query("SELECT id FROM users WHERE email = ?", [
        email,
      ]);
      if (existing.length) {
        return res.status(409).json({ error: "Email already registered" });
      }
      const hash = await bcrypt.hash(password, 10);
      await query(
        "INSERT INTO users (email, password_hash, first_name, last_name, department, is_active) VALUES (?, ?, ?, ?, ?, true)",
        [email, hash, first_name, last_name, department || null],
      );
      res.status(201).json({ message: "User registered" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

export default router;
