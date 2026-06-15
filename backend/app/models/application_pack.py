from sqlalchemy import JSON, Column, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class ApplicationPack(Base):
    __tablename__ = "application_packs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    job_id = Column(Integer, ForeignKey("job_descriptions.id"), nullable=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=True, index=True)

    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=True)
    role_title = Column(String(255), nullable=False)
    pack_type = Column(String(80), nullable=False, default="full_pack")

    ats_score = Column(Integer, nullable=True)
    decision = Column(String(120), nullable=True)
    summary = Column(Text, nullable=True)
    content_markdown = Column(Text, nullable=False)
    artifacts = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user = relationship("User")
