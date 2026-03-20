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

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload a file (asset, governance, compliance, etc.)
 *     description: Upload a file and associate it with an entity. Only PDF, JPEG, PNG, DOC, and DOCX files up to 10MB are allowed.
 *     tags:
 *       - Upload
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload
 *               entity_type:
 *                 type: string
 *                 description: The type of entity the file is related to (e.g., asset, governance, compliance)
 *               entity_id:
 *                 type: string
 *                 description: The ID of the related entity
 *               title:
 *                 type: string
 *                 description: Optional file title
 *               description:
 *                 type: string
 *                 description: Optional file description
 *               category:
 *                 type: string
 *                 description: Optional file category
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 file:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     path:
 *                       type: string
 *                     name:
 *                       type: string
 *                     type:
 *                       type: string
 *                     size:
 *                       type: integer
 *       400:
 *         description: Invalid file or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
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

/**
 * @swagger
 * /upload/{id}/download:
 *   get:
 *     summary: Download a file by ID
 *     description: Download a file previously uploaded and associated with an entity.
 *     tags:
 *       - Upload
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The document ID
 *     responses:
 *       200:
 *         description: File download
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: File not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
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
