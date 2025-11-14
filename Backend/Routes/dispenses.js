import express from "express";
import db from "../Config/mysql.js";

const router = express.Router();

// GET all dispenses
router.get("/", async (req, res) => {
  const query = `
    SELECT 
      d.dispense_id,
      d.visit_id,
      d.quantity_dispensed,
      d.dosage_instructions,
      m.name AS medication_name,
      CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
      v.visit_number
    FROM Trial_Medication_Dispense d
    LEFT JOIN Medication m ON d.medication_id = m.medication_id
    LEFT JOIN Visits v ON d.visit_id = v.visit_id
    LEFT JOIN Patient_Enrollment e ON v.enrollment_id = e.enrollment_id
    LEFT JOIN Patients p ON e.patient_id = p.patient_id
    ORDER BY d.dispense_id DESC;
  `;

  try {
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching dispenses:", err);
    res.status(500).json({ error: "Failed to fetch dispenses" });
  }
});

// Create dispense
router.post("/", async (req, res) => {
  const { visit_id, medication_name, quantity_dispensed, dosage_instructions } = req.body;

  try {
    // Find or create medication_id for the given medication name
    let [medResult] = await db.query(
      "SELECT medication_id FROM Medication WHERE name = ?",
      [medication_name]
    );

    let medication_id;
    if (medResult.length > 0) {
      medication_id = medResult[0].medication_id;
    } else {
      const [insertMed] = await db.query(
        "INSERT INTO Medication (name, manufacturer) VALUES (?, 'Unknown')",
        [medication_name]
      );
      medication_id = insertMed.insertId;
    }

    const query = `
      INSERT INTO Trial_Medication_Dispense (visit_id, medication_id, quantity_dispensed, dosage_instructions)
      VALUES (?, ?, ?, ?);
    `;
    const [result] = await db.query(query, [visit_id, medication_id, quantity_dispensed, dosage_instructions]);

    res.json({ message: "Dispense created", dispense_id: result.insertId });
  } catch (err) {
    console.error("Error creating dispense:", err);
    res.status(500).json({ error: "Failed to create dispense" });
  }
});

// Update dispense
router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const { visit_id, medication_name, quantity_dispensed, dosage_instructions } = req.body;

  try {
    // Resolve medication_id from medication_name
    let [medResult] = await db.query("SELECT medication_id FROM Medication WHERE name = ?", [medication_name]);

    let medication_id;
    if (medResult.length > 0) {
      medication_id = medResult[0].medication_id;
    } else {
      const [insertMed] = await db.query(
        "INSERT INTO Medication (name, manufacturer) VALUES (?, 'Unknown')",
        [medication_name]
      );
      medication_id = insertMed.insertId;
    }

    const query = `
      UPDATE Trial_Medication_Dispense
      SET visit_id = ?, medication_id = ?, quantity_dispensed = ?, dosage_instructions = ?
      WHERE dispense_id = ?;
    `;
    const [result] = await db.query(query, [visit_id, medication_id, quantity_dispensed, dosage_instructions, id]);

    if (result.affectedRows === 0) return res.status(404).json({ error: "Dispense not found" });
    res.json({ message: "Dispense updated" });
  } catch (err) {
    console.error("Error updating dispense:", err);
    res.status(500).json({ error: "Failed to update dispense" });
  }
});

// Delete dispense
router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const [result] = await db.query("DELETE FROM Trial_Medication_Dispense WHERE dispense_id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Dispense not found" });
    res.json({ message: "Dispense deleted" });
  } catch (err) {
    console.error("Error deleting dispense:", err);
    res.status(500).json({ error: "Failed to delete dispense" });
  }
});

export default router;
