import express from "express";
import db from "../config/db.js"; // your MySQL connection

const router = express.Router();

// ✅ GET all trial outcomes with patient and visit info
router.get("/outcomes", async (req, res) => {
  const query = `
  SELECT 
    to1.outcome_id,
    CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
    v.visit_number AS visit_number,
    to1.outcome_type,
    to1.outcome_value,
    to1.notes
  FROM trial_outcomes AS to1
  JOIN visits AS v ON to1.visit_id = v.visit_id
  JOIN patient_enrollment AS e ON v.enrollment_id = e.enrollment_id
  JOIN patients AS p ON e.patient_id = p.patient_id
  ORDER BY to1.outcome_id;
`;

  try {
    const [rows] = await db.promise().query(query);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching outcomes:", err);
    res.status(500).json({ error: "Failed to fetch outcomes" });
  }
});

// ✅ Add new trial outcome
router.post("/outcomes", async (req, res) => {
  const { visit_id, outcome_type, outcome_value, notes } = req.body;

  const query = `
    INSERT INTO trial_outcomes (visit_id, outcome_type, outcome_value, notes)
    VALUES (?, ?, ?, ?);
  `;

  try {
    const [result] = await db.promise().query(query, [
      visit_id,
      outcome_type,
      outcome_value,
      notes
    ]);

    res.json({
      message: "Trial outcome added successfully",
      outcome_id: result.insertId
    });
  } catch (err) {
    console.error("Error adding outcome:", err);
    res.status(500).json({ error: "Failed to add outcome" });
  }
});

// ✅ Update trial outcome
router.put("/outcomes/:id", async (req, res) => {
  const outcomeId = req.params.id;
  const { visit_id, outcome_type, outcome_value, notes } = req.body;

  const query = `
    UPDATE trial_outcomes
    SET visit_id = ?,
        outcome_type = ?,
        outcome_value = ?,
        notes = ?
    WHERE outcome_id = ?;
  `;

  try {
    const [result] = await db.promise().query(query, [
      visit_id,
      outcome_type,
      outcome_value,
      notes,
      outcomeId
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Outcome not found" });
    }

    res.json({ message: "Trial outcome updated successfully" });
  } catch (err) {
    console.error("Error updating outcome:", err);
    res.status(500).json({ error: "Failed to update outcome" });
  }
});

// ✅ Delete trial outcome
router.delete("/outcomes/:id", async (req, res) => {
  const outcomeId = req.params.id;

  const query = `DELETE FROM trial_outcomes WHERE outcome_id = ?;`;

  try {
    const [result] = await db.promise().query(query, [outcomeId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Outcome not found" });
    }

    res.json({ message: "Trial outcome deleted successfully" });
  } catch (err) {
    console.error("Error deleting outcome:", err);
    res.status(500).json({ error: "Failed to delete outcome" });
  }
});

export default router;
