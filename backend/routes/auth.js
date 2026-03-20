import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { query } from "../config/database.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

// POST /api/v1/auth/login
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     description: Authenticate user and return JWT token.
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
 *         description: JWT token returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: <jwt-token>
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
      res.json({ token });
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
