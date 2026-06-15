from sqlalchemy import JSON, Column, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class AnalysisReport(Base):
    __tablename__ = "analysis_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=True, index=True)
    job_id = Column(Integer, ForeignKey("job_descriptions.id"), nullable=True, index=True)

    title = Column(String(255), nullable=False)
    report_type = Column(String(100), nullable=False, default="ats_analysis")

    ats_score = Column(Integer, nullable=True)
    decision = Column(String(100), nullable=True)
    summary = Column(Text, nullable=True)

    matched_skills = Column(JSON, nullable=True)
    missing_skills = Column(JSON, nullable=True)
    recommendations = Column(JSON, nullable=True)
    raw_report = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    resume = relationship("Resume")
    job = relationship("JobDescription")
