import express from "express";
import db from "../Config/mysql.js";

const router = express.Router();

// ✅ Fetch all visit records with patient + trial info
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        v.visit_id,
        pe.patient_id,
        pe.trial_id,
        CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
        t.trial_name,
        v.visit_number,
        v.scheduled_date,
        v.actual_date,
        v.status,
        v.notes
      FROM Visits v
      JOIN Patient_Enrollment pe ON v.enrollment_id = pe.enrollment_id
      JOIN Patients p ON pe.patient_id = p.patient_id
      JOIN Clinical_Trials t ON pe.trial_id = t.trial_id
      ORDER BY v.visit_id ASC;
    `);

    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching visits:", err);
    res.status(500).json({ error: err.message });
  }
});


// ✅ Add new visit
router.post("/", async (req, res) => {
  const { enrollment_id, visit_number, scheduled_date, actual_date, status, notes } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO visits 
       (enrollment_id, visit_number, scheduled_date, actual_date, status, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [enrollment_id, visit_number, scheduled_date, actual_date, status, notes]
    );

    res.json({
      message: "Visit added successfully",
      visit_id: result.insertId
    });
  } catch (err) {
    console.error("❌ Error adding visit:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update visit
router.put("/:id", async (req, res) => {
  const visitId = req.params.id;
  const { patient_id, trial_id, visit_number, scheduled_date, actual_date, status, notes } = req.body;

  try {
    // Get enrollment_id for patient-trial pair
    const [enrollRow] = await db.query(
      `SELECT enrollment_id 
       FROM patient_enrollment 
       WHERE patient_id = ? AND trial_id = ? 
       LIMIT 1`,
      [patient_id, trial_id]
    );

    if (!enrollRow.length) {
      return res.status(400).json({ error: "Enrollment not found for this patient-trial pair." });
    }

    const enrollment_id = enrollRow[0].enrollment_id;

    const [result] = await db.query(
      `UPDATE Visits 
       SET enrollment_id = ?,
           visit_number = ?,
           scheduled_date = ?,
           actual_date = ?,
           status = ?,
           notes = ?
       WHERE visit_id = ?`,
      [enrollment_id, visit_number, scheduled_date, actual_date, status, notes, visitId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Visit not found" });
    }

    res.json({ message: "Visit updated successfully" });
  } catch (err) {
    console.error("❌ Error updating visit:", err);

    // ✅ TRIGGER HANDLING: MySQL SIGNAL
    if (err.sqlState === '45000') {
      return res.status(400).json({ error: `Trigger: ${err.sqlMessage}` });
    }

    res.status(500).json({ error: err.message });
  }
});

export default router;