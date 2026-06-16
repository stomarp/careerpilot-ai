from sqlalchemy import JSON, Boolean, Column, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class AnalysisReport(Base):
    __tablename__ = "analysis_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=True, index=True)
    job_description_id = Column(Integer, ForeignKey("job_descriptions.id"), nullable=True, index=True)

    report_type = Column(String, nullable=False)
    industry = Column(String, nullable=False, default="general")

    ats_score = Column(Integer, nullable=True)
    provider_used = Column(String, nullable=True)
    fallback_used = Column(Boolean, nullable=False, default=False)

    title = Column(String, nullable=True)
    summary = Column(Text, nullable=True)

    matching_skills = Column(JSON, nullable=True)
    missing_skills = Column(JSON, nullable=True)
    matched_keywords = Column(JSON, nullable=True)
    missing_keywords = Column(JSON, nullable=True)
    recommendations = Column(JSON, nullable=True)

    section_feedback = Column(JSON, nullable=True)
    improved_bullets = Column(JSON, nullable=True)
    project_enhancements = Column(JSON, nullable=True)
    certifications_or_learning = Column(JSON, nullable=True)

    raw_report_json = Column(JSON, nullable=False, default=dict)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    application = relationship("Application")
    resume = relationship("Resume")
    job_description = relationship("JobDescription")
