import os
import httpx
from typing import Optional
import json

PAGESPEED_API_KEY = os.getenv("PAGESPEED_API_KEY")

def get_audit_numeric_value(audits: dict, audit_name: str) -> Optional[float]:
    """Safely extract numeric value from audit"""
    try:
        return audits.get(audit_name, {}).get("numericValue")
    except (KeyError, AttributeError, TypeError):
        return None

async def fetch_pagespeed_metrics(url: str, strategy: str) -> dict:
    """Fetch PageSpeed metrics for a given URL"""
    if not PAGESPEED_API_KEY:
        raise ValueError("PageSpeed API key not configured")

    try:
        formatted_url = url if url.startswith(("http://", "https://")) else f"https://{url}"
        category_types = ["PERFORMANCE", "ACCESSIBILITY", "BEST_PRACTICES", "SEO"]
        categories_param = "&".join(f"category={c}" for c in category_types)
        
        api_url = (
            f"https://www.googleapis.com/pagespeedonline/v5/runPagespeed"
            f"?url={formatted_url}"
            f"&{categories_param}"
            f"&strategy={strategy}"
            f"&key={PAGESPEED_API_KEY}"
        )

        # Set timeout to 5 minutes (300 seconds) for PageSpeed API
        timeout = httpx.Timeout(300.0, connect=30.0)
        async with httpx.AsyncClient(timeout=timeout) as client:
            try:
                response = await client.get(api_url)

                if not response.is_success:
                    raise ValueError(f"PageSpeed API error: {response.reason_phrase}")

                data = response.json()

                if "lighthouseResult" not in data:
                    raise ValueError("No Lighthouse result in API response")

                categories = data["lighthouseResult"]["categories"]
                audits = data["lighthouseResult"]["audits"]

                metrics = {
                    "performance": round(categories["performance"]["score"] * 100),
                    "accessibility": round(categories["accessibility"]["score"] * 100),
                    "bestPractices": round(categories["best-practices"]["score"] * 100),
                    "seo": round(categories["seo"]["score"] * 100),
                    "speedIndex": round(audits["speed-index"]["score"] * 100),
                    "largestContentfulPaint": get_audit_numeric_value(audits, "largest-contentful-paint"),
                    "cumulativeLayoutShift": get_audit_numeric_value(audits, "cumulative-layout-shift")
                }

                return metrics

            except httpx.TimeoutException as timeout_error:
                raise ValueError("PageSpeed API timeout: The request took too long to complete. This can happen with complex pages or slow connections. Please try again.") from timeout_error

    except Exception as e:
        raise ValueError(f"Error getting PageSpeed metrics: {str(e)}") 