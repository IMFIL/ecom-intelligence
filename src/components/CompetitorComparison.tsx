import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Competitor } from "@/types/competitor";
import { AlertCircle, DollarSign, TrendingUp, Clock, ArrowUp, ArrowDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import LoadingIndicator from "@/components/LoadingIndicator";
import { fetchPageSpeedMetrics } from "@/services/pagespeed-service";

interface CompetitorComparisonProps {
  company: Competitor;
}

interface ComparisonMetric {
  competitorName: string;
  speedIndex?: { value: string | number; difference: number; better: boolean };
  revenue?: { value: string | number; difference?: number; better?: boolean }; // Made difference and better optional
  traffic?: { value: string | number; difference: number; better: boolean };
}

const CompetitorComparison = ({ company }: CompetitorComparisonProps) => {
  const [loading, setLoading] = useState(false);
  const [comparisons, setComparisons] = useState<ComparisonMetric[]>([]);
  const [companyMetrics, setCompanyMetrics] = useState({
    speedIndex: company.speedIndex ? `${company.speedIndex.toFixed(1)}s` : "N/A",
    revenue: company.revenue || "N/A",
    traffic: company.traffic || "N/A",
  });
  // Add a competitors tracking state to detect changes
  const [currentCompetitors, setCurrentCompetitors] = useState<Competitor[]>([]);

  // Calculate percentage difference between competitor and company values
  const calculateDifference = (companyVal: number, competitorVal: number): number => {
    if (companyVal === 0) return competitorVal > 0 ? 100 : 0;
    return Math.round(((competitorVal - companyVal) / companyVal) * 100);
  };

  // Format traffic values properly - show K for thousands when below 1M
  const formatTrafficValue = (value: string | undefined): string => {
    if (!value) return "N/A";

    const numericValue = extractNumericValue(value);

    // If value is less than 1 (meaning less than 1M), convert to thousands format
    if (numericValue < 1 && numericValue > 0) {
      // Convert from millions to thousands (multiply by 1000)
      const inThousands = numericValue * 1000;
      return `${inThousands.toFixed(1)}K`;
    }

    return value;
  };

  // Extract numeric value from strings like "$10M - $50M"
  const extractNumericValue = (value: string | undefined): number => {
    if (!value) return 0;

    const matches = value.match(/(\d+(?:\.\d+)?)/g);
    if (!matches) return 0;

    // If range (e.g., "$10M - $50M"), take average
    if (matches.length > 1) {
      const values = matches.map((m) => parseFloat(m));
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;

      // Apply multiplier based on unit
      if (value.includes("B")) return avg * 1000;
      if (value.includes("M")) return avg;
      if (value.includes("K")) return avg / 1000;
      return avg;
    }

    const numericValue = parseFloat(matches[0]);

    // Check for million (M) or billion (B) indicators
    if (value.includes("B")) return numericValue * 1000;
    if (value.includes("M")) return numericValue;
    if (value.includes("K")) return numericValue / 1000;

    return numericValue;
  };

  // Use a polling mechanism to check if window.competitors has changed
  useEffect(() => {
    const competitors = (window as any).competitors || [];
    setCurrentCompetitors(competitors);
    updateComparisonData();

    const startTime = Date.now();
    const TWO_MINUTES = 2 * 60 * 1000; // 2 minutes in milliseconds

    const interval = setInterval(() => {
      const competitors = (window as any).competitors || [];
      const currentTime = Date.now();

      // Check if all competitors have speed index
      const allHaveSpeedIndex = competitors.every((c: Competitor) => c.speedIndex !== undefined);

      // Check if we've exceeded 2 minutes
      const timeExpired = currentTime - startTime >= TWO_MINUTES;

      setCurrentCompetitors(competitors);
      updateComparisonData();

      // Clear interval if all have speed index or time expired
      if (allHaveSpeedIndex || timeExpired) {
        clearInterval(interval);
      }
    }, 1000); // Check every second

    // Cleanup function
    return () => clearInterval(interval);
  }, [currentCompetitors]);

  // Add this effect to fetch speed index for the main company
  useEffect(() => {
    const fetchMainCompanySpeedIndex = async () => {
      if (!company.website || company.speedIndex !== undefined) {
        return; // Skip if no website or already has speed index
      }

      try {
        const metrics = await fetchPageSpeedMetrics(company.website, "desktop");
        if (metrics?.speedIndex) {
          console.log("Metrics", metrics.speedIndex);
          setCompanyMetrics((prev) => ({
            speedIndex: `${metrics.speedIndex.toFixed(1)}s`,
            revenue: prev.revenue,
            traffic: prev.traffic,
          }));
          updateComparisonData();
        }
      } catch (error) {
        console.error("Error fetching main company speed index:", error);
      }
    };

    fetchMainCompanySpeedIndex();
  }, [company]);

  // Generate comparison metrics from the competitors without API calls
  const updateComparisonData = () => {
    if (!company) return;

    try {
      // Access the competitors from the global variable
      const competitors = (window as any).competitors || [];

      if (competitors.length === 0) {
        return;
      }

      // Extract the company's metrics
      const mainCompanySpeedIndex = company.speedIndex;
      const mainCompanyTraffic = extractNumericValue(company.traffic);

      // Create comparison metrics for each competitor
      const competitorMetrics = competitors.map((competitor: Competitor) => {
        const comparisonMetric: ComparisonMetric = {
          competitorName: competitor.name,
        };

        // Speed Index comparison - use existing data directly
        if (competitor.speedIndex !== undefined) {
          const compSpeedIndex = competitor.speedIndex || 0;

          // Only compare if main company has a speed index
          if (mainCompanySpeedIndex !== undefined) {
            const mainSpeedIndex = mainCompanySpeedIndex || 0;
            const speedDiff = calculateDifference(mainSpeedIndex, compSpeedIndex);

            comparisonMetric.speedIndex = {
              value: competitor.speedIndex ? `${competitor.speedIndex.toFixed(1)}s` : "N/A",
              difference: Math.abs(speedDiff),
              // For speed index, lower is better
              better:
                compSpeedIndex > 0 && mainSpeedIndex > 0 ? compSpeedIndex < mainSpeedIndex : false,
            };
          } else {
            // Still show speed index without comparison
            comparisonMetric.speedIndex = {
              value: competitor.speedIndex ? `${competitor.speedIndex.toFixed(1)}s` : "N/A",
              difference: 0,
              better: false,
            };
          }
        }

        // Revenue display without comparison
        if (competitor.revenue) {
          const formattedRevenue = competitor.revenue;
          comparisonMetric.revenue = {
            value: formattedRevenue,
            // No difference or better/worse indicators for revenue
          };
        }

        // Traffic comparison - format values below 1M as K
        if (competitor.traffic) {
          const compValue = extractNumericValue(competitor.traffic);
          const formattedTraffic = formatTrafficValue(competitor.traffic);

          if (company.traffic && mainCompanyTraffic > 0) {
            const diff = calculateDifference(mainCompanyTraffic, compValue);
            comparisonMetric.traffic = {
              value: formattedTraffic,
              difference: Math.abs(diff),
              // Change the logic: competitor having higher traffic is BAD (not better)
              better: compValue < mainCompanyTraffic,
            };
          } else {
            // Show traffic without comparison if main company doesn't have traffic data
            comparisonMetric.traffic = {
              value: formattedTraffic,
              difference: 0,
              better: false,
            };
          }
        }

        return comparisonMetric;
      });

      setComparisons(competitorMetrics);
    } catch (error) {
      console.error("Error processing comparison data:", error);
    }
  };

  const renderComparisonIndicator = (
    metric: { difference: number; better: boolean } | undefined,
    inverted = false,
    hasMainValue = true
  ) => {
    if (!metric || !hasMainValue || metric.difference === 0) return null;

    // For traffic, we consider lower competitor traffic better for the main company
    // So we use the metric.better directly which is already configured correctly above
    const isPositive = metric.better;

    return (
      <span
        className={`ml-2 text-xs font-medium flex items-center ${
          isPositive ? "text-green-500" : "text-red-500"
        }`}
      >
        {isPositive ? (
          <>
            <ArrowDown className="h-3 w-3 mr-0.5" />-{metric.difference}%
          </>
        ) : (
          <>
            <ArrowUp className="h-3 w-3 mr-0.5" />+{metric.difference}%
          </>
        )}
      </span>
    );
  };

  return (
    <Card className="p-6 mt-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Market Analysis</h2>
      <div className="text-sm text-gray-500 mb-6">
        See how {company.name}'s metrics compare to competitors. For Speed Index, lower values are
        better. For Revenue and Traffic, higher values are better.
      </div>

      {loading ? (
        <div className="w-full flex justify-center py-8">
          <LoadingIndicator message="Processing market data..." />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px] bg-gray-50">Competitor</TableHead>
                    <TableHead className="bg-gray-50">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-[#9b87f5] mr-2" />
                        Speed Index
                      </div>
                    </TableHead>
                    <TableHead className="bg-gray-50">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-blue-500 mr-2" />
                        Revenue
                      </div>
                    </TableHead>
                    <TableHead className="bg-gray-50">
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
                        Traffic
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Your company row */}
                  <TableRow className="bg-gray-50">
                    <TableCell className="font-medium">{company.name} (Your Company)</TableCell>
                    <TableCell>{companyMetrics.speedIndex}</TableCell>
                    <TableCell>{companyMetrics.revenue}</TableCell>
                    <TableCell>{companyMetrics.traffic}</TableCell>
                  </TableRow>

                  {/* Competitor rows */}
                  {comparisons.map((comp, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{comp.competitorName}</TableCell>
                      <TableCell>
                        {comp.speedIndex ? (
                          <div className="flex items-center">
                            {comp.speedIndex.value}
                            {renderComparisonIndicator(comp.speedIndex, true, !!company.speedIndex)}
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                      <TableCell>
                        {comp.revenue ? (
                          <div className="flex items-center whitespace-nowrap">
                            {comp.revenue.value}
                            {/* Revenue comparison indicator removed */}
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                      <TableCell>
                        {comp.traffic ? (
                          <div className="flex items-center whitespace-nowrap">
                            {comp.traffic.value}
                            {renderComparisonIndicator(comp.traffic, false, !!company.traffic)}
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}

                  {comparisons.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                        No competitor data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default CompetitorComparison;
