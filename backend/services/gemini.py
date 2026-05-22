import os
import json
import re
from typing import List
from groq import Groq
from dotenv import load_dotenv
from models.schemas import Job, UserProfileResponse, JobAnalysis, ParseCVResponse

load_dotenv()

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY", ""))


def clean_json(text: str) -> str:
    """Strip markdown code fences from AI response."""
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


async def parse_cv(cv_text: str) -> ParseCVResponse:
    """Extract structured info from CV text using Groq AI."""
    prompt = f"""Read this CV text and extract the following information:
- role: the person's current or most recent job title
- years_experience: total years of professional experience (integer)
- skills: array of technical and soft skills mentioned
- location: the person's location if mentioned

CV Text:
{cv_text[:4000]}

Return ONLY valid JSON in this exact format, no markdown:
{{
  "role": "string",
  "years_experience": 0,
  "skills": ["skill1", "skill2"],
  "location": "string"
}}"""
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a CV parser. Return ONLY valid JSON, no markdown or explanation."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=500
        )
        data = json.loads(clean_json(response.choices[0].message.content))
        return ParseCVResponse(**data)
    except Exception as e:
        print(f"CV parse error: {e}")
        return ParseCVResponse()


async def analyze_job(job: Job, user_profile: UserProfileResponse) -> JobAnalysis:
    """AI-analyze a single job against user profile using Groq AI."""
    profile_summary = f"""
Name: {user_profile.name}
Role: {user_profile.role}
Years of experience: {user_profile.years_experience}
Skills: {", ".join(user_profile.skills) if user_profile.skills else "Not specified"}
Location: {user_profile.location}
""".strip()

    job_summary = f"""
Job Title: {job.job_title}
Company: {job.employer_name}
Location: {job.job_city or 'N/A'}, {job.job_country or 'N/A'}
Type: {job.job_employment_type or 'N/A'}
Description:
{(job.job_description or "")[:3000]}
""".strip()

    prompt = f"""You are a career advisor helping a fresh graduate find their best job match.

USER PROFILE:
{profile_summary}

JOB POSTING:
{job_summary}

Analyze this match and return ONLY a JSON object (no markdown) with:
- match_score: integer 0-100 (how well this person matches this job)
- summary: array of 3-5 short bullet strings explaining the role and fit
- skill_gaps: array of skills mentioned in the job that the user lacks
- why_good_fit: one sentence explaining why this person is a good candidate

Be honest and accurate. Return only valid JSON, no markdown backticks."""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a career advisor. Return ONLY valid JSON, no markdown or explanation."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            max_tokens=800
        )
        data = json.loads(clean_json(response.choices[0].message.content))
        return JobAnalysis(
            match_score=max(0, min(100, int(data.get("match_score", 50)))),
            summary=data.get("summary") or [],
            skill_gaps=data.get("skill_gaps") or [],
            why_good_fit=data.get("why_good_fit") or "Analysis unavailable.",
        )
    except Exception as e:
        print(f"Job analysis error: {e}")
        return JobAnalysis(match_score=50, summary=[], skill_gaps=[], why_good_fit="Analysis unavailable.")


async def analyze_jobs_batch(jobs: List[Job], user_profile: UserProfileResponse) -> List[JobAnalysis]:
    """Analyze multiple jobs against user profile."""
    results = []
    for job in jobs:
        analysis = await analyze_job(job, user_profile)
        results.append(analysis)
    return results