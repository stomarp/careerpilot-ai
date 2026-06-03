from sqlalchemy import Column, Integer, Text, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.core.database import Base


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True)

    user_id = Column(Integer,
                     ForeignKey("users.id"),
                     nullable=False)

    filename = Column(String, nullable=False)

    parsed_text = Column(Text)

    created_at = Column(DateTime(timezone=True),
                        server_default=func.now())