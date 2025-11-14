import express from "express";
import db from "../Config/mysql.js";

const router = express.Router();

/**
 * ✅ 1. Get all research staff
 * Includes their role and which trial(s) they are linked to (if any)
 */
router.get("/staff", async (req, res) => {
  const query = `
    SELECT 
      s.staff_id,
      s.first_name,
      s.last_name,
      s.role,
      ct.trial_id,
      ct.trial_name
    FROM staff AS s
    LEFT JOIN clinical_trials AS ct 
      ON s.staff_id = ct.primary_investigator_id
      OR s.staff_id = ct.primary_investigator_id
    ORDER BY s.staff_id;
  `;

  try {
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching staff:", err);
    res.status(500).json({ error: "Failed to fetch staff data" });
  }
});

/**
 * ✅ 2. Get all research sites
 * Includes site director (from Staff) and number of patients enrolled at that site
 */
router.get("/sites", async (req, res) => {
  const query = `
    SELECT 
      rs.site_id,
      rs.name,
      rs.street_address,
      rs.city,
      CONCAT(st.first_name, ' ', st.last_name) AS director_name,
      COUNT(DISTINCT pe.patient_id) AS total_patients
    FROM research_sites AS rs
    LEFT JOIN staff AS st ON rs.site_director_id = st.staff_id
    LEFT JOIN patient_enrollment AS pe ON rs.site_id = pe.site_id
    GROUP BY rs.site_id, rs.name, rs.street_address, rs.city, st.first_name, st.last_name
    ORDER BY rs.site_id;
  `;

  try {
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching sites:", err);
    res.status(500).json({ error: "Failed to fetch site data" });
  }
});

/**
 * ✅ 3. Get all sponsors
 * Includes number of trials sponsored
 */
router.get("/sponsors", async (req, res) => {
  const query = `
    SELECT 
      sp.sponsor_id,
      sp.name,
      sp.contact_person,
      COUNT(DISTINCT ct.trial_id) AS total_trials
    FROM sponsors AS sp
    LEFT JOIN clinical_trials AS ct ON sp.sponsor_id = ct.sponsor_id
    GROUP BY sp.sponsor_id, sp.name, sp.contact_person
    ORDER BY sp.sponsor_id;
  `;

  try {
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching sponsors:", err);
    res.status(500).json({ error: "Failed to fetch sponsor data" });
  }
});

/**
 * ✅ Add new staff member
 */
router.post("/staff", async (req, res) => {
  const { first_name, last_name, role } = req.body;

  const query = `
    INSERT INTO staff (first_name, last_name, role)
    VALUES (?, ?, ?);
  `;

  try {
    const [result] = await db.query(query, [first_name, last_name, role]);
    res.json({
      message: "Staff member created successfully",
      staff_id: result.insertId,
    });
  } catch (err) {
    console.error("Error creating staff member:", err);
    res.status(500).json({ error: "Failed to create staff member" });
  }
});

/**
 * ✅ Update staff member
 */
router.put("/staff/:id", async (req, res) => {
  const staffId = req.params.id;
  const { first_name, last_name, role } = req.body;

  const query = `
    UPDATE staff 
    SET first_name = ?, last_name = ?, role = ?
    WHERE staff_id = ?;
  `;

  try {
    const [result] = await db.query(query, [first_name, last_name, role, staffId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Staff member not found" });
    }
    res.json({ message: "Staff member updated successfully" });
  } catch (err) {
    console.error("Error updating staff member:", err);
    res.status(500).json({ error: "Failed to update staff member" });
  }
});

/**
 * ✅ Delete staff member
 */
router.delete("/staff/:id", async (req, res) => {
  const staffId = req.params.id;

  const query = `DELETE FROM staff WHERE staff_id = ?;`;

  try {
    const [result] = await db.query(query, [staffId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Staff member not found" });
    }
    res.json({ message: "Staff member deleted successfully" });
  } catch (err) {
    console.error("Error deleting staff member:", err);
    res.status(500).json({ error: "Failed to delete staff member" });
  }
});

/**
 * ✅ Add new research site
 */
router.post("/sites", async (req, res) => {
  const { name, street_address, city, site_director_id } = req.body;

  // coerce empty or 'none' values to NULL for integer FK columns
  let directorId = null;
  if (site_director_id !== undefined && site_director_id !== '' && site_director_id !== 'none') {
    const parsed = Number(site_director_id);
    directorId = Number.isFinite(parsed) ? parsed : null;
  }

  const query = `
    INSERT INTO research_sites (name, street_address, city, site_director_id)
    VALUES (?, ?, ?, ?);
  `;

  try {
    const [result] = await db.query(query, [name, street_address, city, directorId]);
    res.json({
      message: "Research site created successfully",
      site_id: result.insertId,
    });
  } catch (err) {
    console.error("Error creating research site:", err, err?.sqlMessage || err?.message);
    // Return message for debugging (safe to remove/shorten in production)
    res.status(500).json({ error: err?.message || 'Failed to create research site' });
  }
});

/**
 * ✅ Update research site
 */
router.put("/sites/:id", async (req, res) => {
  const siteId = Number(req.params.id);
  const { name, street_address, city, site_director_id } = req.body;

  let directorId = null;
  if (site_director_id !== undefined && site_director_id !== '' && site_director_id !== 'none') {
    const parsed = Number(site_director_id);
    directorId = Number.isFinite(parsed) ? parsed : null;
  }

  const query = `
    UPDATE research_sites 
    SET name = ?, street_address = ?, city = ?, site_director_id = ?
    WHERE site_id = ?;
  `;

  try {
    // If the client explicitly provided site_director_id but it resolved to null,
    // refuse the update because the DB column does not allow NULL in this schema.
    if (Object.prototype.hasOwnProperty.call(req.body, 'site_director_id') && directorId === null) {
      return res.status(400).json({ error: "site_director_id cannot be null for this update; provide a valid staff id" });
    }

    const [result] = await db.query(query, [name, street_address, city, directorId, siteId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Research site not found" });
    }
    res.json({ message: "Research site updated successfully" });
  } catch (err) {
    console.error("Error updating research site:", err, err?.sqlMessage || err?.message);
    res.status(500).json({ error: err?.message || "Failed to update research site" });
  }
});

/**
 * ✅ Delete research site
 */
router.delete("/sites/:id", async (req, res) => {
  const siteId = req.params.id;

  const query = `DELETE FROM research_sites WHERE site_id = ?;`;

  try {
    const [result] = await db.query(query, [siteId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Research site not found" });
    }
    res.json({ message: "Research site deleted successfully" });
  } catch (err) {
    console.error("Error deleting research site:", err);
    res.status(500).json({ error: "Failed to delete research site" });
  }
});

/**
 * ✅ Add new sponsor
 */
router.post("/sponsors", async (req, res) => {
  const { name, contact_person } = req.body;

  const query = `
    INSERT INTO sponsors (name, contact_person)
    VALUES (?, ?);
  `;

  try {
    const [result] = await db.query(query, [name, contact_person]);
    res.json({
      message: "Sponsor created successfully",
      sponsor_id: result.insertId,
    });
  } catch (err) {
    console.error("Error creating sponsor:", err);
    res.status(500).json({ error: "Failed to create sponsor" });
  }
});

/**
 * ✅ Update sponsor
 */
router.put("/sponsors/:id", async (req, res) => {
  const sponsorId = req.params.id;
  const { name, contact_person } = req.body;

  const query = `
    UPDATE sponsors 
    SET name = ?, contact_person = ?
    WHERE sponsor_id = ?;
  `;

  try {
    const [result] = await db.query(query, [name, contact_person, sponsorId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Sponsor not found" });
    }
    res.json({ message: "Sponsor updated successfully" });
  } catch (err) {
    console.error("Error updating sponsor:", err);
    res.status(500).json({ error: "Failed to update sponsor" });
  }
});

/**
 * ✅ Delete sponsor
 */
router.delete("/sponsors/:id", async (req, res) => {
  const sponsorId = req.params.id;

  const query = `DELETE FROM sponsors WHERE sponsor_id = ?;`;

  try {
    const [result] = await db.query(query, [sponsorId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Sponsor not found" });
    }
    res.json({ message: "Sponsor deleted successfully" });
  } catch (err) {
    console.error("Error deleting sponsor:", err);
    res.status(500).json({ error: "Failed to delete sponsor" });
  }
});

export default router;
