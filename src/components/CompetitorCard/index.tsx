
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import CompetitorHeader from "./CompetitorHeader";
import StrengthWeakness from "./StrengthWeakness";
import BusinessMetrics from "./BusinessMetrics";
import TechnologySection from "./TechnologySection";
import PerformanceSection from "./PerformanceSection";
import { fetchPageSpeedMetrics } from "@/services/pagespeed-service";
import { Competitor } from "@/types/competitor";

// Global cache for performance metrics to persist between tab switches
const metricsCache = new Map<
  string,
  {
    mobile: PageSpeedMetrics | null;
    desktop: PageSpeedMetrics | null;
  }
>();

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

interface CompetitorCardProps {
  competitor: Competitor;
  mainCompany?: Competitor | null;
}

const CompetitorCard = ({ competitor, mainCompany }: CompetitorCardProps) => {
  const cacheKey = `${competitor.name}-${competitor.website || ""}`;

  const [performanceMetrics, setPerformanceMetrics] = useState<{
    mobile: PageSpeedMetrics | null;
    desktop: PageSpeedMetrics | null;
  }>(() => {
    // Initialize from cache if available
    return metricsCache.get(cacheKey) || { mobile: null, desktop: null };
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [strategy, setStrategy] = useState<"mobile" | "desktop">("desktop");
  const [expanded, setExpanded] = useState<boolean>(false);

  const fetchMetrics = async (deviceStrategy: "mobile" | "desktop") => {
    if (!competitor.website) {
      console.log(`No website for ${competitor.name}`);
      return;
    }

    // Check if we already have data or attempted to fetch for this strategy
    if (performanceMetrics[deviceStrategy]) {
      console.log(
        `Already have data for ${performanceMetrics[deviceStrategy]} metrics for ${competitor.name}`
      );
      return;
    }

    setLoading(true);
    try {
      console.log(`Fetching ${deviceStrategy} metrics for ${competitor.name}`);
      const metrics = await fetchPageSpeedMetrics(competitor.website, deviceStrategy);

      const updatedMetrics = {
        ...performanceMetrics,
        [deviceStrategy]: metrics,
      };

      // Update both state and cache
      setPerformanceMetrics(updatedMetrics);
      metricsCache.set(cacheKey, updatedMetrics);
    } catch (error) {
      console.error(`Error fetching ${deviceStrategy} performance metrics:`, error);

      // Update metrics with null to indicate error
      const updatedMetrics = {
        ...performanceMetrics,
        [deviceStrategy]: null,
      };

      setPerformanceMetrics(updatedMetrics);
      metricsCache.set(cacheKey, updatedMetrics);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if we haven't tried before
    if (performanceMetrics[strategy] === undefined || performanceMetrics[strategy] === null) {
      fetchMetrics(strategy);
    }
  }, [competitor.website, strategy]);

  const handleStrategyChange = (newStrategy: "mobile" | "desktop") => {
    setStrategy(newStrategy);

    // Force a refresh if there was an error before
    if (performanceMetrics[newStrategy] === null) {
      // Reset the cache for this strategy to force a new fetch
      const updatedMetrics = {
        ...performanceMetrics,
        [newStrategy]: undefined,
      };
      setPerformanceMetrics(updatedMetrics);
      metricsCache.set(cacheKey, updatedMetrics);

      // Fetch the metrics again
      fetchMetrics(newStrategy);
    }
  };

  const currentMetrics = performanceMetrics[strategy];

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <Card className="p-6 bg-white hover:shadow-md transition-shadow duration-300">
      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-start">
          <CompetitorHeader
            name={competitor.name}
            description={competitor.description}
            website={competitor.website}
          />
          <Button
            variant="outline"
            onClick={toggleExpand}
            className="text-sm shrink-0 ml-2"
            aria-label={expanded ? "Show less details" : "Show more details"}
          >
            {expanded ? "Details ↑" : "Details ↓"}
          </Button>
        </div>

        {/* Always show condensed business metrics (without threats) */}
        <BusinessMetrics
          revenue={competitor.revenue}
          traffic={competitor.traffic}
          threats={expanded ? competitor.threats : undefined}
          mainCompany={mainCompany}
        />

        {expanded && (
          <>
            <Separator className="my-1" />

            <StrengthWeakness
              strengths={competitor.strengths}
              weaknesses={competitor.weaknesses}
              mainCompany={mainCompany}
            />

            {competitor.website && (
              <>
                <Separator className="my-1" />
                <PerformanceSection
                  metrics={currentMetrics}
                  loading={loading}
                  onStrategyChange={handleStrategyChange}
                  mainCompanyMetrics={
                    mainCompany && mainCompany.website ? performanceMetrics[strategy] : null
                  }
                />
                
                {/* Always show the technology section, regardless of performance metrics */}
                <Separator className="my-1" />
                <TechnologySection
                  technologies={competitor.technologies}
                  mainCompanyTechnologies={mainCompany?.technologies}
                />
              </>
            )}

            {!competitor.website && competitor.technologies && competitor.technologies.length > 0 && (
              <>
                <Separator className="my-1" />
                <TechnologySection
                  technologies={competitor.technologies}
                  mainCompanyTechnologies={mainCompany?.technologies}
                />
              </>
            )}
          </>
        )}
      </div>
    </Card>
  );
};

export default CompetitorCard;
