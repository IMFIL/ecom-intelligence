from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Optional
from models.schemas import Technology, PageSpeedMetrics, CompetitorAnalysis
from services.wappalyzer import analyze_technologies
from services.similarweb import get_website_traffic
from services.pagespeed import fetch_pagespeed_metrics
from services.openai import get_competitor_insights, get_single_competitor_insight
from pathlib import Path
import os

router = APIRouter()

@router.get("/check-screenshots")
async def check_screenshots(url: str = Query(...), page_group: str = Query(...)):
    """Check if screenshots exist for a given URL and page group"""
    try:
        # Get the domain from the URL
        from urllib.parse import urlparse
        domain = urlparse(url).netloc.replace('www.', '')
        
        # Construct the path to check
        screenshots_path = Path("../analysis-server/screenshots")
        domain_path = screenshots_path / domain
        
        if not domain_path.exists():
            return {"exists": False, "path": None}
            
        # Look for files matching the pattern
        files = [f for f in os.listdir(domain_path) 
                if f.startswith(f"{page_group}_") and f.endswith(".jpg") and not f.endswith("_part1.jpg") 
                and not f.endswith("_part2.jpg") and not f.endswith("_part3.jpg")]
        
        if not files:
            return {"exists": False, "path": None}
            
        # Sort files by name (which includes timestamp) to get the latest
        files.sort(reverse=True)
        latest_file = str(domain_path / files[0])
        
        return {
            "exists": True,
            "path": latest_file
        }
        
    except Exception as e:
        print("Error checking screenshots:", str(e))
        raise HTTPException(status_code=500, detail="Failed to check screenshots")

@router.get("/analyze-technologies")
async def analyze_website_technologies(url: str = Query(..., description="Website URL to analyze")):
    """Analyze website technologies using Wappalyzer"""
    if not url:
        return {
            "technologies": [],
            "error": "No website URL provided"
        }

    try:
        result = await analyze_technologies(url)
        return result
    except Exception as e:
        print("Error analyzing website technologies:", str(e))
        return {
            "technologies": [],
            "error": str(e) if isinstance(e, Exception) else "Failed to analyze website technologies"
        }

@router.get("/company-insights")
async def get_company_insights(companyName: str = Query(..., description="Company name to analyze")):
    """Get company insights and analysis"""
    if not companyName:
        raise HTTPException(status_code=400, detail="Company name is required")

    try:
        insights = await get_competitor_insights(companyName)
        return insights
    except Exception as e:
        print("Error getting company insights:", str(e))
        raise HTTPException(status_code=500, detail="Failed to get company insights")

@router.get("/single-company-insight")
async def get_single_company_insight_route(companyName: str = Query(..., description="Company name to analyze")):
    """Get single company insight"""
    if not companyName:
        raise HTTPException(status_code=400, detail="Company name is required")

    try:
        insight = await get_single_competitor_insight(companyName)
        return insight
    except Exception as e:
        print("Error getting single company insight:", str(e))
        raise HTTPException(status_code=500, detail="Failed to get company insight")

@router.get("/traffic")
async def get_traffic_data(url: str = Query(..., description="Website URL to analyze")):
    """Get website traffic data from SimilarWeb"""
    if not url:
        raise HTTPException(status_code=400, detail="Website URL is required")

    try:
        traffic_data = await get_website_traffic(url)
        return traffic_data
    except Exception as e:
        print("Error getting website traffic:", str(e))
        raise HTTPException(status_code=500, detail="Failed to get website traffic data")

@router.get("/pagespeed")
async def get_pagespeed_metrics(
    url: str = Query(..., description="Website URL to analyze"),
    strategy: str = Query(..., description="Analysis strategy (mobile/desktop)")
):
    """Get PageSpeed metrics for a website"""
    if not url:
        raise HTTPException(status_code=400, detail="Website URL is required")

    if not strategy:
        raise HTTPException(status_code=400, detail="Strategy is required")

    try:
        metrics = await fetch_pagespeed_metrics(url, strategy)
        return metrics
    except Exception as e:
        print("Error getting PageSpeed metrics:", str(e))
        raise HTTPException(status_code=500, detail="Failed to get PageSpeed metrics")

