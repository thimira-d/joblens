from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime


# Auth schemas
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# User schemas
class UserProfileResponse(BaseModel):
    id: Optional[int] = None
    email: Optional[str] = None
    name: str
    role: str = ""
    years_experience: int = 0
    skills: List[str] = []
    location: str = ""
    cv_text: str = ""

    class Config:
        from_attributes = True


class UserProfileUpdate(BaseModel):
    name: str
    role: str = ""
    years_experience: int = 0
    skills: List[str] = []
    location: str = ""
    cv_text: str = ""


# Job schemas
class JobSearchRequest(BaseModel):
    cv_text: Optional[str] = None
    skills: Optional[List[str]] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    query: Optional[str] = None


class Job(BaseModel):
    job_id: str
    job_title: str
    employer_name: str
    job_city: Optional[str] = None
    job_country: Optional[str] = None
    job_employment_type: Optional[str] = None
    job_min_salary: Optional[float] = None
    job_max_salary: Optional[float] = None
    job_salary_currency: Optional[str] = None
    job_description: Optional[str] = None
    job_apply_link: Optional[str] = None
    job_posted_at_datetime_utc: Optional[str] = None
    employer_logo: Optional[str] = None
    job_publisher: Optional[str] = None


class JobAnalysis(BaseModel):
    match_score: int
    summary: List[str]
    skill_gaps: List[str]
    why_good_fit: str


class JobAnalyzeRequest(BaseModel):
    jobs: List[Job]
    user_profile: UserProfileResponse


class ParseCVRequest(BaseModel):
    cv_text: str


class ParseCVResponse(BaseModel):
    role: Optional[str] = None
    years_experience: Optional[int] = None
    skills: Optional[List[str]] = None
    location: Optional[str] = None


# Saved Job schemas
class SaveJobRequest(BaseModel):
    job_id: str
    job_title: str
    company: str
    match_score: Optional[float] = None
    skill_gaps: Optional[List[str]] = None
    matching_skills: Optional[List[str]] = None
    why_good_fit: Optional[str] = None
    recommendation: Optional[str] = None
    job_description: Optional[str] = None
    saved_type: Optional[str] = "job_search"


class SavedJobResponse(BaseModel):
    id: int
    job_id: str
    job_title: str
    company: str
    match_score: Optional[float] = None
    skill_gaps: Optional[List[str]] = None
    matching_skills: Optional[List[str]] = None
    why_good_fit: Optional[str] = None
    recommendation: Optional[str] = None
    job_description: Optional[str] = None
    saved_type: Optional[str] = "job_search"
    date_saved: datetime

    class Config:
        from_attributes = True
