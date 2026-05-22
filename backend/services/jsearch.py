import os
import httpx
from typing import List, Optional
from dotenv import load_dotenv
from models.schemas import Job

load_dotenv()

JSEARCH_API_KEY = os.getenv("JSEARCH_API_KEY", "")
JSEARCH_BASE_URL = "https://jsearch.p.rapidapi.com"


def build_query(skills: Optional[List[str]] = None, cv_text: Optional[str] = None, query: Optional[str] = None) -> str:
    """Build a search query string from available inputs."""
    if query:
        return query
    if skills and len(skills) > 0:
        # Use top skills as search query
        top_skills = skills[:3]
        return " ".join(top_skills) + " developer"
    if cv_text:
        # Extract first line or first 100 chars as rough query
        first_line = cv_text.strip().split("\n")[0][:100]
        return first_line or "software developer"
    return "software developer entry level"


async def search_jobs(
    skills: Optional[List[str]] = None,
    cv_text: Optional[str] = None,
    location: Optional[str] = None,
    job_type: Optional[str] = None,
    query: Optional[str] = None,
    num_pages: int = 2,
) -> List[Job]:
    """Search JSearch API for jobs."""
    search_query = build_query(skills=skills, cv_text=cv_text, query=query)
    if location:
        search_query += f" {location}"

    params = {
        "query": search_query,
        "page": "1",
        "num_pages": str(num_pages),
        "date_posted": "month",
    }
    if job_type:
        params["employment_types"] = job_type
    if location:
        params["remote_jobs_only"] = "false"

    headers = {
        "X-RapidAPI-Key": JSEARCH_API_KEY,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(
            f"{JSEARCH_BASE_URL}/search",
            params=params,
            headers=headers,
        )
        response.raise_for_status()
        data = response.json()

    jobs = []
    for item in data.get("data", []):
        try:
            job = Job(
                job_id=item.get("job_id", ""),
                job_title=item.get("job_title", ""),
                employer_name=item.get("employer_name", ""),
                job_city=item.get("job_city"),
                job_country=item.get("job_country"),
                job_employment_type=item.get("job_employment_type"),
                job_min_salary=item.get("job_min_salary"),
                job_max_salary=item.get("job_max_salary"),
                job_salary_currency=item.get("job_salary_currency"),
                job_description=item.get("job_description"),
                job_apply_link=item.get("job_apply_link", "#"),
                job_posted_at_datetime_utc=item.get("job_posted_at_datetime_utc"),
                employer_logo=item.get("employer_logo"),
                job_publisher=item.get("job_publisher"),
            )
            jobs.append(job)
        except Exception as e:
            print(f"Job parse error: {e}")
            continue

    return jobs
