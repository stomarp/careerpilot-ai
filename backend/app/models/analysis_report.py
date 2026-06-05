from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func

from app.core.database import Base


class AnalysisReport(Base):
    __tablename__ = "analysis_reports"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    application_id = Column(Integer, ForeignKey("applications.id"), nullable=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=True)
    job_description_id = Column(Integer, ForeignKey("job_descriptions.id"), nullable=True)

    report_type = Column(String, nullable=False)
    industry = Column(String, default="general", nullable=False)

    ats_score = Column(Integer, nullable=True)
    provider_used = Column(String, nullable=True)
    fallback_used = Column(Boolean, default=False, nullable=False)

    title = Column(String, nullable=True)
    summary = Column(Text, nullable=True)

    matching_skills = Column(JSONB, nullable=True)
    missing_skills = Column(JSONB, nullable=True)
    matched_keywords = Column(JSONB, nullable=True)
    missing_keywords = Column(JSONB, nullable=True)
    recommendations = Column(JSONB, nullable=True)

    section_feedback = Column(JSONB, nullable=True)
    improved_bullets = Column(JSONB, nullable=True)
    project_enhancements = Column(JSONB, nullable=True)
    certifications_or_learning = Column(JSONB, nullable=True)

    raw_report_json = Column(JSONB, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
