from fastapi import APIRouter, HTTPException
from models.schemas import PageAnalysisRequest, PageAnalysisResponse
from datetime import datetime
import httpx
import os

router = APIRouter()

NODEJS_ANALYSIS_SERVER = "http://localhost:3002"

@router.post("/analyze-pages", response_model=str)
async def analyze_pages(request: PageAnalysisRequest):
    """Forward page analysis request to Node.js server"""
    try:
        print(f"[{datetime.now()}] 📥 Received analysis request for URL: {request.url}")
        print(f"[{datetime.now()}] 📋 Request details: {request.dict()}")

        # Forward request to Node.js server
        async with httpx.AsyncClient(timeout=600.0) as client:  # 10 minutes timeout
            response = await client.post(
                f"{NODEJS_ANALYSIS_SERVER}/api/analyze-pages",
                json={
                    "url": request.url,
                    "page_group": request.page_group,
                    "company_name": request.company_name
                }
            )

            if response.status_code != 200:
                error_text = response.text
                print(f"[{datetime.now()}] ❌ Node.js server error: {error_text}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=error_text
                )
            
            print(f"[{datetime.now()}] 📦 Node.js server response: {response.json()}")
            return response.json()

    except httpx.RequestError as e:
        print(f"[{datetime.now()}] 🔥 Error connecting to Node.js server: {str(e)}")
        raise HTTPException(
            status_code=503,
            detail="Analysis service unavailable"
        )
    except Exception as e:
        print(f"[{datetime.now()}] 🔥 Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )