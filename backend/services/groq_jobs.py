import os
import json
from typing import List, Optional
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY", ""))


def generate_job_description(role: str, company: str, location: str, job_type: str) -> str:
    """Generate a job description using Groq."""
    try:
        prompt = f"""Generate a realistic job description for a {role} position at {company} in {location}. 
        Include: responsibilities, requirements, and what makes this role exciting for fresh graduates.
        Keep it concise, around 200 words. Format with bullet points for key requirements."""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a professional job description writer. Create realistic, engaging job postings suitable for fresh graduates."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )

        return response.choices[0].message.content or "Job description coming soon."
    except Exception as e:
        print(f"Groq job description error: {e}")
        return f"We are looking for a talented {role} to join our team. This is a great opportunity for fresh graduates to grow and learn."    


def generate_jobs_from_profile(
    skills: List[str],
    location: Optional[str] = None,
    job_type: Optional[str] = None,
    num_jobs: int = 8
) -> List[dict]:
    """Generate job listings based on user skills profile using Groq."""
    
    skills_str = ", ".join(skills[:5]) if skills else "software development"
    location_str = location or "United States"
    job_type_str = job_type or "FULLTIME"
    
    type_map = {
        "FULLTIME": "Full-time",
        "PARTTIME": "Part-time",
        "INTERN": "Internship",
        "CONTRACTOR": "Contract"
    }
    job_type_label = type_map.get(job_type_str, "Full-time")
    
    try:
        prompt = f"""Generate {num_jobs} realistic job listings for someone with skills in {skills_str}.
        Location: {location_str}
        Job Type: {job_type_label}
        
        Return ONLY a valid JSON array with exactly {num_jobs} jobs. Each job should have this exact structure:
        [
          {{
            "job_id": "gen-1",
            "job_title": "Job Title Here",
            "employer_name": "Company Name",
            "job_city": "City",
            "job_country": "Country",
            "job_employment_type": "{job_type_str}",
            "job_min_salary": 50000,
            "job_max_salary": 80000,
            "job_salary_currency": "USD",
            "job_description": "Description with responsibilities and requirements...",
            "job_apply_link": "https://example.com/apply",
            "job_publisher": "LinkedIn",
            "job_posted_at_datetime_utc": "2024-01-15T00:00:00"
          }}
        ]
        
        IMPORTANT: Return ONLY the JSON array, nothing else. Make the job titles and companies realistic and varied."""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a job listing generator. Return ONLY valid JSON array with exact structure specified."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.8,
            max_tokens=4000
        )

        content = response.choices[0].message.content
        
        if content:
            content = content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            
            jobs = json.loads(content.strip())
            return jobs[:num_jobs]
            
    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}")
    except Exception as e:
        print(f"Groq job generation error: {e}")
    
    return get_fallback_jobs(skills_str, location_str, job_type_str)


def get_fallback_jobs(skills: str, location: str, job_type: str) -> List[dict]:
    """Fallback jobs if Groq fails."""
    base_jobs = [
        {
            "job_id": "fallback-1",
            "job_title": f"Junior Developer",
            "employer_name": "Tech Innovations Inc",
            "job_city": location.split(",")[0].strip() if "," in location else location,
            "job_country": "United States",
            "job_employment_type": job_type,
            "job_min_salary": 65000,
            "job_max_salary": 85000,
            "job_salary_currency": "USD",
            "job_description": f"Join our team as a Junior Developer! You'll work with {skills} and other modern technologies. Great opportunity for fresh graduates with strong problem-solving skills. We offer mentorship and career growth.",
            "job_apply_link": "https://example.com/apply/1",
            "job_publisher": "LinkedIn",
            "job_posted_at_datetime_utc": "2024-01-15T00:00:00"
        },
        {
            "job_id": "fallback-2",
            "job_title": f"Software Engineer I",
            "employer_name": "CloudScale Systems",
            "job_city": "San Francisco",
            "job_country": "United States",
            "job_employment_type": job_type,
            "job_min_salary": 75000,
            "job_max_salary": 95000,
            "job_salary_currency": "USD",
            "job_description": f"Looking for a Software Engineer to help build our next-generation platform. Experience with {skills} preferred. We provide training and mentorship for new graduates.",
            "job_apply_link": "https://example.com/apply/2",
            "job_publisher": "Indeed",
            "job_posted_at_datetime_utc": "2024-01-10T00:00:00"
        },
        {
            "job_id": "fallback-3",
            "job_title": f"Frontend Developer",
            "employer_name": "WebDesign Pro",
            "job_city": "New York",
            "job_country": "United States",
            "job_employment_type": job_type,
            "job_min_salary": 60000,
            "job_max_salary": 80000,
            "job_salary_currency": "USD",
            "job_description": f"Create beautiful web experiences with {skills}. We value creativity and offer a collaborative work environment perfect for new developers.",
            "job_apply_link": "https://example.com/apply/3",
            "job_publisher": "Glassdoor",
            "job_posted_at_datetime_utc": "2024-01-08T00:00:00"
        },
        {
            "job_id": "fallback-4",
            "job_title": f"Data Analyst",
            "employer_name": "DataDriven Corp",
            "job_city": "Seattle",
            "job_country": "United States",
            "job_employment_type": job_type,
            "job_min_salary": 55000,
            "job_max_salary": 75000,
            "job_salary_currency": "USD",
            "job_description": f"Help us make sense of data! Working with {skills} and visualization tools. Perfect for graduates with analytical mindset.",
            "job_apply_link": "https://example.com/apply/4",
            "job_publisher": "ZipRecruiter",
            "job_posted_at_datetime_utc": "2024-01-05T00:00:00"
        },
        {
            "job_id": "fallback-5",
            "job_title": f"Backend Engineer",
            "employer_name": "APIFirst Labs",
            "job_city": "Austin",
            "job_country": "United States",
            "job_employment_type": job_type,
            "job_min_salary": 70000,
            "job_max_salary": 90000,
            "job_salary_currency": "USD",
            "job_description": f"Build scalable backend systems using {skills}. We follow modern practices and provide mentorship for career growth.",
            "job_apply_link": "https://example.com/apply/5",
            "job_publisher": "LinkedIn",
            "job_posted_at_datetime_utc": "2024-01-03T00:00:00"
        },
        {
            "job_id": "fallback-6",
            "job_title": f"QA Engineer",
            "employer_name": "QualityFirst Technologies",
            "job_city": "Boston",
            "job_country": "United States",
            "job_employment_type": job_type,
            "job_min_salary": 50000,
            "job_max_salary": 70000,
            "job_salary_currency": "USD",
            "job_description": f"Ensure our products are top quality! Experience with {skills} is a plus. Great entry point for those starting in tech.",
            "job_apply_link": "https://example.com/apply/6",
            "job_publisher": "Indeed",
            "job_posted_at_datetime_utc": "2024-01-01T00:00:00"
        },
        {
            "job_id": "fallback-7",
            "job_title": f"DevOps Engineer",
            "employer_name": "CloudNative Solutions",
            "job_city": "Denver",
            "job_country": "United States",
            "job_employment_type": job_type,
            "job_min_salary": 75000,
            "job_max_salary": 100000,
            "job_salary_currency": "USD",
            "job_description": f"Join our DevOps team! Working with {skills} and cloud technologies. We value continuous learning and innovation.",
            "job_apply_link": "https://example.com/apply/7",
            "job_publisher": "Glassdoor",
            "job_posted_at_datetime_utc": "2023-12-28T00:00:00"
        },
        {
            "job_id": "fallback-8",
            "job_title": f"Full Stack Developer",
            "employer_name": "StartupXYZ",
            "job_city": "Los Angeles",
            "job_country": "United States",
            "job_employment_type": job_type,
            "job_min_salary": 65000,
            "job_max_salary": 85000,
            "job_salary_currency": "USD",
            "job_description": f"Work on both frontend and backend! Proficiency in {skills} required. Fast-paced startup environment with equity options.",
            "job_apply_link": "https://example.com/apply/8",
            "job_publisher": "LinkedIn",
            "job_posted_at_datetime_utc": "2023-12-25T00:00:00"
        },
    ]
    return base_jobs