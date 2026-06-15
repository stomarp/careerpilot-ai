from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api import (
    application_packs,
    analysis,
    analysis_reports,
    applications,
    auth,
    interview,
    job_descriptions,
    learning_roadmap,
    resume_builder,
    resumes,
)
from app.core.config import settings
from app.core.database import engine

app = FastAPI(
    title="CareerCopilot AI API",
    description="Backend API for resume analysis, ATS scoring, interview preparation, and application tracking.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resumes.router)
app.include_router(application_packs.router)
app.include_router(job_descriptions.router)
app.include_router(analysis.router)
app.include_router(resume_builder.router)
app.include_router(applications.router)
app.include_router(analysis_reports.router)
app.include_router(learning_roadmap.router)
app.include_router(auth.router)
app.include_router(interview.router)


@app.get("/health")
def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "database": "connected",
        }
    except Exception:
        return {
            "status": "unhealthy",
            "database": "disconnected",
        }



@app.get("/ready")
def readiness_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {
            "status": "ready",
            "environment": settings.ENVIRONMENT,
            "database": "connected",
            "cors_origins": settings.cors_origins,
        }
    except Exception:
        return {
            "status": "not_ready",
            "environment": settings.ENVIRONMENT,
            "database": "disconnected",
        }
