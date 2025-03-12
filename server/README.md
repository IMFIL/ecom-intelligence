# Compete Insight Hub Server (Python)

This is the Python backend server for the Compete Insight Hub application, built with FastAPI. The server provides a complete API for competitor analysis, technology detection, and performance metrics.

## Setup

1. Create a virtual environment and activate it:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Install Playwright browsers (required for page analysis):

```bash
playwright install
```

4. Create a `.env` file in the server directory with your API keys (see Environment Variables section below).

## Running the Server

Development mode (with auto-reload):

```bash
uvicorn main:app --reload --port 3001
```

Production mode:

```bash
uvicorn main:app --host 0.0.0.0 --port 3001
```

## API Documentation

Once the server is running, you can access the interactive API documentation at:

- Swagger UI: http://localhost:3001/docs
- ReDoc: http://localhost:3001/redoc

## API Endpoints

### Search Routes

- `GET /api/analyze-technologies`: Analyze website technologies using Wappalyzer
- `GET /api/company-insights`: Get company insights and competitor analysis
- `GET /api/single-company-insight`: Get insights for a single company
- `GET /api/traffic`: Get website traffic data from SimilarWeb
- `GET /api/pagespeed`: Get PageSpeed metrics for a website

### Analysis Routes

- `POST /api/analyze-pages`: Start page analysis for a given URL
- `GET /api/analyze-pages/{analysis_id}`: Get status of a page analysis

## Project Structure

```
server-python/
├── main.py           # FastAPI application entry point
├── requirements.txt  # Python dependencies
├── models/          # Pydantic models and schemas
│   └── schemas.py   # Data models and type definitions
├── routes/          # API route handlers
│   ├── search.py    # Search-related endpoints
│   └── analysis.py  # Analysis-related endpoints
└── services/        # Business logic and external service integrations
    ├── analysis.py  # Page analysis using Browserbase
    ├── openai.py    # OpenAI integration for insights
    ├── pagespeed.py # Google PageSpeed integration
    ├── similarweb.py # SimilarWeb traffic analysis
    └── wappalyzer.py # Technology detection
```

## Environment Variables

The following environment variables must be set in your `.env` file:

```
# API Keys
WAPPALYZER_API_KEY=your_wappalyzer_api_key
PAGESPEED_API_KEY=your_pagespeed_api_key
OPENAI_API_KEY=your_openai_api_key
SIMILARWEB_API_KEY=your_similarweb_api_key
BROWSERBASE_API_KEY=your_browserbase_api_key
BROWSERBASE_PROJECT_ID=your_browserbase_project_id

# Server Configuration
PORT=3001
NODE_ENV=development
```

## Transitioning from Node.js Server

This Python server maintains exact feature parity with the original Node.js server. All endpoints, request/response formats, and functionality match the Node.js implementation exactly.

You can run both servers simultaneously during the transition period by:

1. Running the Node.js server on port 3001 (default)
2. Running this Python server on a different port (e.g., 3002)
3. Updating your frontend API configuration to point to the desired server

Once you're confident in the Python server's functionality, you can switch over completely by updating the frontend to use the Python server's endpoint.
