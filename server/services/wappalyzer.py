import os
import httpx
from typing import Dict, List, Set
from models.schemas import Technology

WAPPALYZER_API_KEY = os.getenv("WAPPALYZER_API_KEY")

# Define relevant categories and category to group mapping
RELEVANT_CATEGORIES: Set[str] = {
    "Programming Languages",
    "JavaScript Frameworks",
    "Web Frameworks",
    "Web Servers",
    "Databases",
    "CDN",
    "Analytics",
    "E-commerce",
    "CMS",
    "Tag Managers",
    "UI Frameworks",
    "JavaScript Libraries",
    "Headless CMS",
    "Cloud Services",
    "Build Tools",
    "Styling"
}

CATEGORY_TO_GROUP_MAP = {
    "Programming Languages": "Core Technologies",
    "JavaScript Frameworks": "Frontend",
    "Web Frameworks": "Backend",
    "Web Servers": "Infrastructure",
    "Databases": "Infrastructure",
    "CDN": "Infrastructure",
    "Analytics": "Marketing",
    "E-commerce": "E-commerce",
    "CMS": "Content",
    "Tag Managers": "Marketing",
    "UI Frameworks": "Frontend",
    "JavaScript Libraries": "Frontend",
    "Headless CMS": "Content",
    "Cloud Services": "Infrastructure",
    "Build Tools": "Development",
    "Styling": "Frontend"
}

def extract_domain(url: str) -> str:
    """Extract domain from URL"""
    if not url:
        return ""

    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    try:
        from urllib.parse import urlparse
        return urlparse(url).netloc
    except Exception:
        return url

def get_category_group(category: str) -> str:
    """Get the group for a given category"""
    return CATEGORY_TO_GROUP_MAP.get(category, "Other")

async def analyze_technologies(url: str) -> Dict:
    """Analyze website technologies using Wappalyzer API"""
    if not WAPPALYZER_API_KEY:
        raise ValueError("Wappalyzer API key not configured")

    domain = extract_domain(url)
    if not domain:
        raise ValueError("Invalid domain")

    try:
        api_url = f"https://api.wappalyzer.com/v2/lookup/?urls=https://{domain}"
        headers = {
            "x-api-key": WAPPALYZER_API_KEY,
            "Accept": "application/json"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(api_url, headers=headers)

            if response.status_code == 403:
                raise ValueError("Invalid API key or quota exceeded")

            if response.status_code != 200:
                error_text = response.text
                print("Wappalyzer API error response:", error_text)
                raise ValueError(f"Wappalyzer API error: {response.status_code} {response.reason_phrase}")

            data = response.json()

            # Filter and group technologies
            technologies = []
            if data and len(data) > 0 and "technologies" in data[0]:
                for tech in data[0]["technologies"]:
                    # Only include tech if at least one of its categories is relevant
                    relevant_category = None
                    for cat in tech.get("categories", []):
                        if cat.get("name") in RELEVANT_CATEGORIES:
                            relevant_category = cat["name"]
                            break

                    if relevant_category:
                        technologies.append({
                            "name": tech["name"],
                            "category": relevant_category,
                            "grouping": get_category_group(relevant_category)
                        })

            return {"technologies": technologies}

    except Exception as e:
        return {
            "technologies": [],
            "error": f"Error analyzing technologies: {str(e)}"
        } 