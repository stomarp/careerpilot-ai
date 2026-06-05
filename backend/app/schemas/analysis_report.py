from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class AnalysisReportCreate(BaseModel):
    application_id: int | None = None
    resume_id: int | None = None
    job_description_id: int | None = None

    report_type: str = Field(
        examples=["ats_score", "resume_score", "ai_resume_optimizer"]
    )
    industry: str = "general"

    ats_score: int | None = Field(default=None, ge=0, le=100)
    provider_used: str | None = None
    fallback_used: bool = False

    title: str | None = None
    summary: str | None = None

    matching_skills: list[str] | None = None
    missing_skills: list[str] | None = None
    matched_keywords: list[str] | None = None
    missing_keywords: list[str] | None = None
    recommendations: list[str] | None = None

    section_feedback: list[dict[str, Any]] | None = None
    improved_bullets: list[dict[str, Any]] | None = None
    project_enhancements: list[dict[str, Any]] | None = None
    certifications_or_learning: list[str] | None = None

    raw_report_json: dict[str, Any]


class AnalysisReportResponse(BaseModel):
    id: int
    user_id: int

    application_id: int | None
    resume_id: int | None
    job_description_id: int | None

    report_type: str
    industry: str

    ats_score: int | None
    provider_used: str | None
    fallback_used: bool

    title: str | None
    summary: str | None

    matching_skills: list[str] | None
    missing_skills: list[str] | None
    matched_keywords: list[str] | None
    missing_keywords: list[str] | None
    recommendations: list[str] | None

    section_feedback: list[dict[str, Any]] | None
    improved_bullets: list[dict[str, Any]] | None
    project_enhancements: list[dict[str, Any]] | None
    certifications_or_learning: list[str] | None

    raw_report_json: dict[str, Any]

    created_at: datetime

    class Config:
        from_attributes = True


class AnalysisReportDashboardStats(BaseModel):
    total_reports: int
    ats_reports: int
    ai_optimizer_reports: int
    average_ats_score: float | None
    highest_ats_score: int | None
    lowest_ats_score: int | None


class AnalysisReportTypeOption(BaseModel):
    value: str
    label: str
