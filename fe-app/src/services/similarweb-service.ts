/**
 * Frontend service for website traffic data that uses the backend API
 */

import { API_BASE_URL } from "@/config";

export interface TrafficMetrics {
  pageViews: string;
}

/**
 * Get website traffic metrics from the backend API
 */
export async function getWebsiteTraffic(websiteUrl: string): Promise<TrafficMetrics> {
  try {
    const response = await fetch(`${API_BASE_URL}/traffic?url=${encodeURIComponent(websiteUrl)}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch traffic data: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      pageViews: data.visits,
    };
  } catch (error) {
    console.error("Error fetching traffic data:", error);
    return {
      pageViews: "N/A",
    };
  }
}
