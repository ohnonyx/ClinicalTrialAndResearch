import express from "express";
import db from "../Config/mysql.js";

const router = express.Router();

router.get("/:patientId", async (req, res) => {
  const { patientId } = req.params;

  try {
    // 1️⃣ Get patient and contact info
    const [patientRows] = await db.query(`
      SELECT 
        p.patient_id,
        p.first_name,
        p.last_name,
        p.gender,
        p.date_of_birth,
        c.email,
        c.phone_number
      FROM Patients p
      LEFT JOIN Contact_Info c ON p.contact_id = c.contact_id
      WHERE p.patient_id = ?;
    `, [patientId]);

    if (patientRows.length === 0)
      return res.status(404).json({ error: "Patient not found" });

    const patient = {
      first_name: patientRows[0].first_name,
      last_name: patientRows[0].last_name,
      gender: patientRows[0].gender,
      date_of_birth: patientRows[0].date_of_birth,
    };

    const contact = {
      email: patientRows[0].email,
      phone_number: patientRows[0].phone_number,
    };

    // 2️⃣ Get enrollments
    const [enrollmentRows] = await db.query(`
      SELECT 
        e.enrollment_id,
        e.enrollment_date,
        e.status,
        t.trial_name
      FROM Patient_Enrollment e
      JOIN Clinical_Trials t ON e.trial_id = t.trial_id
      WHERE e.patient_id = ?;
    `, [patientId]);

    const enrollments = [];

    for (const e of enrollmentRows) {
      // 3️⃣ Get visits for this enrollment
      const [visitRows] = await db.query(`
        SELECT 
          v.visit_id,
          v.visit_number,
          v.actual_date,
          v.status
        FROM Visits v
        WHERE v.enrollment_id = ?;
      `, [e.enrollment_id]);

      const visits = [];

      for (const v of visitRows) {
        // Measurements
        const [measurements] = await db.query(`
          SELECT measurement_id, type, value, unit
          FROM Measurements
          WHERE visit_id = ?;
        `, [v.visit_id]);

        // Medications
        const [medications] = await db.query(`
          SELECT 
  d.dispense_id,
  m.name,
  d.quantity_dispensed,
  d.dosage_instructions
FROM Trial_Medication_Dispense d
JOIN medication m ON d.medication_id = m.medication_id
WHERE d.visit_id = ?;

        `, [v.visit_id]);

        // Outcomes
        const [outcomes] = await db.query(`
          SELECT outcome_id, outcome_type, outcome_value, notes
          FROM Trial_Outcomes
          WHERE visit_id = ?;
        `, [v.visit_id]);

        visits.push({
          visit_id: v.visit_id,
          visit_number: v.visit_number,
          actual_date: v.actual_date,
          status: v.status,
          measurements,
          medications,
          outcomes,
        });
      }

      enrollments.push({
        enrollment_id: e.enrollment_id,
        enrollment_date: e.enrollment_date,
        trial_name: e.trial_name,
        status: e.status,
        visits,
      });
    }

    // 4️⃣ Combine and return
    res.json({
      patient,
      contact,
      enrollments,
    });

  } catch (err) {
    console.error("Error fetching patient history:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
