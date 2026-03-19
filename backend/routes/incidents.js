import express from "express";
import { query } from "../config/database.js";
const router = express.Router();

// --- Incidents ---
router.get("/", async (req, res) => {
  try {
    const [rows] = await query("SELECT * FROM incidents");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
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
    res
      .status(201)
      .json({
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
  try {
    await query("DELETE FROM incidents WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Incident Responses (sub-entity) ---
router.get("/:incidentId/responses", async (req, res) => {
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
  try {
    const { response, responder_id, response_date } = req.body;
    const [result] = await query(
      "INSERT INTO incident_responses (id, incident_id, response, responder_id, response_date) VALUES (UUID(), ?, ?, ?, ?)",
      [req.params.incidentId, response, responder_id, response_date],
    );
    res
      .status(201)
      .json({
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
  try {
    await query("DELETE FROM incident_responses WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Incident Investigations (sub-entity) ---
router.get("/:incidentId/investigations", async (req, res) => {
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
    res
      .status(201)
      .json({
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
  try {
    const { lesson_learned } = req.body;
    const [result] = await query(
      "INSERT INTO incident_lessons (id, incident_id, lesson_learned) VALUES (UUID(), ?, ?)",
      [req.params.incidentId, lesson_learned],
    );
    res
      .status(201)
      .json({
        id: result.insertId,
        incident_id: req.params.incidentId,
        lesson_learned,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/lessons/:id", async (req, res) => {
  try {
    await query("DELETE FROM incident_lessons WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
