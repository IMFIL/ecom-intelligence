from typing import Dict
from models.schemas import PageAnalysisResponse, PageGroup
import os
from playwright.async_api import async_playwright
import httpx
from datetime import datetime
from browserbase import Browserbase

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
        print(f"[{datetime.now()}] 🔄 Updated analysis status to {status} for ID: {analysis_id}")
        if error:
            print(f"[{datetime.now()}] ❌ Error details: {error}")

async def run_page_analysis(
    url: str,
    page_group: PageGroup,
    analysis_id: str
) -> None:
    """Run page analysis using Browserbase"""
    try:
        print(f"[{datetime.now()}] 🎬 Starting page analysis for URL: {url}")
        print(f"[{datetime.now()}] 📑 Page group: {page_group}")
        
        # Update status to running
        update_analysis_status(analysis_id, "running")

        # Initialize Browserbase client
        browserbase_api_key = os.getenv("BROWSERBASE_API_KEY")
        browserbase_project_id = os.getenv("BROWSERBASE_PROJECT_ID")

        if not browserbase_api_key or not browserbase_project_id:
            raise ValueError("Missing Browserbase credentials")

        print(f"[{datetime.now()}] 🔑 Initializing Browserbase client...")
        bb = Browserbase(api_key=browserbase_api_key)
        
        print(f"[{datetime.now()}] 🌐 Creating browser session...")
        session = await bb.sessions.create(
            project_id=browserbase_project_id,
            config={
                "stealth_mode": True,  # Enable anti-bot mitigations
                "recording": True,      # Enable session recording
                "logging": True         # Enable session logging
            }
        )
        
        print(f"[{datetime.now()}] ✅ Created Browserbase session: {session.id}")

        live_view_links = bb.sessions.debug(session.id)
        live_view_link = live_view_links.debuggerFullscreenUrl
        print(f"🔍 Live View Link: {live_view_link}")

        # Connect to the session using Playwright
        print(f"[{datetime.now()}] 🎭 Connecting to browser session...")
        async with async_playwright() as p:
            browser = await p.chromium.connect_over_cdp(session.connect_url)
            default_context = browser.contexts[0]
            page = default_context.pages[0]

            if not page:
                raise ValueError("Failed to get browser page")

            print(f"[{datetime.now()}] 🌐 Navigating to URL: {url}")
            # Navigate to the URL
            await page.goto(url, wait_until="networkidle")
            print(f"[{datetime.now()}] ✅ Successfully loaded page")

            # Run appropriate test based on page_group
            print(f"[{datetime.now()}] 🔍 Running analysis for page type: {page_group}")
            match page_group:
                case "PDP":
                    print(f"[{datetime.now()}] 📦 Analyzing product detail page...")
                    await page.wait_for_selector("body")
                    # TODO: Add specific PDP analysis logic
                case "PLP":
                    print(f"[{datetime.now()}] 🗂️  Analyzing product listing page...")
                    await page.wait_for_selector("body")
                    # TODO: Add specific PLP analysis logic
                case "Homepage":
                    print(f"[{datetime.now()}] 🏠 Analyzing homepage...")
                    await page.wait_for_selector("body")
                    # TODO: Add specific Homepage analysis logic
                case "Cart":
                    print(f"[{datetime.now()}] 🛒 Analyzing cart page...")
                    await page.wait_for_selector("body")
                    # TODO: Add specific Cart analysis logic
                case "Checkout":
                    print(f"[{datetime.now()}] 💳 Analyzing checkout flow...")
                    await page.wait_for_selector("body")
                    # TODO: Add specific Checkout analysis logic

            print(f"[{datetime.now()}] 🔒 Closing browser session...")
            # Close the browser
            await browser.close()

        # Update status to completed
        update_analysis_status(analysis_id, "completed")

        print(f"[{datetime.now()}] ✨ Analysis completed successfully:")
        print(f"[{datetime.now()}] 📊 Results:")
        print(f"[{datetime.now()}]   - Analysis ID: {analysis_id}")
        print(f"[{datetime.now()}]   - Session ID: {session.id}")
        print(f"[{datetime.now()}]   - Replay URL: https://browserbase.com/sessions/{session.id}")

    except Exception as error:
        print(f"[{datetime.now()}] 🔥 Error during analysis: {str(error)}")
        update_analysis_status(
            analysis_id,
            "failed",
            str(error) if isinstance(error, Exception) else "Unknown error occurred"
        ) 