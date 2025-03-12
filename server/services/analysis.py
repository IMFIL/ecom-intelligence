from typing import Dict
from models.schemas import PageAnalysisResponse, PageGroup
import os
from playwright.async_api import async_playwright
import httpx

# In-memory store for analysis results
analysis_store: Dict[str, PageAnalysisResponse] = {}

def update_analysis_status(
    analysis_id: str,
    status: str,
    error: str | None = None
) -> None:
    """Update the status of an ongoing analysis"""
    analysis = analysis_store.get(analysis_id)
    if analysis:
        analysis.status = status
        if error:
            analysis.error = error
        analysis_store[analysis_id] = analysis

async def run_page_analysis(
    url: str,
    page_group: PageGroup,
    analysis_id: str
) -> None:
    """Run page analysis using Browserbase"""
    try:
        # Update status to running
        update_analysis_status(analysis_id, "running")

        # Create a new Browserbase session
        browserbase_api_key = os.getenv("BROWSERBASE_API_KEY")
        browserbase_project_id = os.getenv("BROWSERBASE_PROJECT_ID")

        if not browserbase_api_key or not browserbase_project_id:
            raise ValueError("Missing Browserbase credentials")

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.browserbase.com/v1/sessions",
                headers={"Authorization": f"Bearer {browserbase_api_key}"},
                json={"projectId": browserbase_project_id}
            )
            
            if response.status_code != 200:
                raise ValueError(f"Failed to create Browserbase session: {response.text}")
            
            session = response.json()
            print("Created Browserbase session:", session["id"])

            # Connect to the session using Playwright
            async with async_playwright() as p:
                browser = await p.chromium.connect_over_cdp(session["connectUrl"])
                default_context = browser.contexts[0]
                page = default_context.pages[0]

                if not page:
                    raise ValueError("Failed to get browser page")

                # Navigate to the URL
                await page.goto(url, wait_until="networkidle")

                # Run appropriate test based on page_group
                match page_group:
                    case "PDP":
                        # Product detail page analysis
                        await page.wait_for_selector("body")
                        # TODO: Add specific PDP analysis logic
                    case "PLP":
                        # Product listing page analysis
                        await page.wait_for_selector("body")
                        # TODO: Add specific PLP analysis logic
                    case "Homepage":
                        # Homepage analysis
                        await page.wait_for_selector("body")
                        # TODO: Add specific Homepage analysis logic
                    case "Cart":
                        # Cart page analysis
                        await page.wait_for_selector("body")
                        # TODO: Add specific Cart analysis logic
                    case "Checkout":
                        # Checkout flow analysis
                        await page.wait_for_selector("body")
                        # TODO: Add specific Checkout analysis logic

                # Close the browser
                await browser.close()

        # Update status to completed
        update_analysis_status(analysis_id, "completed")

        print("Analysis completed:", {
            "id": analysis_id,
            "sessionId": session["id"],
            "replayUrl": f"https://browserbase.com/sessions/{session['id']}"
        })

    except Exception as error:
        print("Error during analysis:", error)
        update_analysis_status(
            analysis_id,
            "failed",
            str(error) if isinstance(error, Exception) else "Unknown error occurred"
        ) 