from sqlalchemy import Column, Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.sql import func

from app.core.database import Base


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    company_name = Column(String, nullable=False)
    role_title = Column(String, nullable=False)
    job_url = Column(Text, nullable=True)
    job_location = Column(String, nullable=True)

    status = Column(String, default="saved", nullable=False)
    priority = Column(String, default="medium", nullable=False)

    source = Column(String, nullable=True)
    work_type = Column(String, nullable=True)
    employment_type = Column(String, nullable=True)

    salary_min = Column(Integer, nullable=True)
    salary_max = Column(Integer, nullable=True)
    salary_currency = Column(String, default="USD", nullable=True)

    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=True)
    job_description_id = Column(Integer, ForeignKey("job_descriptions.id"), nullable=True)

    ats_score = Column(Integer, nullable=True)
    match_score = Column(Float, nullable=True)

    recruiter_name = Column(String, nullable=True)
    recruiter_email = Column(String, nullable=True)
    contact_person = Column(String, nullable=True)

    saved_date = Column(Date, nullable=True)
    applied_date = Column(Date, nullable=True)
    oa_date = Column(Date, nullable=True)
    interview_date = Column(Date, nullable=True)
    follow_up_date = Column(Date, nullable=True)
    decision_date = Column(Date, nullable=True)

    notes = Column(Text, nullable=True)
    next_action = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )
