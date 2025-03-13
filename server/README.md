# Compete Insight Hub API (Python Server)

This FastAPI server provides various endpoints for competitor analysis, technology stack detection, and performance metrics.

## Setup

1. Create a virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file with the following variables:

   ```
   PORT=3001
   OPENAI_API_KEY=your_openai_api_key
   SIMILARWEB_API_KEY=your_similarweb_api_key
   PAGESPEED_API_KEY=your_pagespeed_api_key
   ```

4. Start the server:
   ```bash
   python main.py
   ```

The server will start on port 3001 by default.

## API Endpoints

### Analysis

#### POST `/api/analyze-pages`

Forward page analysis requests to the Node.js analysis server.

**Request Body:**

```json
{
  "url": "string",
  "page_group": "string",
  "company_name": "string"
}
```

### Screenshots

#### GET `/api/check-screenshots`

Check if screenshots exist for a given URL and page group.

**Query Parameters:**

- `url`: Website URL
- `page_group`: Type of page (e.g., "PDP")

**Response:**

```json
{
  "exists": boolean,
  "path": string | null
}
```

### Technology Analysis

#### GET `/api/analyze-technologies`

Analyze website technologies using Wappalyzer.

**Query Parameters:**

- `url`: Website URL to analyze

### Company Insights

#### GET `/api/company-insights`

Get comprehensive company insights and analysis.

**Query Parameters:**

- `companyName`: Company name to analyze

#### GET `/api/single-company-insight`

Get a single company insight.

**Query Parameters:**

- `companyName`: Company name to analyze

### Traffic Analysis

#### GET `/api/traffic`

Get website traffic data from SimilarWeb.

**Query Parameters:**

- `url`: Website URL to analyze

### Performance Metrics

#### GET `/api/pagespeed`

Get PageSpeed metrics for a website.

**Query Parameters:**

- `url`: Website URL to analyze
- `strategy`: Analysis strategy ("mobile" or "desktop")

## Static Files

The server mounts the screenshots directory from the analysis-server at `/api/screenshots` for easy access to generated screenshots.

## CORS

CORS is enabled for all origins in development. In production, you should specify allowed origins in the `main.py` file.

## Error Handling

All endpoints include proper error handling and will return appropriate HTTP status codes and error messages when issues occur.

## Dependencies

- FastAPI
- Uvicorn
- httpx
- python-dotenv
- Other dependencies listed in `requirements.txt`
