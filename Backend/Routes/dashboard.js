import express from "express";
import db from "../Config/mysql.js";

const router = express.Router();

// 1️⃣ Core dashboard metrics
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM Patients) AS total_patients,
        (SELECT COUNT(*) FROM Clinical_Trials) AS total_trials,
        (SELECT COUNT(*) FROM Visits) AS total_visits,
        (SELECT COUNT(*) FROM Visits WHERE status='Completed') AS completed_visits,
        (
          SELECT 
            ROUND(
              (SUM(CASE 
                     WHEN LOWER(o.outcome_value) IN ('responded','improved','positive','high response') 
                     THEN 1 ELSE 0 END) 
               / COUNT(*)) * 100, 
              2
            )
          FROM Trial_Outcomes o
        ) AS avg_response_rate
    `);
    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Dashboard metrics error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 2️⃣ Completed visits by trial
router.get("/visits-by-trial", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        t.trial_name,
        COUNT(v.visit_id) AS completed_visits
      FROM Visits v
      JOIN Patient_Enrollment pe ON v.enrollment_id = pe.enrollment_id
      JOIN Clinical_Trials t ON pe.trial_id = t.trial_id
      WHERE v.status = 'Completed'
      GROUP BY t.trial_name
      ORDER BY completed_visits DESC;
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ Visits by trial error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 3️⃣ Enrollment trends (monthly)
router.get("/enrollments-trend", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        DATE_FORMAT(enrollment_date, '%Y-%m') AS month,
        COUNT(*) AS enrollments
      FROM Patient_Enrollment
      GROUP BY month
      ORDER BY month ASC;
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ Enrollment trend error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
