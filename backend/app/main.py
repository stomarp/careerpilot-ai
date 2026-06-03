from fastapi import FastAPI
from sqlalchemy import text

from app.api import job_descriptions, resumes
from app.core.database import engine

app = FastAPI(
    title="CareerCopilot AI API",
    description="Backend API for resume analysis, ATS scoring, interview preparation, and application tracking.",
    version="0.1.0",
)

app.include_router(resumes.router)
app.include_router(job_descriptions.router)


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