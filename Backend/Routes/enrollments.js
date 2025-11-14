import express from "express";
import db from "../Config/mysql.js";

const router = express.Router();

// GET all enrollments (with joined patient/trial/site names when available)
router.get("/", async (req, res) => {
  const query = `
    SELECT e.enrollment_id, e.patient_id, e.trial_id, e.site_id, e.enrollment_date, e.status,
           CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
           t.trial_name,
           rs.name AS site_name
    FROM patient_enrollment e
    LEFT JOIN Patients p ON e.patient_id = p.patient_id
    LEFT JOIN clinical_trials t ON e.trial_id = t.trial_id
    LEFT JOIN research_sites rs ON e.site_id = rs.site_id
    ORDER BY e.enrollment_id;
  `;

  try {
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching enrollments:', err);
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
});

// Create enrollment
router.post("/", async (req, res) => {
  const { patient_id, trial_id, site_id, enrollment_date, status } = req.body;
  const query = `
    INSERT INTO patient_enrollment (patient_id, trial_id, site_id, enrollment_date, status)
    VALUES (?, ?, ?, ?, ?);
  `;

  try {
    const [result] = await db.query(query, [patient_id, trial_id, site_id, enrollment_date, status]);
    res.json({ message: 'Enrollment created', enrollment_id: result.insertId });
  } catch (err) {
    console.error('Error creating enrollment:', err);
    res.status(500).json({ error: 'Failed to create enrollment' });
  }
});

// Update enrollment
router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const { patient_id, trial_id, site_id, enrollment_date, status } = req.body;
  const query = `
    UPDATE patient_enrollment
    SET patient_id = ?, trial_id = ?, site_id = ?, enrollment_date = ?, status = ?
    WHERE enrollment_id = ?;
  `;

  try {
    const [result] = await db.query(query, [patient_id, trial_id, site_id, enrollment_date, status, id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Enrollment not found' });
    res.json({ message: 'Enrollment updated' });
  } catch (err) {
    console.error('Error updating enrollment:', err);
    res.status(500).json({ error: 'Failed to update enrollment' });
  }
});

// Delete enrollment
router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const [result] = await db.query('DELETE FROM patient_enrollment WHERE enrollment_id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Enrollment not found' });
    res.json({ message: 'Enrollment deleted' });
  } catch (err) {
    console.error('Error deleting enrollment:', err);
    res.status(500).json({ error: 'Failed to delete enrollment' });
  }
});

export default router;
