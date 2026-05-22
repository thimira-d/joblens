from sqlalchemy import create_engine, Column, Integer, String, Float, JSON, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./joblens.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, default="")
    years_experience = Column(Integer, default=0)
    skills = Column(JSON, default=[])
    location = Column(String, default="")
    cv_text = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    saved_jobs = relationship("SavedJob", back_populates="user", cascade="all, delete-orphan")


class SavedJob(Base):
    __tablename__ = "saved_jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id = Column(String, nullable=False, index=True)
    job_title = Column(String, default="")
    company = Column(String, default="")
    match_score = Column(Float, nullable=True)
    skill_gaps = Column(JSON, nullable=True)
    matching_skills = Column(JSON, nullable=True)
    why_good_fit = Column(String, nullable=True)
    recommendation = Column(String, nullable=True)
    job_description = Column(Text, nullable=True)
    saved_type = Column(String, default="job_search")
    date_saved = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="saved_jobs")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    Base.metadata.create_all(bind=engine)
