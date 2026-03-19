import express from "express";
import { query } from "../config/database.js";
const router = express.Router();

// --- Vendors ---
router.get("/", async (req, res) => {
  /**
   * @swagger
   * /vendors:
   *   get:
   *     summary: List vendors
   *     tags: [Vendors]
   *     security:
   *       - bearerAuth: []
   *     description: Get all vendors (paginated)
   *     responses:
   *       200:
   *         description: List of vendors
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   */
  try {
    const [rows] = await query("SELECT * FROM vendors");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  /**
   * @swagger
   * /vendors/{id}:
   *   get:
   *     summary: Get vendor by ID
   *     tags: [Vendors]
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
   *         description: Vendor found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *       404:
   *         description: Vendor not found
   */
  try {
    const [rows] = await query("SELECT * FROM vendors WHERE id = ?", [
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
   * /vendors:
   *   post:
   *     summary: Create vendor
   *     tags: [Vendors]
   *     security:
   *       - bearerAuth: []
   *     description: Create a new vendor
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *             properties:
   *               name:
   *                 type: string
   *               contact_info:
   *                 type: string
   *               status:
   *                 type: string
   *     responses:
   *       201:
   *         description: Vendor created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *       400:
   *         description: Validation error
   */
  try {
    const { name, contact_info, status } = req.body;
    const [result] = await query(
      "INSERT INTO vendors (id, name, contact_info, status) VALUES (UUID(), ?, ?, ?)",
      [name, contact_info, status],
    );
    res.status(201).json({ id: result.insertId, name, contact_info, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  /**
   * @swagger
   * /vendors/{id}:
   *   put:
   *     summary: Update vendor by ID
   *     tags: [Vendors]
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
   *               name:
   *                 type: string
   *               contact_info:
   *                 type: string
   *               status:
   *                 type: string
   *     responses:
   *       200:
   *         description: Vendor updated
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *       400:
   *         description: Validation error
   *       404:
   *         description: Vendor not found
   */
  try {
    const { name, contact_info, status } = req.body;
    await query(
      "UPDATE vendors SET name = ?, contact_info = ?, status = ? WHERE id = ?",
      [name, contact_info, status, req.params.id],
    );
    res.json({ id: req.params.id, name, contact_info, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  /**
   * @swagger
   * /vendors/{id}:
   *   delete:
   *     summary: Delete vendor by ID
   *     tags: [Vendors]
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
   *         description: Vendor deleted
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *       404:
   *         description: Vendor not found
   */
  try {
    await query("DELETE FROM vendors WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Vendor Risk Assessments (sub-entity) ---
router.get("/:vendorId/risk-assessments", async (req, res) => {
  /**
   * @swagger
   * /vendors/{vendorId}/risk-assessments:
   *   get:
   *     summary: List vendor risk assessments
   *     tags: [Vendors]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: vendorId
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: List of vendor risk assessments
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   */
  try {
    const [rows] = await query(
      "SELECT * FROM vendor_risk_assessments WHERE vendor_id = ?",
      [req.params.vendorId],
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:vendorId/risk-assessments", async (req, res) => {
  /**
   * @swagger
   * /vendors/{vendorId}/risk-assessments:
   *   post:
   *     summary: Create vendor risk assessment
   *     tags: [Vendors]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: vendorId
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
   *             required:
   *               - assessment_date
   *               - risk_level
   *             properties:
   *               assessment_date:
   *                 type: string
   *                 format: date
   *               risk_level:
   *                 type: string
   *               notes:
   *                 type: string
   *     responses:
   *       201:
   *         description: Vendor risk assessment created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *       400:
   *         description: Validation error
   */
  try {
    const { assessment_date, risk_level, notes } = req.body;
    const [result] = await query(
      "INSERT INTO vendor_risk_assessments (id, vendor_id, assessment_date, risk_level, notes) VALUES (UUID(), ?, ?, ?, ?)",
      [req.params.vendorId, assessment_date, risk_level, notes],
    );
    res.status(201).json({
      id: result.insertId,
      vendor_id: req.params.vendorId,
      assessment_date,
      risk_level,
      notes,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/risk-assessments/:id", async (req, res) => {
  /**
   * @swagger
   * /vendors/{vendorId}/risk-assessments/{id}:
   *   delete:
   *     summary: Delete vendor risk assessment by ID
   *     tags: [Vendors]
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
   *         description: Vendor risk assessment deleted
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *       404:
   *         description: Vendor risk assessment not found
   */
  try {
    await query("DELETE FROM vendor_risk_assessments WHERE id = ?", [
      req.params.id,
    ]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Vendor Questionnaires (sub-entity) ---
router.get("/:vendorId/questionnaires", async (req, res) => {
  /**
   * @swagger
   * /vendors/{vendorId}/questionnaires:
   *   get:
   *     summary: List vendor questionnaires
   *     tags: [Vendors]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: vendorId
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: List of vendor questionnaires
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   */
  try {
    const [rows] = await query(
      "SELECT * FROM vendor_questionnaires WHERE vendor_id = ?",
      [req.params.vendorId],
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:vendorId/questionnaires", async (req, res) => {
  /**
   * @swagger
   * /vendors/{vendorId}/questionnaires:
   *   post:
   *     summary: Create vendor questionnaire
   *     tags: [Vendors]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: vendorId
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
   *             required:
   *               - questionnaire
   *               - response
   *             properties:
   *               questionnaire:
   *                 type: string
   *               response:
   *                 type: string
   *     responses:
   *       201:
   *         description: Vendor questionnaire created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *       400:
   *         description: Validation error
   */
  try {
    const { questionnaire, response } = req.body;
    const [result] = await query(
      "INSERT INTO vendor_questionnaires (id, vendor_id, questionnaire, response) VALUES (UUID(), ?, ?, ?)",
      [req.params.vendorId, questionnaire, response],
    );
    res.status(201).json({
      id: result.insertId,
      vendor_id: req.params.vendorId,
      questionnaire,
      response,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/questionnaires/:id", async (req, res) => {
  /**
   * @swagger
   * /vendors/questionnaires/{id}:
   *   delete:
   *     summary: Delete vendor questionnaire by ID
   *     tags: [Vendors]
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
   *         description: Vendor questionnaire deleted
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *       404:
   *         description: Vendor questionnaire not found
   */
  try {
    await query("DELETE FROM vendor_questionnaires WHERE id = ?", [
      req.params.id,
    ]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
