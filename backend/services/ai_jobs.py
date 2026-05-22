import httpx
import os
import time
import json
from groq import Groq

# ─────────────────────────────────────────
# API CREDENTIALS
# ─────────────────────────────────────────
ADZUNA_APP_ID = os.getenv("ADZUNA_APP_ID")
ADZUNA_APP_KEY = os.getenv("ADZUNA_APP_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

groq_client = Groq(api_key=GROQ_API_KEY)

# ─────────────────────────────────────────
# CACHE (30 minute search cache)
# ─────────────────────────────────────────
search_cache = {}
CACHE_DURATION = 1800  # 30 minutes in seconds


# ─────────────────────────────────────────
# ADZUNA — JOB SEARCH
# ─────────────────────────────────────────
async def search_jobs(job_role: str, location: str, country: str = "us"):
    cache_key = f"{job_role}_{location}_{country}"
    cached = search_cache.get(cache_key)

    # Return cached result if still fresh
    if cached and time.time() - cached["time"] < CACHE_DURATION:
        return cached["data"]

    url = f"https://api.adzuna.com/v1/api/jobs/{country}/search/1"

    params = {
        "app_id": ADZUNA_APP_ID,
        "app_key": ADZUNA_APP_KEY,
        "what": job_role,
        "where": location,
        "results_per_page": 20,
        "content-type": "application/json"
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        data = response.json()

    jobs = []
    for job in data.get("results", []):
        jobs.append({
            "job_id":      job.get("id"),
            "title":       job.get("title"),
            "company":     job.get("company", {}).get("display_name"),
            "location":    job.get("location", {}).get("display_name"),
            "salary_min":  job.get("salary_min"),
            "salary_max":  job.get("salary_max"),
            "description": job.get("description"),
            "apply_url":   job.get("redirect_url"),
            "date_posted": job.get("created"),
            "job_type":    job.get("contract_time"),
            "source":      "Adzuna"
        })

    # Save to cache
    search_cache[cache_key] = {"data": jobs, "time": time.time()}
    return jobs


# ─────────────────────────────────────────
# GROQ — CV PARSER
# ─────────────────────────────────────────
def parse_cv(cv_text: str) -> dict:
    prompt = f"""
Read this CV text and extract the following fields.
Return ONLY valid JSON, no markdown, no explanation:
{{
  "current_role": "string",
  "years_experience": 0,
  "skills": ["skill1", "skill2"],
  "location": "string"
}}

CV text:
{cv_text}
"""
    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )

    return json.loads(response.choices[0].message.content)


# ─────────────────────────────────────────
# GROQ — JOB ANALYZER
# ─────────────────────────────────────────
def analyze_job(job_description: str, user_profile: dict) -> dict:
    prompt = f"""
You are a career advisor for fresh graduates.
Given this user profile and job description, return ONLY valid JSON, 
no markdown, no explanation:
{{
  "match_score": 85,
  "summary": [
    "bullet point 1",
    "bullet point 2",
    "bullet point 3"
  ],
  "skill_gaps": ["missing skill 1", "missing skill 2"],
  "why_good_fit": "One sentence explaining why the user is a good fit"
}}

User profile:
{json.dumps(user_profile)}

Job description:
{job_description}
"""
    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )

    return json.loads(response.choices[0].message.content)


# ─────────────────────────────────────────
# GROQ — BATCH JOB ANALYZER
# Analyzes multiple jobs at once
# ─────────────────────────────────────────
def analyze_jobs_batch(jobs: list, user_profile: dict) -> list:
    analyzed = []
    for job in jobs:
        try:
            ai_result = analyze_job(
                job_description=job.get("description", ""),
                user_profile=user_profile
            )
            analyzed.append({**job, **ai_result})
        except Exception as e:
            # If AI fails on one job, skip it gracefully
            analyzed.append({
                **job,
                "match_score": 0,
                "summary": [],
                "skill_gaps": [],
                "why_good_fit": "Analysis unavailable"
            })
    return analyzed