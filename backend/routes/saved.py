from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from models.database import get_db, User, SavedJob
from models.schemas import SaveJobRequest, SavedJobResponse
from routes.deps import get_current_user

router = APIRouter(prefix="/saved", tags=["saved"])


@router.post("/", response_model=SavedJobResponse)
def save_job(
    data: SaveJobRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = db.query(SavedJob).filter(
        SavedJob.user_id == current_user.id,
        SavedJob.job_id == data.job_id
    ).first()
    if existing:
        return existing

    saved = SavedJob(
        user_id=current_user.id,
        job_id=data.job_id,
        job_title=data.job_title,
        company=data.company,
        match_score=data.match_score,
        skill_gaps=data.skill_gaps,
        matching_skills=data.matching_skills,
        why_good_fit=data.why_good_fit,
        recommendation=data.recommendation,
        job_description=data.job_description,
        saved_type=data.saved_type or "job_search",
    )
    db.add(saved)
    db.commit()
    db.refresh(saved)
    return saved


@router.get("/", response_model=List[SavedJobResponse])
def get_saved_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(SavedJob).filter(SavedJob.user_id == current_user.id).all()


@router.delete("/{job_id}")
def remove_saved_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    saved = db.query(SavedJob).filter(
        SavedJob.user_id == current_user.id,
        SavedJob.job_id == job_id,
    ).first()
    if not saved:
        raise HTTPException(status_code=404, detail="Saved job not found")
    db.delete(saved)
    db.commit()
    return {"message": "Job removed from saved"}
