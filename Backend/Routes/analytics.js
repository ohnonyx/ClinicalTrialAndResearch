import express from "express";
import db from "../Config/mysql.js";

const router = express.Router();

// Response Rate via stored procedure
router.get("/response-rate", async (req, res) => {
  const { trialId } = req.query;
  try {
    const [rows] = await db.query("CALL GetResponseRate(?)", [trialId]);
    res.json(rows[0][0]);
  } catch (err) {
    console.error("Error fetching response rate:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
