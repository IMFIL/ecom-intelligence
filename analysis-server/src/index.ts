import express from "express";
import dotenv from "dotenv";
import analysisRoutes from "./routes/analysis.js";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

// Register routes
app.use("/api", analysisRoutes);

// Start server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] 🚀 Node.js analysis server running on port ${PORT}`);
});
