from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from datetime import datetime
from fastapi.staticfiles import StaticFiles
from pathlib import Path

# Load environment variables
load_dotenv()

# Import routers
from routes.analysis import router as analysis_router
from routes.search import router as search_router

# Create FastAPI app
app = FastAPI(title="Compete Insight Hub API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the screenshots directory from the analysis-server
screenshots_path = Path("../analysis-server/screenshots")
app.mount("/api/screenshots", StaticFiles(directory=str(screenshots_path)), name="screenshots")

# Include routers
app.include_router(analysis_router, prefix="/api")
app.include_router(search_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "3001"))
    print(f"[{datetime.now()}] 🚀 Starting server on port {port}")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True) 