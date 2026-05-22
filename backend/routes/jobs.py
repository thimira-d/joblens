from fastapi import APIRouter, Depends, HTTPException
from typing import List

from models.schemas import (
    JobSearchRequest, Job, JobAnalyzeRequest, JobAnalysis,
    ParseCVRequest, ParseCVResponse
)
from services.adzuna import search_jobs as adzuna_search
from services.groq_jobs import generate_jobs_from_profile
from services.gemini import analyze_jobs_batch, parse_cv

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.post("/search", response_model=List[Job])
async def search(data: JobSearchRequest):
    """Search jobs using Adzuna API, fallback to Groq if unavailable."""
    try:
        jobs = await adzuna_search(
            skills=data.skills,
            cv_text=data.cv_text,
            location=data.location,
            job_type=data.job_type,
            query=data.query,
            num_pages=1,
        )
        return jobs
    except Exception as e:
        print(f"Adzuna failed, falling back to Groq: {e}")
        try:
            skills = data.skills or []
            jobs_data = generate_jobs_from_profile(
                skills=skills,
                location=data.location,
                job_type=data.job_type,
                num_jobs=8,
            )
            jobs = []
            for item in jobs_data:
                try:
                    job = Job(**item)
                    jobs.append(job)
                except Exception:
                    continue
            return jobs
        except Exception as e2:
            raise HTTPException(status_code=500, detail=f"Job search failed: {str(e2)}")


@router.post("/analyze", response_model=List[JobAnalysis])
async def analyze(data: JobAnalyzeRequest):
    """Analyze jobs with Gemini AI for match scores."""
    if not data.jobs:
        return []
    # Limit to 10 jobs per request to avoid timeout
    jobs_to_analyze = data.jobs[:10]
    try:
        analyses = await analyze_jobs_batch(jobs_to_analyze, data.user_profile)
        return analyses
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Job analysis failed: {str(e)}")


@router.post("/parse-cv", response_model=ParseCVResponse)
async def parse_cv_endpoint(data: ParseCVRequest):
    """Parse CV text and extract structured profile info."""
    if not data.cv_text.strip():
        raise HTTPException(status_code=400, detail="CV text is required")
    try:
        result = await parse_cv(data.cv_text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CV parsing failed: {str(e)}")
