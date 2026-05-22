import os
import httpx
from typing import List, Optional
from dotenv import load_dotenv
from models.schemas import Job

load_dotenv()

ADZUNA_APP_ID = os.getenv("ADZUNA_APP_ID", "")
ADZUNA_APP_KEY = os.getenv("ADZUNA_APP_KEY", "")
ADZUNA_BASE_URL = "https://api.adzuna.com/v1/api/jobs"
ADZUNA_COUNTRY = "us"  # Default country, can be made configurable


def build_query(skills: Optional[List[str]] = None, cv_text: Optional[str] = None, query: Optional[str] = None) -> str:
    """Build a search query string from available inputs."""
    if query:
        return query
    if skills and len(skills) > 0:
        top_skills = skills[:3]
        return " ".join(top_skills)
    if cv_text:
        first_line = cv_text.strip().split("\n")[0][:100]
        return first_line or "software developer"
    return "software developer entry level"


def map_employment_type(contract_type: Optional[str]) -> Optional[str]:
    """Map Adzuna contract types to standard employment types."""
    if not contract_type:
        return None
    type_map = {
        "full_time": "FULLTIME",
        "part_time": "PARTTIME",
        "contract": "CONTRACTOR",
        "permanent": "FULLTIME",
        "temporary": "CONTRACTOR",
    }
    return type_map.get(contract_type.lower().replace(" ", "_"), "FULLTIME")


async def search_jobs(
    skills: Optional[List[str]] = None,
    cv_text: Optional[str] = None,
    location: Optional[str] = None,
    job_type: Optional[str] = None,
    query: Optional[str] = None,
    num_pages: int = 1,
) -> List[Job]:
    """Search Adzuna API for jobs."""
    search_query = build_query(skills=skills, cv_text=cv_text, query=query)
    
    results_per_page = 20
    jobs = []
    
    for page in range(1, num_pages + 1):
        params = {
            "app_id": ADZUNA_APP_ID,
            "app_key": ADZUNA_APP_KEY,
            "results_per_page": results_per_page,
            "what": search_query,
        }
        
        if location:
            params["where"] = location
        
        url = f"{ADZUNA_BASE_URL}/{ADZUNA_COUNTRY}/search/{page}"
        print(f"Adzuna Request: {url}")
        print(f"Adzuna Params: {params}")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, params=params)
            if response.status_code != 200:
                print(f"Adzuna API Error: {response.status_code}")
                print(f"Response: {response.text[:500]}")
                raise Exception(f"Adzuna API returned {response.status_code}")
            data = response.json()
        
        for item in data.get("results", []):
            try:
                location_display = item.get("location", {}).get("display_name", "")
                location_parts = location_display.split(", ") if location_display else []
                
                job = Job(
                    job_id=str(item.get("id", "")),
                    job_title=item.get("title", ""),
                    employer_name=item.get("company", {}).get("display_name", ""),
                    job_city=location_parts[0] if len(location_parts) > 0 else None,
                    job_country=location_parts[-1] if len(location_parts) > 1 else ADZUNA_COUNTRY.upper(),
                    job_employment_type=map_employment_type(item.get("contract_type")),
                    job_min_salary=item.get("salary_min"),
                    job_max_salary=item.get("salary_max"),
                    job_salary_currency="USD",  # Adzuna US returns USD
                    job_description=item.get("description", ""),
                    job_apply_link=item.get("redirect_url", "#"),
                    job_posted_at_datetime_utc=item.get("created"),
                    employer_logo=item.get("company", {}).get("__CLASS__"),
                    job_publisher="Adzuna",
                )
                jobs.append(job)
            except Exception as e:
                print(f"Job parse error: {e}")
                continue
    
    return jobs
