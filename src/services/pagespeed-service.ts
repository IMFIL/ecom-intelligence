import { API_BASE_URL } from "@/config";

// Create a cache to store PageSpeed metrics
const pageSpeedCache = new Map<string, PageSpeedMetrics | null>();

// 2 minutes in milliseconds
const TIMEOUT_DURATION = 2 * 60 * 1000;

interface PageSpeedMetrics {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  totalBlockingTime?: number;
  cumulativeLayoutShift?: number;
  speedIndex?: number;
  strategy?: "mobile" | "desktop";
}

/**
 * Fetch PageSpeed metrics from the backend API with local caching
 */
export async function fetchPageSpeedMetrics(
  url: string,
  strategy: "mobile" | "desktop" = "desktop"
): Promise<PageSpeedMetrics | null> {
  const cacheKey = `${url}-${strategy}`;

  // Check cache first
  const cachedResult = pageSpeedCache.get(cacheKey);
  if (cachedResult !== undefined) {
    // Update window.competitors with cached speed index if available
    if (cachedResult && cachedResult.speedIndex) {
      updateCompetitorSpeedIndex(url, cachedResult.speedIndex);
    }
    return cachedResult;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_DURATION);

    const response = await fetch(
      `${API_BASE_URL}/pagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}`,
      {
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error("PageSpeed API error:", response.statusText);
      // Cache the error result
      pageSpeedCache.set(cacheKey, null);
      return null;
    }

    const metrics = await response.json();

    // Cache the successful result
    pageSpeedCache.set(cacheKey, metrics);

    // Update window.competitors with new speed index if available
    if (metrics && metrics.speedIndex) {
      updateCompetitorSpeedIndex(url, metrics.speedIndex);
    }

    return metrics;
  } catch (error) {
    console.error("Error fetching PageSpeed metrics:", error);

    // Check if the error is due to timeout
    if (error instanceof DOMException && error.name === "AbortError") {
      console.error("Request timed out after 2 minutes for:", url);
    }

    // Cache the error result
    pageSpeedCache.set(cacheKey, null);
    return null;
  }
}

// Helper function to update competitor speed index
function updateCompetitorSpeedIndex(url: string, speedIndex: number) {
  if (typeof window !== "undefined" && Array.isArray((window as any).competitors)) {
    const competitors = (window as any).competitors;
    const competitor = competitors.find((c: any) => c.website === url);
    if (competitor) {
      competitor.speedIndex = speedIndex;
      // Trigger a re-render by creating a new array reference
      (window as any).competitors = [...competitors];
    }
  }
}
