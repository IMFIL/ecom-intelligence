import { getSingleCompanyInsight, getCompanyInsights } from "./openai-service";
import { analyzeWebsiteTechnologies } from "./wappalyzer-service";
import { getWebsiteTraffic } from "./similarweb-service";
import { Competitor, CompanyData } from "@/types/competitor";

/**
 * Fetch and process competitor data with additional website technology information
 */
export async function fetchCompanyWithEnhancements(competitor: Competitor): Promise<Competitor> {
  try {
    const websiteUrl = competitor.website;
    if (websiteUrl) {
      // Analyze technologies
      const techData = await analyzeWebsiteTechnologies(websiteUrl);

      // Get traffic data
      const trafficData = await getWebsiteTraffic(websiteUrl);

      return {
        ...competitor,
        technologies: techData.technologies.map((tech) => ({
          name: tech.name,
          category: tech.category,
        })),
        traffic: trafficData.pageViews,
      };
    } else {
      console.warn(`No website URL available for ${competitor.name}`);
      return competitor;
    }
  } catch (error) {
    console.error(`Error fetching data for ${competitor.name}:`, error);
    return competitor;
  }
}

/**
 * Analyze a company and its competitors with enhanced data
 * Now optimized for parallel execution
 */
export async function analyzeCompanyAndCompetitors(
  companyName: string,
  initialData?: CompanyData
): Promise<CompanyData> {
  // Get insights about competitors
  const insights = await getCompanyInsights(companyName);

  // Process all competitors from the insights
  const competitorPromises = insights.competitors
    .filter((competitor) => competitor.name.toLowerCase() !== companyName.toLowerCase())
    .map(async (competitor: Competitor) => {
      return await fetchCompanyWithEnhancements(competitor);
    });

  // Await all competitor data fetches
  const newCompetitors = await Promise.all(competitorPromises);

  // Combine competitors
  const competitorsList = [...(newCompetitors.filter(Boolean) as Competitor[])];

  return {
    description: insights.companyDescription || initialData?.description || "",
    mainCompany: initialData?.mainCompany || null,
    competitors: competitorsList || [],
  };
}

/**
 * Get a single competitor with enhanced data
 */
export async function fetchSingleCompanyInsight(companyName: string) {
  const competitorData = await getSingleCompanyInsight(companyName);
  return competitorData;
}
