// backend/middleware/auth.js
import jwt from "jsonwebtoken";
import { query } from "../config/database.js";

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key",
    );

    // MySQL uses ? for parameters, and mysql2 returns [rows, fields]
    const [rows] = await query(
      "SELECT id, email, first_name, last_name, is_active FROM users WHERE id = ?",
      [decoded.userId],
    );

    if (rows.length === 0 || !rows[0].is_active) {
      return res.status(403).json({ error: "User not found or inactive" });
    }

    // Fetch roles for user
    const [userRoles] = await query(
      `SELECT r.id, r.name FROM roles r
        JOIN user_roles ur ON ur.role_id = r.id
        WHERE ur.user_id = ?`,
      [decoded.userId],
    );

    // Fetch permissions for user (via roles)
    const [userPermissions] = await query(
      `SELECT p.id, p.name FROM permissions p
        JOIN role_permissions rp ON rp.permission_id = p.id
        JOIN user_roles ur ON ur.role_id = rp.role_id
        WHERE ur.user_id = ?
        GROUP BY p.id, p.name`,
      [decoded.userId],
    );

    req.user = {
      ...rows[0],
      roles: userRoles.map((r) => r.name),
      permissions: userPermissions.map((p) => p.name),
    };
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid token" });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (
      !req.user.roles ||
      !req.user.roles.some((role) => roles.includes(role))
    ) {
      return res.status(403).json({ error: "Insufficient role" });
    }
    next();
  };
};

export const requirePermission = (permissions) => {
  return (req, res, next) => {
    if (
      !req.user.permissions ||
      !req.user.permissions.some((perm) => permissions.includes(perm))
    ) {
      return res.status(403).json({ error: "Insufficient permission" });
    }
    next();
  };
};
