export interface AnalysisResult {
  id: string;
  status: "pending" | "running" | "completed" | "failed";
  url: string;
  pageGroup: string;
  companyName: string;
  timestamp: string;
  error?: string;
  sessionId?: string;
  liveViewUrl?: string;
  screenshot?: string; // Base64 encoded screenshot
  screenshotPath?: string; // Path to the saved screenshot file
  scrollScreenshots?: string[]; // Array of paths to sequential screenshots
}

export interface AnalysisRequest {
  url: string;
  page_group: string;
  company_name: string;
}
