import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import issueRoutes from "./routes/issues.js";
import authRoutes from "./routes/auth.js";
import weatherRoutes from "./routes/weather.js";
const path = require("path"); 

dotenv.config();

const app = express();

connectDB();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:8080",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8080"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.static(path.join(__dirname, "public")));
// Increase limit for base64 image payloads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/weather", weatherRoutes);

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`✅ Server running on port ${process.env.PORT || 5000}`);
  console.log(`📦 Mongo URI: ${process.env.MONGO_URI ? "Connected" : "MISSING!"}`);
  console.log(`🔑 JWT Secret: ${process.env.JWT_SECRET ? "Set" : "MISSING!"}`);
});

