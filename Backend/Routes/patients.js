import express from "express";
import db from "../Config/mysql.js";

const router = express.Router();

// 🧩 GET all patients (joined with contact info)
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.patient_id,
        p.first_name,
        p.last_name,
        p.gender,
        p.date_of_birth,
        c.email,
        c.phone_number,
        c.address,
        c.city,
        c.zip_code
      FROM Patients p
      LEFT JOIN Contact_Info c ON p.contact_id = c.contact_id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🧩 ADD patient + contact info
router.post("/", async (req, res) => {
  const {
    first_name,
    last_name,
    gender,
    date_of_birth,
    email,
    phone_number,
    address,
    city,
    zip_code,
  } = req.body;

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // 🧩 Step 1: Insert into Contact_Info first
    const [contactResult] = await connection.query(
      "INSERT INTO Contact_Info (email, phone_number, address, city, zip_code) VALUES (?, ?, ?, ?, ?)",
      [email, phone_number, address, city, zip_code]
    );
    const contactId = contactResult.insertId;

    // 🧩 Step 2: Insert into Patients and link contact_id
    const [patientResult] = await connection.query(
      "INSERT INTO Patients (first_name, last_name, gender, date_of_birth, contact_id) VALUES (?, ?, ?, ?, ?)",
      [first_name, last_name, gender, date_of_birth, contactId]
    );

    await connection.commit();
    connection.release();
    res.json({ message: "✅ Patient and contact info added successfully" });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error("Error adding patient:", err);
    res.status(500).json({ error: err.message });
  }
});


// 🧩 UPDATE patient and contact info
router.put("/:id", async (req, res) => {
  const patientId = req.params.id;
  const {
    first_name,
    last_name,
    gender,
    date_of_birth,
    email,
    phone_number,
    address,
    city,
    zip_code,
  } = req.body;

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // Get the contact_id for the patient
    const [patientRows] = await connection.query(
      "SELECT contact_id FROM Patients WHERE patient_id = ?",
      [patientId]
    );

    if (patientRows.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ error: "Patient not found" });
    }

    const contactId = patientRows[0].contact_id;

    // Update Contact_Info
    await connection.query(
      "UPDATE Contact_Info SET email = ?, phone_number = ?, address = ?, city = ?, zip_code = ? WHERE contact_id = ?",
      [email, phone_number, address, city, zip_code, contactId]
    );

    // Update Patient info
    await connection.query(
      "UPDATE Patients SET first_name = ?, last_name = ?, gender = ?, date_of_birth = ? WHERE patient_id = ?",
      [first_name, last_name, gender, date_of_birth, patientId]
    );

    await connection.commit();
    connection.release();
    res.json({ message: "✅ Patient and contact info updated successfully" });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error("Error updating patient:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🧩 DELETE patient and associated contact info
router.delete("/:id", async (req, res) => {
  const patientId = req.params.id;
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // Get the contact_id for the patient
    const [patientRows] = await connection.query(
      "SELECT contact_id FROM Patients WHERE patient_id = ?",
      [patientId]
    );

    if (patientRows.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ error: "Patient not found" });
    }

    const contactId = patientRows[0].contact_id;

    // Delete from Patients first (due to foreign key constraint)
    await connection.query("DELETE FROM Patients WHERE patient_id = ?", [patientId]);

    // Then delete from Contact_Info
    await connection.query("DELETE FROM Contact_Info WHERE contact_id = ?", [contactId]);

    await connection.commit();
    connection.release();
    res.json({ message: "✅ Patient and contact info deleted successfully" });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error("Error deleting patient:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
