/**
 * OpenAI service for competitor analysis insights
 */

import { API_BASE_URL } from "@/config";

interface CompetitorInsights {
  name: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  threats: string[];
  website?: string;
  revenue?: string;
}

interface CompetitorAnalysis {
  companyDescription: string;
  competitors: CompetitorInsights[];
}

/**
 * Cleans JSON string that might be wrapped in markdown code blocks
 */
function cleanJsonResponse(jsonString: string): string {
  return jsonString
    .replace(/^```json\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

export async function getCompanyInsights(companyName: string): Promise<CompetitorAnalysis> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/company-insights?companyName=${encodeURIComponent(companyName)}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to fetch competitor insights: ${errorData.error || "Unknown error"}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching competitor insights:", error);
    throw error;
  }
}

/**
 * Get insights for a single specified competitor
 */
export async function getSingleCompanyInsight(companyName: string): Promise<CompetitorInsights> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/single-company-insight?companyName=${encodeURIComponent(companyName)}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to fetch competitor insight: ${errorData.error || "Unknown error"}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching single competitor insight:", error);
    throw error;
  }
}
