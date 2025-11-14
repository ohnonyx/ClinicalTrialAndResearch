import express from "express";
import db from "../Config/mysql.js";

const router = express.Router();

// GET all measurements
router.get("/", async (req, res) => {
  const query = `
    SELECT 
    m.*, 
    CONCAT(p.first_name, ' ', p.last_name) AS patient_name, 
    v.visit_number
FROM Measurements m
LEFT JOIN Visits v ON m.visit_id = v.visit_id
LEFT JOIN Patient_Enrollment e ON v.enrollment_id = e.enrollment_id
LEFT JOIN Patients p ON e.patient_id = p.patient_id
ORDER BY m.measurement_id DESC;
  `;

  try {
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching measurements:', err);
    res.status(500).json({ error: 'Failed to fetch measurements' });
  }
});

// Create measurement
router.post("/", async (req, res) => {
  const { patient_id, visit_id, type, value, unit } = req.body;
  const query = `
    INSERT INTO measurements (patient_id, visit_id, type, value, unit)
    VALUES (?, ?, ?, ?, ?);
  `;

  try {
    const [result] = await db.query(query, [patient_id, visit_id, type, value, unit]);
    res.json({ message: 'Measurement created', measurement_id: result.insertId });
  } catch (err) {
    console.error('Error creating measurement:', err);
    res.status(500).json({ error: 'Failed to create measurement' });
  }
});

// Update measurement
router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const { patient_id, visit_id, type, value, unit } = req.body;
  const query = `
    UPDATE measurements
    SET patient_id = ?, visit_id = ?, type = ?, value = ?, unit = ?
    WHERE measurement_id = ?;
  `;

  try {
    const [result] = await db.query(query, [patient_id, visit_id, type, value, unit, id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Measurement not found' });
    res.json({ message: 'Measurement updated' });
  } catch (err) {
    console.error('Error updating measurement:', err);
    res.status(500).json({ error: 'Failed to update measurement' });
  }
});

// Delete measurement
router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const [result] = await db.query('DELETE FROM measurements WHERE measurement_id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Measurement not found' });
    res.json({ message: 'Measurement deleted' });
  } catch (err) {
    console.error('Error deleting measurement:', err);
    res.status(500).json({ error: 'Failed to delete measurement' });
  }
});

export default router;
