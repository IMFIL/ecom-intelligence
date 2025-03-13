import os
from openai import AsyncOpenAI
from typing import Dict, Any

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def clean_json_response(json_string: str) -> str:
    """Cleans JSON string that might be wrapped in markdown code blocks"""
    return json_string.replace("```json", "").replace("```", "").strip()

async def get_competitor_insights(company_name: str) -> Dict[str, Any]:
    """Get competitor insights using OpenAI API"""
    if not os.getenv("OPENAI_API_KEY"):
        raise ValueError("OpenAI API key not configured")

    try:
        prompt = f"""
You are an expert market research analyst providing insights about "{company_name}" and its main competitors. 
Include 5-10 of the main competitors of {company_name}. For each competitor, include their official website URL and estimated annual revenue if available.
Ensure the JSON is valid and properly formatted. Only return the JSON object, no additional text. 
Ensure that the website URL is the ecommerce where shoppers can buy products.

Format your response as a JSON object with the following structure:

{{
  "companyDescription": "A brief 2-3 sentence description of {company_name}",
  "competitors": [
    {{
      "name": "Competitor 1 Name",
      "description": "Brief description of this competitor",
      "strengths": ["Key strength 1", "Key strength 2", "Key strength 3"],
      "weaknesses": ["Key weakness 1", "Key weakness 2"],
      "threats": ["Major threat 1", "Major threat 2"],
      "website": "https://www.competitor1.com",
      "revenue": "Estimated annual revenue (e.g., $10M - $50M)"
    }},
    {{
      "name": "Competitor 2 Name",
      "description": "Brief description of this competitor",
      "strengths": ["Key strength 1", "Key strength 2", "Key strength 3"],
      "weaknesses": ["Key weakness 1", "Key weakness 2"],
      "threats": ["Major threat 1", "Major threat 2"],
      "website": "https://www.competitor2.com",
      "revenue": "Estimated annual revenue (e.g., $10M - $50M)"
    }}
  ]
}}

If you cannot estimate the revenue for a specific competitor, you may omit the "revenue" field for that competitor."""

        response = await client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=2500
        )

        content = response.choices[0].message.content
        cleaned_content = clean_json_response(content)
        return eval(cleaned_content)

    except Exception as e:
        raise ValueError(f"OpenAI API error: {str(e)}")

async def get_single_competitor_insight(company_name: str) -> Dict[str, Any]:
    """Get insights for a single specified competitor"""
    if not os.getenv("OPENAI_API_KEY"):
        raise ValueError("OpenAI API key not configured")

    try:
        prompt = f"""
You are an expert market research analyst. Provide detailed insights about "{company_name}". 
Include the official website URL for {company_name} and estimated annual revenue if available.
Ensure the JSON is valid and properly formatted. Only return the JSON object with no additional text.
Ensure that the website URL is the ecommerce where shoppers can buy products.

Format your response as a JSON object with the following structure:

{{
  "name": "{company_name}",
  "description": "Brief description of this company",
  "strengths": ["Key strength 1", "Key strength 2", "Key strength 3"],
  "weaknesses": ["Key weakness 1", "Key weakness 2"],
  "threats": ["Major threat 1", "Major threat 2"],
  "website": "https://www.example.com",
  "revenue": "Estimated annual revenue (e.g., $10M - $50M)"
}}

If you cannot estimate the revenue, you may omit the "revenue" field."""

        response = await client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=1000
        )

        content = response.choices[0].message.content
        cleaned_content = clean_json_response(content)
        return eval(cleaned_content)

    except Exception as e:
        raise ValueError(f"OpenAI API error: {str(e)}") 