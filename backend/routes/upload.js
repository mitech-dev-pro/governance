// backend/routes/upload.js
import express from "express";
import multer from "multer";
import path from "path";
import { query } from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.env.UPLOAD_DIR || "uploads/"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

// File validation: max size 10MB, allowed types
const allowedTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Invalid file type"));
    }
    cb(null, true);
  },
});

// Upload endpoint (for asset, governance, compliance documents)
router.post("/", authenticateToken, upload.single("file"), async (req, res) => {
  try {
    const { entity_type, entity_id, title, description, category } = req.body;
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    // Save file metadata to documents table
    const [result] = await query(
      `INSERT INTO documents (id, title, description, file_path, file_type, file_size, category, related_type, related_id, uploaded_by, created_at)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        title || file.originalname,
        description || null,
        file.path,
        file.mimetype,
        file.size,
        category || null,
        entity_type || null,
        entity_id || null,
        req.user.id,
      ],
    );
    res.status(201).json({
      message: "File uploaded successfully",
      file: {
        id: result.insertId,
        path: file.path,
        name: file.originalname,
        type: file.mimetype,
        size: file.size,
      },
    });
  } catch (error) {
    // Multer file validation error
    if (
      error instanceof multer.MulterError ||
      error.message === "Invalid file type"
    ) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// Download endpoint
router.get("/:id/download", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await query(
      "SELECT file_path, file_type, title FROM documents WHERE id = ?",
      [id],
    );
    if (!rows.length) {
      return res.status(404).json({ error: "File not found" });
    }
    const filePath = rows[0].file_path;
    const fileName = rows[0].title || undefined;
    res.download(filePath, fileName);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
