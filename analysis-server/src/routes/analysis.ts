import express from "express";
import { randomUUID } from "crypto";
import { AnalysisRequest } from "../models/types.js";
import { runPageAnalysis } from "../services/analysis.js";

const router = express.Router();

// POST /api/analyze-pages
router.post("/analyze-pages", async (req, res) => {
  try {
    const { url, page_group, company_name } = req.body as AnalysisRequest;

    // Validate required fields
    if (!url || !page_group || !company_name) {
      throw new Error("Missing required parameters. Need url, page_group, and company_name");
    }

    // Start analysis process
    const filepath = await runPageAnalysis(url, page_group);

    return res.status(200).json(filepath);
  } catch (error) {
    console.error("Error in analyze-pages endpoint:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

export default router;
