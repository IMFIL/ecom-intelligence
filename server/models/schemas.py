from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Dict, Literal
from datetime import datetime

class Technology(BaseModel):
    name: str
    category: str
    grouping: str

class PageSpeedMetrics(BaseModel):
    performance: float
    accessibility: float
    bestPractices: float
    seo: float
    speedIndex: float
    largestContentfulPaint: Optional[float] = None
    cumulativeLayoutShift: Optional[float] = None

PageGroup = Literal["PDP", "PLP", "Homepage", "Cart", "Checkout"]

class PageAnalysisRequest(BaseModel):
    url: str
    page_group: PageGroup
    company_name: str

class PageAnalysisResponse(BaseModel):
    id: str
    status: Literal["pending", "running", "completed", "failed"]
    url: str
    page_group: PageGroup
    company_name: str
    timestamp: datetime
    error: Optional[str] = None

class CompetitorInsight(BaseModel):
    name: str
    description: str
    strengths: List[str]
    weaknesses: List[str]
    threats: List[str]
    website: Optional[str] = None
    revenue: Optional[str] = None

class CompetitorAnalysis(BaseModel):
    companyDescription: str
    competitors: List[CompetitorInsight] 