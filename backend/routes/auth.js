import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { query } from "../config/database.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

// POST /api/v1/auth/login
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
/*
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
			const [existing] = await query("SELECT id FROM users WHERE email = ?", [email]);
			if (existing.length) {
				return res.status(409).json({ error: "Email already registered" });
			}
			const hash = await bcrypt.hash(password, 10);
			const id = crypto.randomUUID();
			await query(
				"INSERT INTO users (id, email, password_hash, first_name, last_name, department, is_active) VALUES (?, ?, ?, ?, ?, ?, true)",
				[id, email, hash, first_name, last_name, department || null]
			);
			res.status(201).json({ message: "User registered" });
		} catch (err) {
			res.status(500).json({ error: err.message });
		}
	}
);
*/

export default router;
