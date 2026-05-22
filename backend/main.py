from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import os

from models.database import create_tables
from routes.auth import router as auth_router
from routes.jobs import router as jobs_router
from routes.users import router as users_router
from routes.saved import router as saved_router
from routes.match import router as match_router

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    yield

app = FastAPI(
    title="JobLens API",
    description="AI-powered job matching platform for fresh graduates",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://joblens.online",
        "https://www.joblens.online",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(jobs_router)
app.include_router(users_router)
app.include_router(saved_router)
app.include_router(match_router)

@app.get("/")
def health_check():
    return {"status": "ok", "app": "JobLens API", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "healthy"}