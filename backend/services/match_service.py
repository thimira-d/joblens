import os
import json
import re
from typing import Optional
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY", ""))


def clean_json(text: str) -> str:
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


def analyze_match(cv_text: str, job_description: str) -> dict:
    prompt = f"""You are a professional career advisor helping fresh graduates match their CVs to job descriptions.

Analyze the following CV and job description. Compare the skills, experience, and requirements carefully.

Return ONLY a valid JSON object with NO markdown, NO code fences, NO explanation. Use this exact structure:
{{
  "match_score": 75,
  "why_good_fit": "One clear sentence explaining why this person fits or does not fit the role.",
  "skill_gaps": ["Required skill 1", "Required skill 2"],
  "matching_skills": ["Matching skill 1", "Matching skill 2"],
  "summary": ["Summary bullet 1", "Summary bullet 2", "Summary bullet 3"],
  "recommendation": "Strong Match"
}}

Rules:
- match_score must be an integer between 0 and 100
- skill_gaps must list skills the job requires that are MISSING from the CV (empty array only if truly none)
- matching_skills must list skills found in BOTH the CV and job description
- summary must have 3 to 5 short bullet points describing the role
- recommendation must be exactly one of: "Strong Match", "Possible Match", or "Not a Match Yet"

CV:
{cv_text}

Job Description:
{job_description}"""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a career advisor. Return ONLY valid JSON. Do not use markdown or code fences."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=1200
        )
        raw = response.choices[0].message.content
        print(f"Groq raw response: {raw[:500]}")
        
        data = json.loads(clean_json(raw))
        print(f"Parsed data keys: {list(data.keys())}")
        
        return {
            "match_score": max(0, min(100, int(data.get("match_score", 50)))),
            "why_good_fit": data.get("why_good_fit") or "Analysis unavailable.",
            "skill_gaps": data.get("skill_gaps") if isinstance(data.get("skill_gaps"), list) else [],
            "matching_skills": data.get("matching_skills") if isinstance(data.get("matching_skills"), list) else [],
            "summary": data.get("summary") if isinstance(data.get("summary"), list) else [],
            "recommendation": data.get("recommendation") or "Not a Match Yet",
        }
    except Exception as e:
        print(f"Match analysis error: {e}")
        return {
            "match_score": 0,
            "why_good_fit": "Analysis failed, please try again",
            "skill_gaps": [],
            "matching_skills": [],
            "summary": [],
            "recommendation": "Not a Match Yet",
        }
