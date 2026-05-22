from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from models.database import get_db, User
from models.schemas import UserProfileResponse, UserProfileUpdate
from routes.deps import get_current_user

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/profile", response_model=UserProfileResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/profile", response_model=UserProfileResponse)
def update_profile(
    data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    current_user.name = data.name
    current_user.role = data.role
    current_user.years_experience = data.years_experience
    current_user.skills = data.skills
    current_user.location = data.location
    current_user.cv_text = data.cv_text
    db.commit()
    db.refresh(current_user)
    return current_user


class EmailUpdateRequest(BaseModel):
    email: EmailStr


@router.put("/email")
def update_email(
    data: EmailUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing and existing.id != current_user.id:
        raise HTTPException(status_code=400, detail="Email already in use")
    current_user.email = data.email
    db.commit()
    return {"message": "Email updated successfully"}
