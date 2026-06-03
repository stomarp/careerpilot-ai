from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.core.database import Base


class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True)

    user_id = Column(Integer,
                     ForeignKey("users.id"),
                     nullable=False)

    title = Column(String, nullable=False)

    company = Column(String)

    description = Column(Text)

    created_at = Column(DateTime(timezone=True),
                        server_default=func.now())