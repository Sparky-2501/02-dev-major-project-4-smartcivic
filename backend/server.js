import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import issueRoutes from "./routes/issues.js";

dotenv.config();  

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/issues", issueRoutes);

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running on port 5000");
  console.log("Mongo URI:", process.env.MONGO_URI);
});