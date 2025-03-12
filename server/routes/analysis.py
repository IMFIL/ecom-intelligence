from fastapi import APIRouter, HTTPException
from models.schemas import PageAnalysisRequest, PageAnalysisResponse
from services.analysis import analysis_store, run_page_analysis
from datetime import datetime
import uuid

router = APIRouter()

@router.post("/analyze-pages", response_model=PageAnalysisResponse)
async def analyze_pages(request: PageAnalysisRequest):
    """Start page analysis for a given URL"""
    try:
        # Validate required fields
        if not request.url or not request.page_group or not request.competitor_name:
            raise HTTPException(
                status_code=400,
                detail="Missing required parameters. Need url, page_group, and competitor_name"
            )

        # Validate URL format
        try:
            if not request.url.startswith(('http://', 'https://')):
                request.url = f"https://{request.url}"
            # Test URL parsing
            from urllib.parse import urlparse
            urlparse(request.url)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid URL format")

        # Create analysis ID and response object
        analysis_id = str(uuid.uuid4())
        analysis = PageAnalysisResponse(
            id=analysis_id,
            status="pending",
            url=request.url,
            page_group=request.page_group,
            competitor_name=request.competitor_name,
            timestamp=datetime.now()
        )

        # Store the analysis
        analysis_store[analysis_id] = analysis

        # Log the start of analysis
        print("Starting analysis:", {
            "id": analysis_id,
            "url": analysis.url,
            "page_group": request.page_group,
            "competitor_name": request.competitor_name,
        })

        # Start analysis process asynchronously
        await run_page_analysis(request.url, request.page_group, analysis_id)

        return analysis
    except HTTPException:
        raise
    except Exception as e:
        print("Error in analyze-pages endpoint:", e)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/analyze-pages/{analysis_id}", response_model=PageAnalysisResponse)
async def get_analysis(analysis_id: str):
    """Get analysis status"""
    analysis = analysis_store.get(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis 