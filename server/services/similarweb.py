import os
import re
from urllib.parse import urlparse
from datetime import datetime, timedelta
import httpx

SIMILARWEB_API_KEY = os.getenv("SIMILARWEB_API_KEY")

def format_traffic_number(visits: int) -> str:
    """Format traffic number to human readable format"""
    if visits >= 1_000_000:
        return f"{round(visits / 1_000_000, 1)}M"
    elif visits >= 1_000:
        return f"{round(visits / 1_000, 1)}K"
    return str(visits)

def get_root_domain(url: str) -> str:
    """Extract root domain from URL without www prefix"""
    domain = urlparse(url).netloc
    # Remove www. prefix if present
    domain = re.sub(r'^www\.', '', domain)
    return domain

def get_date_range() -> tuple[str, str]:
    """Get start and end dates for the API request (last month)"""
    today = datetime.now()
    # Get first day of previous month
    first_day = (today.replace(day=1) - timedelta(days=1)).replace(day=1)
    # Get last day of previous month
    last_day = today.replace(day=1) - timedelta(days=1)
    return first_day.strftime("%Y-%m"), last_day.strftime("%Y-%m")

async def get_website_traffic(website_url: str) -> dict:
    """Get website traffic data from SimilarWeb API"""
    if not SIMILARWEB_API_KEY:
        raise ValueError("SimilarWeb API key not configured")

    try:
        domain = get_root_domain(website_url)
        api_url = f"https://api.similarweb.com/v1/website/{domain}/total-traffic-and-engagement/visits"
        
        start_date, end_date = get_date_range()
        params = {
            "api_key": SIMILARWEB_API_KEY,
            "granularity": "monthly",
            "start_date": start_date,
            "end_date": end_date
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(api_url, params=params)

            if not response.is_success:
                raise ValueError(f"SimilarWeb API error: {response.reason_phrase}")

            data = response.json()
            if not data.get("visits"):
                raise ValueError("No traffic data available for this website")

            monthly_visits = data["visits"][-1]["visits"]  # Get the most recent month's visits
            return {
                "visits": format_traffic_number(monthly_visits),
                "monthlyVisits": monthly_visits
            }

    except Exception as e:
        raise ValueError(f"Error getting website traffic: {str(e)}") 