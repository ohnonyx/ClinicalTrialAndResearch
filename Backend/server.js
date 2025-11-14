import express from "express";
import mysql from "mysql2";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import testRoutes from "./Routes/test.js";
import patientsRoutes from "./Routes/patients.js";
import enrollmentsRoutes from "./Routes/enrollments.js";
import measurementsRoutes from "./Routes/measurements.js";
import dispensesRoutes from "./Routes/dispenses.js";
import visitsRoutes from "./Routes/visits.js";
import TrialoutcomesRoutes from "./Routes/trial_outcomes.js";
import staffAndSitesRoutes from "./Routes/staffandsites.js";
import trialsRoutes from "./Routes/trials.js";
import dashboardRoutes from "./Routes/dashboard.js";
import analyticsRoutes from "./Routes/analytics.js";
import patientHistoryRoutes from "./Routes/patientHistory.js";
import authRoutes from "./Routes/auth.js";

dotenv.config();
const app = express();

// ✅ Middleware - MUST be before routes
app.use(cors());
app.use(express.json());

// ✅ MySQL setup
const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB
});

connection.connect(err => {
  if (err) {
    console.error("❌ MySQL connection failed:", err.message);
  } else {
    console.log("✅ Connected to MySQL");
  }
});

// ✅ MongoDB setup (optional)
if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB connection failed:", err));
}

// ✅ Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/patients", patientsRoutes);
app.use("/api/visits", visitsRoutes);
app.use("/api", TrialoutcomesRoutes);
app.use("/api/staffandsites", staffAndSitesRoutes);
app.use("/api/trials", trialsRoutes);
app.use("/api/enrollments", enrollmentsRoutes);
app.use("/api/measurements", measurementsRoutes);
app.use("/api/dispenses", dispensesRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/patient-history", patientHistoryRoutes);

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
