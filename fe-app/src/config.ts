// API configuration
export const API_BASE_URL = window.location.origin.includes("localhost")
  ? "http://localhost:3001/api"
  : "/api"; // In production, use relative path
