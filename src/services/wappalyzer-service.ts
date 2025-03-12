/**
 * Wappalyzer service for technology detection
 */

import { API_BASE_URL } from "@/config";

interface Technology {
  name: string;
  category: string;
}

export interface WappalyzerResponse {
  technologies: Technology[];
  error?: string;
}

/**
 * Get domain from any URL format
 */
function extractDomain(url: string): string {
  if (!url) {
    return "";
  }

  // Handle URLs that may or may not have protocol
  if (!url.includes("://")) {
    url = "https://" + url;
  }

  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    // If parsing fails, return original input
    return url;
  }
}

/**
 * Generate a likely website URL for a company based on company name
 * This is a fallback in case the OpenAI API doesn't return a website
 */
export function generateWebsiteUrl(companyName: string): string {
  if (!companyName) {
    return "";
  }

  // Convert company name to lowercase, remove special chars, spaces
  const domain = companyName
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\s+/g, "")
    .replace(/[^\w-]/g, "");

  return `https://www.${domain}.com`;
}

export async function analyzeWebsiteTechnologies(websiteUrl: string): Promise<WappalyzerResponse> {
  if (!websiteUrl) {
    return {
      technologies: [],
      error: "No website URL provided",
    };
  }

  try {
    // Extract just the domain for better results
    const domain = extractDomain(websiteUrl);
    if (!domain) {
      return generateMockTechnologies(websiteUrl);
    }

    const apiUrl = `${API_BASE_URL}/analyze-technologies?url=${encodeURIComponent(domain)}`;

    try {
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        return generateMockTechnologies(websiteUrl);
      }

      return data;
    } catch (error) {
      return generateMockTechnologies(websiteUrl);
    }
  } catch (error) {
    return generateMockTechnologies(websiteUrl);
  }
}

/**
 * Generate realistic mock technologies based on the company website
 */
function generateMockTechnologies(websiteUrl: string): WappalyzerResponse {
  const domain = extractDomain(websiteUrl).toLowerCase();

  // Base technologies that most sites would have
  const baseTech = [
    { name: "JavaScript", category: "Programming Languages" },
    { name: "HTML5", category: "Markup Languages" },
    { name: "CSS3", category: "Styling" },
  ];

  // Add more specific technologies based on the domain
  const specificTech: Technology[] = [];

  if (domain.includes("zara")) {
    specificTech.push(
      { name: "React", category: "JavaScript Frameworks" },
      { name: "Webpack", category: "Build Tools" },
      { name: "AWS", category: "Cloud Services" }
    );
  } else if (domain.includes("hm") || domain.includes("h&m")) {
    specificTech.push(
      { name: "Vue.js", category: "JavaScript Frameworks" },
      { name: "Akamai", category: "CDN" },
      { name: "Salesforce Commerce Cloud", category: "E-commerce" }
    );
  } else if (domain.includes("forever21")) {
    specificTech.push(
      { name: "jQuery", category: "JavaScript Libraries" },
      { name: "Bootstrap", category: "UI Frameworks" },
      { name: "Shopify", category: "E-commerce" }
    );
  } else if (domain.includes("americaneagle") || domain.includes("ae")) {
    specificTech.push(
      { name: "Angular", category: "JavaScript Frameworks" },
      { name: "Google Analytics", category: "Analytics" },
      { name: "Adobe Experience Manager", category: "CMS" }
    );
  } else if (domain.includes("levi") || domain.includes("levis")) {
    specificTech.push(
      { name: "Next.js", category: "JavaScript Frameworks" },
      { name: "Contentful", category: "Headless CMS" },
      { name: "Cloudflare", category: "CDN" }
    );
  } else {
    // Generic e-commerce stack for other companies
    specificTech.push(
      { name: "React", category: "JavaScript Frameworks" },
      { name: "Google Tag Manager", category: "Tag Managers" },
      { name: "Magento", category: "E-commerce" }
    );
  }

  return {
    technologies: [...baseTech, ...specificTech],
    error: "Using mock technology data due to API limitations.",
  };
}
