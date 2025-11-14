import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CSV_FILE = path.join(__dirname, "../data/users.csv");

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_jwt_key_change_in_production";

// ✅ Helper to read users from CSV
const readUsers = () => {
  try {
    if (!fs.existsSync(CSV_FILE)) {
      // Create the file with header if it doesn't exist
      const dir = path.dirname(CSV_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(CSV_FILE, "email,password,firstName,lastName,role\n");
      return [];
    }
    
    const data = fs.readFileSync(CSV_FILE, "utf-8").trim();
    if (!data || data === "email,password,firstName,lastName,role") return [];
    
    const lines = data.split("\n").slice(1); // skip header
    return lines.filter(line => line.trim()).map(line => {
      const [email, password, firstName, lastName, role] = line.split(",");
      return { email, password, firstName, lastName, role };
    });
  } catch (error) {
    console.error("Error reading users:", error);
    return [];
  }
};

// ✅ Helper to append user
const appendUser = (user) => {
  try {
    const header = "email,password,firstName,lastName,role\n";
    if (!fs.existsSync(CSV_FILE)) {
      const dir = path.dirname(CSV_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(CSV_FILE, header);
    }
    const line = `${user.email},${user.password},${user.firstName},${user.lastName},${user.role}\n`;
    fs.appendFileSync(CSV_FILE, line);
  } catch (error) {
    console.error("Error appending user:", error);
    throw error;
  }
};

// ✅ Signup route
router.post("/signup", async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const users = readUsers();
    if (users.find(u => u.email === email)) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    appendUser({ email, password: hashed, firstName, lastName, role });

    res.status(201).json({ message: "Signup successful" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error during signup" });
  }
});

// ✅ Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const users = readUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

export default router;