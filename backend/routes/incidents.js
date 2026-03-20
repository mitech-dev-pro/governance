import express from "express";
import { query } from "../config/database.js";
const router = express.Router();

// --- Incidents ---
router.get("/", async (req, res) => {
  /**
   * @swagger
   * /incidents:
   *   get:
   *     summary: List incidents
   *     tags: [Incidents]
   *     security:
   *       - bearerAuth: []
   *     description: Get all incidents
   *     responses:
   *       200:
   *         description: List of incidents
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   * */
  try {
    const [rows] = await query("SELECT * FROM incidents");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  /**
   * @swagger
   * /incidents/{id}:
   *   get:
   *     summary: Get incident by ID
   *     tags: [Incidents]
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
   *         description: Incident found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *       404:
   *         description: Incident not found
   * */
  try {
    const [rows] = await query("SELECT * FROM incidents WHERE id = ?", [
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
   * /incidents:
   *   post:
   *     summary: Create incident
   *     tags: [Incidents]
   *     security:
   *       - bearerAuth: []
   *     description: Create a new incident
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - incident_number
   *               - title
   *               - description
   *               - status
   *               - reported_by
   *               - reported_date
   *             properties:
   *               incident_number:
   *                 type: string
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *               status:
   *                 type: string
   *               reported_by:
   *                 type: string
   *               reported_date:
   *                 type: string
   *                 format: date
   *     responses:
   *       201:
   *         description: Incident created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *       400:
   *         description: Validation error
   * */
  try {
    const {
      incident_number,
      title,
      description,
      status,
      reported_by,
      reported_date,
    } = req.body;
    const [result] = await query(
      "INSERT INTO incidents (id, incident_number, title, description, status, reported_by, reported_date) VALUES (UUID(), ?, ?, ?, ?, ?, ?)",
      [incident_number, title, description, status, reported_by, reported_date],
    );
    res.status(201).json({
      id: result.insertId,
      incident_number,
      title,
      description,
      status,
      reported_by,
      reported_date,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  /**
   * @swagger
   * /incidents/{id}:
   *   put:
   *     summary: Update incident by ID
   *     tags: [Incidents]
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
   *               incident_number:
   *                 type: string
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *               status:
   *                 type: string
   *               reported_by:
   *                 type: string
   *               reported_date:
   *                 type: string
   *                 format: date
   *     responses:
   *       200:
   *         description: Incident updated
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *       400:
   *         description: Validation error
   *       404:
   *         description: Incident not found
   * */
  try {
    const {
      incident_number,
      title,
      description,
      status,
      reported_by,
      reported_date,
    } = req.body;
    await query(
      "UPDATE incidents SET incident_number = ?, title = ?, description = ?, status = ?, reported_by = ?, reported_date = ? WHERE id = ?",
      [
        incident_number,
        title,
        description,
        status,
        reported_by,
        reported_date,
        req.params.id,
      ],
    );
    res.json({
      id: req.params.id,
      incident_number,
      title,
      description,
      status,
      reported_by,
      reported_date,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  /**
   * @swagger
   * /incidents/{id}:
   *   delete:
   *     summary: Delete incident by ID
   *     tags: [Incidents]
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
   *         description: Incident deleted
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *       404:
   *         description: Incident not found
   * */
  try {
    await query("DELETE FROM incidents WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Incident Responses (sub-entity) ---
router.get("/:incidentId/responses", async (req, res) => {
  /**
   * @swagger
   * /incidents/{incidentId}/responses:
   *   get:
   *     summary: List incident responses for an incident
   *     tags: [Incidents]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: incidentId
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: List of incident responses
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   * */
  try {
    const [rows] = await query(
      "SELECT * FROM incident_responses WHERE incident_id = ?",
      [req.params.incidentId],
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:incidentId/responses", async (req, res) => {
  /**
   * @swagger
   * /incidents/{incidentId}/responses:
   *   post:
   *     summary: Create incident response for an incident
   *     tags: [Incidents]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: incidentId
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
   *               - response
   *               - responder_id
   *               - response_date
   *             properties:
   *               response:
   *                 type: string
   *               responder_id:
   *                 type: string
   *               response_date:
   *                 type: string
   *                 format: date
   *     responses:
   *       201:
   *         description: Incident response created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *       400:
   *         description: Validation error
   * */
  try {
    const { response, responder_id, response_date } = req.body;
    const [result] = await query(
      "INSERT INTO incident_responses (id, incident_id, response, responder_id, response_date) VALUES (UUID(), ?, ?, ?, ?)",
      [req.params.incidentId, response, responder_id, response_date],
    );
    res.status(201).json({
      id: result.insertId,
      incident_id: req.params.incidentId,
      response,
      responder_id,
      response_date,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/responses/:id", async (req, res) => {
  /**
   * @swagger
   * /incidents/responses/{id}:
   *   delete:
   *     summary: Delete incident response by ID
   *     tags: [Incidents]
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
   *         description: Incident response deleted
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *       404:
   *         description: Incident response not found
   * */
  try {
    await query("DELETE FROM incident_responses WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Incident Investigations (sub-entity) ---
router.get("/:incidentId/investigations", async (req, res) => {
  /**
   * @swagger
   * /incidents/{incidentId}/investigations:
   *   get:
   *     summary: List incident investigations for an incident
   *     tags: [Incidents]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: incidentId
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: List of incident investigations
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   * */
  try {
    const [rows] = await query(
      "SELECT * FROM incident_investigations WHERE incident_id = ?",
      [req.params.incidentId],
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:incidentId/investigations", async (req, res) => {
  /**
   * @swagger
   * /incidents/{incidentId}/investigations:
   *   post:
   *     summary: Create incident investigation for an incident
   *     tags: [Incidents]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: incidentId
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
   *               - investigation
   *               - investigator_id
   *               - investigation_date
   *             properties:
   *               investigation:
   *                 type: string
   *               investigator_id:
   *                 type: string
   *               investigation_date:
   *                 type: string
   *                 format: date
   *     responses:
   *       201:
   *         description: Incident investigation created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *       400:
   *         description: Validation error
   * */
  try {
    const { investigation, investigator_id, investigation_date } = req.body;
    const [result] = await query(
      "INSERT INTO incident_investigations (id, incident_id, investigation, investigator_id, investigation_date) VALUES (UUID(), ?, ?, ?, ?)",
      [
        req.params.incidentId,
        investigation,
        investigator_id,
        investigation_date,
      ],
    );
    res.status(201).json({
      id: result.insertId,
      incident_id: req.params.incidentId,
      investigation,
      investigator_id,
      investigation_date,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/investigations/:id", async (req, res) => {
  /**
   * @swagger
   * /incidents/investigations/{id}:
   *   delete:
   *     summary: Delete incident investigation by ID
   *     tags: [Incidents]
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
   *         description: Incident investigation deleted
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *       404:
   *         description: Incident investigation not found
   * */
  try {
    await query("DELETE FROM incident_investigations WHERE id = ?", [
      req.params.id,
    ]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Incident Lessons Learned (sub-entity) ---
router.get("/:incidentId/lessons", async (req, res) => {
  /**
   * @swagger
   * /incidents/{incidentId}/lessons:
   *   get:
   *     summary: List lessons learned for an incident
   *     tags: [Incidents]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: incidentId
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: List of lessons learned
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   * */
  try {
    const [rows] = await query(
      "SELECT * FROM incident_lessons WHERE incident_id = ?",
      [req.params.incidentId],
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:incidentId/lessons", async (req, res) => {
  /**
   * @swagger
   * /incidents/{incidentId}/lessons:
   *   post:
   *     summary: Create lesson learned for an incident
   *     tags: [Incidents]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: incidentId
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
   *               - lesson_learned
   *             properties:
   *               lesson_learned:
   *                 type: string
   *     responses:
   *       201:
   *         description: Lesson learned created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *       400:
   *         description: Validation error
   * */
  try {
    const { lesson_learned } = req.body;
    const [result] = await query(
      "INSERT INTO incident_lessons (id, incident_id, lesson_learned) VALUES (UUID(), ?, ?)",
      [req.params.incidentId, lesson_learned],
    );
    res.status(201).json({
      id: result.insertId,
      incident_id: req.params.incidentId,
      lesson_learned,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/lessons/:id", async (req, res) => {
  /**
   * @swagger
   * /incidents/lessons/{id}:
   *   delete:
   *     summary: Delete lesson learned by ID
   *     tags: [Incidents]
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
   *         description: Lesson learned deleted
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *       404:
   *         description: Lesson learned not found
   * */
  try {
    await query("DELETE FROM incident_lessons WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
