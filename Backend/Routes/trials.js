import express from "express";
import db from "../Config/mysql.js";

const router = express.Router();

/**
 * ✅ Get all clinical trials
 * Includes sponsor name, phase, start/end dates, and investigator info.
 */
router.get("/", async (req, res) => {
  const query = `
    SELECT 
      ct.trial_id,
      ct.trial_name,
      ct.phase,
      ct.start_date,
      ct.end_date,
      ct.description,
      s.name AS sponsor_name,
      CONCAT(st.first_name, ' ', st.last_name) AS primary_investigator_name
    FROM clinical_trials AS ct
    LEFT JOIN sponsors AS s ON ct.sponsor_id = s.sponsor_id
    LEFT JOIN staff AS st ON ct.primary_investigator_id = st.staff_id
    ORDER BY ct.trial_id;
  `;

  try {
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching trials:", err);
    res.status(500).json({ error: "Failed to fetch trials data" });
  }
});

/**
 * ✅ Add a new clinical trial
 */
router.post("/", async (req, res) => {
  const {
    trial_name,
    phase,
    start_date,
    end_date,
    description,
    sponsor_id,
    primary_investigator_id,
  } = req.body;

  const query = `
    INSERT INTO clinical_trials 
      (trial_name, phase, start_date, end_date, description, sponsor_id, primary_investigator_id)
    VALUES (?, ?, ?, ?, ?, ?, ?);
  `;

  try {
    const [result] = await db.query(query, [
      trial_name,
      phase,
      start_date,
      end_date,
      description,
      sponsor_id,
      primary_investigator_id,
    ]);

    res.json({
      message: "Trial created successfully",
      trial_id: result.insertId,
    });
  } catch (err) {
    console.error("Error creating trial:", err);
    res.status(500).json({ error: "Failed to create trial" });
  }
});

/**
 * Update a clinical trial
 */
router.put("/:id", async (req, res) => {
  const trialId = req.params.id;
  const {
    trial_name,
    phase,
    start_date,
    end_date,
    description,
    sponsor_id,
    primary_investigator_id,
  } = req.body;

  const query = `
    UPDATE clinical_trials 
    SET trial_name = ?, phase = ?, start_date = ?, end_date = ?, description = ?, sponsor_id = ?, primary_investigator_id = ?
    WHERE trial_id = ?;
  `;

  try {
    const [result] = await db.query(query, [
      trial_name,
      phase,
      start_date,
      end_date,
      description,
      sponsor_id,
      primary_investigator_id,
      trialId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Trial not found" });
    }

    res.json({ message: "Trial updated successfully" });
  } catch (err) {
    console.error("Error updating trial:", err);
    res.status(500).json({ error: "Failed to update trial" });
  }
});

/**
 * Delete a clinical trial
 */
router.delete("/:id", async (req, res) => {
  const trialId = req.params.id;
  try {
    const [result] = await db.query("DELETE FROM clinical_trials WHERE trial_id = ?", [trialId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Trial not found" });
    res.json({ message: "Trial deleted successfully" });
  } catch (err) {
    console.error("Error deleting trial:", err);
    res.status(500).json({ error: "Failed to delete trial" });
  }
});

export default router;